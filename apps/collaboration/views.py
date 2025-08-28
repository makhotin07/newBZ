from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth.hashers import check_password
from django.http import Http404

from .models import ActiveSession, ShareLink, CollaborativeEdit
from .serializers import (
    ActiveSessionSerializer, ShareLinkSerializer, CreateShareLinkSerializer,
    ShareLinkAccessSerializer, SharedContentSerializer
)
from apps.notes.models import Page
from apps.databases.models import Database


class ShareLinkListView(ListCreateAPIView):
    serializer_class = ShareLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ShareLink.objects.filter(
            created_by=self.request.user
        ).select_related('page', 'database', 'created_by').order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateShareLinkSerializer
        return ShareLinkSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = CreateShareLinkSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            share_link = serializer.save()
            response_serializer = ShareLinkSerializer(share_link, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SharedContentView(APIView):
    """Access shared content via share link"""
    permission_classes = []  # Allow anonymous access
    
    def get(self, request, token):
        share_link = get_object_or_404(ShareLink, token=token, is_active=True)
        
        # Check if expired
        if share_link.expires_at and share_link.expires_at < timezone.now():
            return Response(
                {'error': 'Share link has expired'}, 
                status=status.HTTP_410_GONE
            )
        
        # Check password if required
        if share_link.password:
            password = request.query_params.get('password') or request.data.get('password')
            if not password or not check_password(password, share_link.password):
                return Response(
                    {'error': 'Password required', 'requires_password': True}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        # Update view count and last accessed
        share_link.view_count += 1
        share_link.last_accessed = timezone.now()
        share_link.save(update_fields=['view_count', 'last_accessed'])
        
        # Get content based on type
        if share_link.page:
            content_data = self.get_page_data(share_link.page, share_link.permission)
        elif share_link.database:
            content_data = self.get_database_data(share_link.database, share_link.permission)
        else:
            return Response(
                {'error': 'Invalid share link'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add share link metadata
        content_data.update({
            'permission': share_link.permission,
            'view_count': share_link.view_count,
            'shared_by': share_link.created_by.full_name,
            'shared_at': share_link.created_at
        })
        
        return Response(content_data)
    
    def post(self, request, token):
        """For password-protected share links"""
        serializer = ShareLinkAccessSerializer(data=request.data)
        if serializer.is_valid():
            # Redirect to GET with password
            request.data['password'] = serializer.validated_data.get('password', '')
            return self.get(request, token)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_page_data(self, page, permission):
        """Get page data for sharing"""
        data = {
            'type': 'page',
            'id': str(page.id),
            'title': page.title,
            'icon': page.icon,
            'cover_image': page.cover_image.url if page.cover_image else None,
            'workspace_name': page.workspace.name,
            'created_at': page.created_at,
            'updated_at': page.updated_at,
            'author_name': page.author.full_name,
        }
        
        # Include content based on permission
        if permission in ['read', 'comment', 'edit']:
            data['content'] = page.content
            
            # Include blocks if available
            from apps.notes.serializers import BlockSerializer
            blocks = page.blocks.filter(parent_block__isnull=True).order_by('position')
            data['blocks'] = BlockSerializer(blocks, many=True).data
            
            # Include comments if permission allows
            if permission in ['comment', 'edit']:
                from apps.notes.serializers import CommentSerializer
                comments = page.comments.filter(parent__isnull=True).order_by('-created_at')[:10]
                data['comments'] = CommentSerializer(comments, many=True).data
        
        return data
    
    def get_database_data(self, database, permission):
        """Get database data for sharing"""
        data = {
            'type': 'database',
            'id': str(database.id),
            'title': database.title,
            'description': database.description,
            'icon': database.icon,
            'default_view': database.default_view,
            'workspace_name': database.workspace.name,
            'created_at': database.created_at,
            'updated_at': database.updated_at,
        }
        
        # Include properties and records based on permission
        if permission in ['read', 'comment', 'edit']:
            from apps.databases.serializers import DatabasePropertySerializer, DatabaseRecordSerializer
            
            # Include properties
            properties = database.properties.filter(is_visible=True).order_by('position')
            data['properties'] = DatabasePropertySerializer(properties, many=True).data
            
            # Include records (limit to first 100 for performance)
            records = database.records.all().order_by('-updated_at')[:100]
            data['records'] = DatabaseRecordSerializer(records, many=True).data
        
        return data


class ActiveSessionListView(ListCreateAPIView):
    serializer_class = ActiveSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        page_id = self.kwargs.get('page_id')
        database_id = self.kwargs.get('database_id')
        
        queryset = ActiveSession.objects.select_related('user')
        
        if page_id:
            queryset = queryset.filter(page_id=page_id)
        elif database_id:
            queryset = queryset.filter(database_id=database_id)
        
        # Filter sessions from last 5 minutes
        from datetime import timedelta
        cutoff = timezone.now() - timedelta(minutes=5)
        queryset = queryset.filter(last_seen__gte=cutoff)
        
        return queryset.order_by('-last_seen')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_share_link(request):
    """Create a share link for a page or database"""
    serializer = CreateShareLinkSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        share_link = serializer.save()
        response_serializer = ShareLinkSerializer(share_link, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def revoke_share_link(request, token):
    """Revoke (deactivate) a share link"""
    share_link = get_object_or_404(ShareLink, token=token, created_by=request.user)
    share_link.is_active = False
    share_link.save()
    return Response({'message': 'Share link revoked successfully'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def share_link_stats(request, token):
    """Get statistics for a share link"""
    share_link = get_object_or_404(ShareLink, token=token, created_by=request.user)
    
    stats = {
        'total_views': share_link.view_count,
        'last_accessed': share_link.last_accessed,
        'created_at': share_link.created_at,
        'is_active': share_link.is_active,
        'is_expired': share_link.expires_at and share_link.expires_at < timezone.now(),
        'permission': share_link.permission,
        'has_password': bool(share_link.password),
    }
    
    # Add content info
    if share_link.page:
        stats['content'] = {
            'type': 'page',
            'title': share_link.page.title,
            'workspace': share_link.page.workspace.name
        }
    elif share_link.database:
        stats['content'] = {
            'type': 'database',
            'title': share_link.database.title,
            'workspace': share_link.database.workspace.name
        }
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_cursor_position(request, page_id):
    """Update user's cursor position for collaborative editing"""
    from .serializers import CursorPositionSerializer
    
    page = get_object_or_404(Page, id=page_id)
    
    # Check if user has access to the page
    if not page.workspace.members.filter(user=request.user).exists():
        return Response(
            {'error': 'Access denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = CursorPositionSerializer(data=request.data)
    if serializer.is_valid():
        cursor_data = serializer.validated_data
        
        # Update or create active session
        session, created = ActiveSession.objects.update_or_create(
            user=request.user,
            page=page,
            defaults={
                'cursor_position': cursor_data,
                'last_seen': timezone.now()
            }
        )
        
        # Broadcast cursor position via WebSocket (handled in consumers.py)
        return Response({'message': 'Cursor position updated'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_collaborative_edit(request, page_id):
    """Save a collaborative edit operation"""
    from .serializers import OperationalTransformSerializer
    
    page = get_object_or_404(Page, id=page_id)
    
    # Check if user has edit access
    if not page.workspace.members.filter(user=request.user).exists():
        return Response(
            {'error': 'Access denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = OperationalTransformSerializer(data=request.data)
    if serializer.is_valid():
        operation_data = serializer.validated_data
        
        # Get next version number
        last_edit = CollaborativeEdit.objects.filter(page=page).order_by('-version').first()
        next_version = (last_edit.version + 1) if last_edit else 1
        
        # Save edit
        edit = CollaborativeEdit.objects.create(
            page=page,
            user=request.user,
            operation=operation_data,
            version=next_version
        )
        
        # Broadcast operation via WebSocket (handled in consumers.py)
        return Response({
            'version': edit.version,
            'message': 'Edit saved successfully'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
