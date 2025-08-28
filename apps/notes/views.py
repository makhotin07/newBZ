from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Tag, Page, Block, PageVersion, Comment, PageView
from .serializers import (
    TagSerializer, PageListSerializer, PageDetailSerializer,
    PageCreateSerializer, BlockSerializer, CommentSerializer,
    PageVersionSerializer
)
from apps.workspaces.models import Workspace, WorkspaceMember

User = get_user_model()


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Tag.objects.all().order_by('name')


class PageViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PageCreateSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return PageDetailSerializer
        return PageListSerializer
    
    def get_queryset(self):
        # Get pages from user's workspaces
        user_workspaces = Workspace.objects.filter(
            members__user=self.request.user
        ).values_list('id', flat=True)
        
        queryset = Page.objects.filter(
            workspace__in=user_workspaces,
            is_deleted=False
        ).select_related('author', 'last_edited_by', 'workspace').prefetch_related('tags')
        
        # Filter by workspace if specified
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        # Filter by parent if specified
        parent_id = self.request.query_params.get('parent')
        if parent_id:
            if parent_id == 'null':
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
        
        # Filter archived/templates
        show_archived = self.request.query_params.get('archived', 'false').lower() == 'true'
        show_templates = self.request.query_params.get('templates', 'false').lower() == 'true'
        
        if not show_archived:
            queryset = queryset.filter(is_archived=False)
        if not show_templates:
            queryset = queryset.filter(is_template=False)
        
        return queryset.order_by('position', '-updated_at')
    
    def perform_create(self, serializer):
        # Create initial version
        page = serializer.save()
        PageVersion.objects.create(
            page=page,
            version_number=1,
            title=page.title,
            content=page.content,
            content_text=page.content_text,
            created_by=self.request.user
        )
    
    def perform_update(self, serializer):
        page = serializer.save()
        
        # Create new version
        last_version = page.versions.first()
        new_version_number = (last_version.version_number + 1) if last_version else 1
        
        PageVersion.objects.create(
            page=page,
            version_number=new_version_number,
            title=page.title,
            content=page.content,
            content_text=page.content_text,
            created_by=self.request.user
        )
    
    def perform_destroy(self, instance):
        # Soft delete
        instance.is_deleted = True
        instance.save()
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        page = self.get_object()
        page.is_archived = not page.is_archived
        page.save()
        
        action_word = 'archived' if page.is_archived else 'unarchived'
        return Response({'message': f'Page {action_word} successfully'})
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        original_page = self.get_object()
        
        # Create duplicate
        duplicate_page = Page.objects.create(
            title=f"{original_page.title} (Copy)",
            content=original_page.content,
            content_text=original_page.content_text,
            icon=original_page.icon,
            workspace=original_page.workspace,
            parent=original_page.parent,
            author=request.user,
            last_edited_by=request.user,
            permissions=original_page.permissions
        )
        
        # Copy tags
        duplicate_page.tags.set(original_page.tags.all())
        
        # Copy blocks
        for block in original_page.blocks.all():
            Block.objects.create(
                page=duplicate_page,
                type=block.type,
                content=block.content,
                position=block.position
            )
        
        serializer = self.get_serializer(duplicate_page)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        page = self.get_object()
        children = page.children.filter(is_deleted=False).order_by('position')
        serializer = PageListSerializer(children, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='shares')
    def shares(self, request, pk=None):
        """
        Возвращает информацию о доступе/шаре страницы.
        Пока без индивидуальных инвайтов: только режим доступа страницы.
        """
        page = self.get_object()
        data = {
            'share_type': page.permissions if page.permissions in ['private', 'workspace', 'public'] else 'workspace',
            'public_access': page.permissions == 'public',
            'shares': [],
        }
        return Response(data)

    @action(detail=True, methods=['post'], url_path='share')
    def share(self, request, pk=None):
        """
        Устанавливает режим доступа страницы.
        Ожидает: { share_type: 'public' | 'private' | 'workspace', public_access?: boolean }
        """
        page = self.get_object()
        share_type = request.data.get('share_type')
        public_access = request.data.get('public_access', None)

        valid = {'private', 'workspace', 'public'}
        if share_type not in valid and public_access is None:
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)

        # Приоритет explicit share_type
        if share_type in valid:
            page.permissions = share_type
        elif isinstance(public_access, bool):
            page.permissions = 'public' if public_access else 'workspace'

        page.save(update_fields=['permissions'])

        return Response({
            'message': 'Share settings updated',
            'share_type': page.permissions,
            'public_access': page.permissions == 'public',
        }, status=status.HTTP_200_OK)


class BlockListView(ListCreateAPIView):
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        page_id = self.kwargs['page_id']
        page = get_object_or_404(Page, id=page_id)
        return page.blocks.filter(parent_block__isnull=True).order_by('position')
    
    def perform_create(self, serializer):
        page_id = self.kwargs['page_id']
        page = get_object_or_404(Page, id=page_id)
        serializer.save(page=page)


class BlockDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'block_id'


class CommentListView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        page_id = self.kwargs['page_id']
        page = get_object_or_404(Page, id=page_id)
        return page.comments.filter(parent__isnull=True).order_by('-created_at')
    
    def perform_create(self, serializer):
        page_id = self.kwargs['page_id']
        page = get_object_or_404(Page, id=page_id)
        serializer.save(page=page)


class CommentDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'comment_id'
    
    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.author != self.request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        super().perform_destroy(instance)


class PageVersionListView(ListCreateAPIView):
    serializer_class = PageVersionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        page_id = self.kwargs['page_id']
        page = get_object_or_404(Page, id=page_id)
        return page.versions.all()


class SearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'pages': [], 'message': 'No search query provided'})
        
        # Get user's workspaces
        user_workspaces = Workspace.objects.filter(
            members__user=request.user
        ).values_list('id', flat=True)
        
        # Search in pages
        pages = Page.objects.filter(
            workspace__in=user_workspaces,
            is_deleted=False
        ).filter(
            Q(title__icontains=query) | 
            Q(content_text__icontains=query)
        ).select_related('author', 'workspace').prefetch_related('tags')
        
        # Filter by workspace if specified
        workspace_id = request.query_params.get('workspace')
        if workspace_id:
            pages = pages.filter(workspace_id=workspace_id)
        
        serializer = PageListSerializer(pages, many=True, context={'request': request})
        return Response({
            'pages': serializer.data,
            'count': pages.count(),
            'query': query
        })
