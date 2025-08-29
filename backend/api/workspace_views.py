"""
Контроллеры для управления рабочими пространствами (Clean Architecture)
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response


from backend.apps.workspaces.serializers import (
    WorkspaceSerializer, WorkspaceDetailSerializer, 
    WorkspaceMemberSerializer, InviteUserSerializer
)
from backend.services.workspace_service import WorkspaceService, WorkspaceMemberService
from backend.api.pagination import NoPagination


class WorkspaceViewSet(viewsets.ModelViewSet):
    """ViewSet для рабочих пространств"""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NoPagination
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']  # Явно разрешаем все методы
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WorkspaceDetailSerializer
        return WorkspaceSerializer
    
    def get_queryset(self):
        """Получение queryset через сервис"""
        return WorkspaceService.get_user_workspaces(user=self.request.user)
    
    def perform_create(self, serializer):
        """Создание рабочего пространства через сериализатор"""
        workspace = serializer.save()
        return workspace
    
    def perform_update(self, serializer):
        """Обновление рабочего пространства"""
        serializer.save()
    
    def perform_destroy(self, instance):
        """Удаление рабочего пространства"""
        instance.delete()
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Получение участников рабочего пространства"""
        members = WorkspaceMemberService.get_workspace_members(
            workspace_id=pk,
            user=request.user
        )
        serializer = WorkspaceMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Выход из рабочего пространства"""
        try:
            WorkspaceMemberService.leave_workspace(
                workspace_id=pk,
                user=request.user
            )
            return Response({'message': 'Успешно покинули рабочее пространство'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        """Приглашение пользователя в рабочее пространство"""
        serializer = InviteUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                invitation = WorkspaceMemberService.invite_user(
                    workspace_id=pk,
                    user=request.user,
                    **serializer.validated_data
                )
                return Response({
                    'message': 'Приглашение отправлено',
                    'invitation_id': invitation.id
                })
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='accept-invitation')
    def accept_invitation(self, request):
        """Принятие приглашения в рабочее пространство"""
        token = request.data.get('token')
        if not token:
            return Response(
                {'error': 'Токен приглашения обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            member = WorkspaceMemberService.accept_invitation(
                token=token,
                user=request.user
            )
            return Response({
                'message': 'Приглашение принято',
                'workspace_id': member.workspace.id,
                'workspace_name': member.workspace.name
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )






