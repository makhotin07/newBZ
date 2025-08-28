from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import secrets
import string

from .models import Workspace, WorkspaceMember, WorkspaceInvitation
from .serializers import (
    WorkspaceSerializer, WorkspaceDetailSerializer, 
    WorkspaceMemberSerializer, WorkspaceInvitationSerializer,
    InviteUserSerializer
)

User = get_user_model()


class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Workspace.objects.filter(
            members__user=self.request.user
        ).distinct().order_by('-updated_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WorkspaceDetailSerializer
        return WorkspaceSerializer
    
    def perform_create(self, serializer):
        serializer.save()
    
    def perform_update(self, serializer):
        # Only owners and admins can update workspace
        workspace = self.get_object()
        member = workspace.members.filter(user=self.request.user).first()
        
        if not member or member.role not in ['owner', 'admin']:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()
    
    def perform_destroy(self, serializer):
        # Only owners can delete workspace
        workspace = self.get_object()
        member = workspace.members.filter(user=self.request.user).first()
        
        if not member or member.role != 'owner':
            return Response(
                {'error': 'Only owners can delete workspace'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        workspace.delete()
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        workspace = self.get_object()
        members = workspace.members.all().select_related('user')
        serializer = WorkspaceMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        workspace = self.get_object()
        member = workspace.members.filter(user=request.user).first()
        
        if not member:
            return Response(
                {'error': 'You are not a member of this workspace'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if member.role == 'owner':
            return Response(
                {'error': 'Owners cannot leave their workspace'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.delete()
        return Response({'message': 'Left workspace successfully'})


class WorkspaceMemberListView(ListAPIView):
    serializer_class = WorkspaceMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        workspace_id = self.kwargs['workspace_id']
        workspace = get_object_or_404(
            Workspace, 
            id=workspace_id, 
            members__user=self.request.user
        )
        return workspace.members.all().select_related('user')


class WorkspaceInviteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, workspace_id):
        workspace = get_object_or_404(
            Workspace, 
            id=workspace_id, 
            members__user=request.user
        )
        
        # Check if user has permission to invite
        member = workspace.members.filter(user=request.user).first()
        if not member or member.role not in ['owner', 'admin']:
            if not (member.role == 'editor' and workspace.settings.allow_member_invites):
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = InviteUserSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            role = serializer.validated_data['role']
            
            # Check if user is already a member
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                if workspace.members.filter(user=user).exists():
                    return Response(
                        {'error': 'User is already a member'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Check if invitation already exists
            if WorkspaceInvitation.objects.filter(
                workspace=workspace, 
                email=email, 
                status='pending'
            ).exists():
                return Response(
                    {'error': 'Invitation already sent'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate token
            token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
            
            # Create invitation
            invitation = WorkspaceInvitation.objects.create(
                workspace=workspace,
                email=email,
                role=role,
                invited_by=request.user,
                token=token,
                expires_at=timezone.now() + timedelta(days=7)
            )
            
            # TODO: Send email notification
            
            serializer = WorkspaceInvitationSerializer(invitation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AcceptInviteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, token):
        invitation = get_object_or_404(
            WorkspaceInvitation, 
            token=token, 
            status='pending'
        )
        
        if invitation.expires_at < timezone.now():
            invitation.status = 'expired'
            invitation.save()
            return Response(
                {'error': 'Invitation has expired'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if invitation.email != request.user.email:
            return Response(
                {'error': 'Invitation is for different email'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already a member
        if invitation.workspace.members.filter(user=request.user).exists():
            return Response(
                {'error': 'Already a member of this workspace'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create membership
        WorkspaceMember.objects.create(
            workspace=invitation.workspace,
            user=request.user,
            role=invitation.role,
            invited_by=invitation.invited_by
        )
        
        invitation.status = 'accepted'
        invitation.save()
        
        return Response({'message': 'Invitation accepted successfully'})


class DeclineInviteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, token):
        invitation = get_object_or_404(
            WorkspaceInvitation, 
            token=token, 
            status='pending'
        )
        
        if invitation.email != request.user.email:
            return Response(
                {'error': 'Invitation is for different email'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invitation.status = 'declined'
        invitation.save()
        
        return Response({'message': 'Invitation declined'})


class AnalyticsOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Params
        workspace_ids = request.query_params.getlist('workspaces[]') or request.query_params.getlist('workspaces')
        from_param = request.query_params.get('from')
        to_param = request.query_params.get('to')

        to_dt = timezone.now()
        if to_param:
            try:
                to_dt = timezone.datetime.fromisoformat(to_param)
                if timezone.is_naive(to_dt):
                    to_dt = timezone.make_aware(to_dt)
            except Exception:
                pass
        from_dt = to_dt - timedelta(days=7)
        if from_param:
            try:
                from_dt = timezone.datetime.fromisoformat(from_param)
                if timezone.is_naive(from_dt):
                    from_dt = timezone.make_aware(from_dt)
            except Exception:
                pass

        # Accessible workspaces
        user_workspaces = Workspace.objects.filter(members__user=request.user)
        if workspace_ids:
            user_workspaces = user_workspaces.filter(id__in=workspace_ids)

        ws_ids = list(user_workspaces.values_list('id', flat=True))

        # Pages
        from apps.notes.models import Page, Comment
        pages_qs = Page.objects.filter(workspace__in=ws_ids, is_deleted=False)
        pages_total = pages_qs.count()
        pages_created = pages_qs.filter(created_at__range=(from_dt, to_dt)).count()
        pages_edited = pages_qs.filter(updated_at__range=(from_dt, to_dt)).exclude(created_at__gte=from_dt).count()

        # Databases
        from apps.databases.models import Database, DatabaseRecord
        databases_total = Database.objects.filter(workspace__in=ws_ids).count()
        records_created = DatabaseRecord.objects.filter(database__workspace__in=ws_ids, created_at__range=(from_dt, to_dt)).count()

        # Tasks
        from apps.tasks.models import Task
        tasks_qs = Task.objects.filter(board__workspace__in=ws_ids)
        tasks_total = tasks_qs.count()
        tasks_open = tasks_qs.filter(status__in=['todo', 'in_progress', 'review']).count()
        tasks_done = tasks_qs.filter(status='done').count()
        tasks_done_in_period = tasks_qs.filter(status='done', completed_at__range=(from_dt, to_dt)).count()
        tasks_overdue = tasks_qs.filter(due_date__lt=timezone.now(), status__in=['todo', 'in_progress', 'review']).count()

        # Comments
        comments_qs = Comment.objects.filter(page__workspace__in=ws_ids)
        comments_total = comments_qs.count()
        comments_created = comments_qs.filter(created_at__range=(from_dt, to_dt)).count()
        threads_total = comments_qs.filter(parent__isnull=True).count()
        threads_resolved = comments_qs.filter(parent__isnull=True, is_resolved=True).count()
        resolved_ratio = (threads_resolved / threads_total) if threads_total else 0

        # Members
        members_total = WorkspaceMember.objects.filter(workspace__in=ws_ids).values('user').distinct().count()
        # Simplified active users: commented or edited pages in period
        active_users = set(
            list(comments_qs.filter(created_at__range=(from_dt, to_dt)).values_list('author_id', flat=True)) +
            list(pages_qs.filter(updated_at__range=(from_dt, to_dt)).values_list('last_edited_by_id', flat=True))
        )

        data = {
            'pages': {
                'total': pages_total,
                'created': pages_created,
                'edited': pages_edited,
            },
            'databases': {
                'total': databases_total,
                'records_created': records_created,
            },
            'tasks': {
                'total': tasks_total,
                'open': tasks_open,
                'done': tasks_done,
                'done_in_period': tasks_done_in_period,
                'overdue': tasks_overdue,
            },
            'comments': {
                'total': comments_total,
                'created': comments_created,
                'resolved_ratio': resolved_ratio,
            },
            'members': {
                'total': members_total,
                'active': len(active_users),
            },
            'period': {
                'from': from_dt.isoformat(),
                'to': to_dt.isoformat(),
                'workspaces': ws_ids,
            }
        }

        return Response(data)
