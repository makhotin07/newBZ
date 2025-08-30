"""
Контроллеры для управления рабочими пространствами (Clean Architecture)
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response


from backend.apps.workspaces.serializers import (
    WorkspaceSerializer,
    WorkspaceDetailSerializer,
    WorkspaceMemberSerializer,
    InviteUserSerializer,
)
from backend.services.workspace_service import WorkspaceService, WorkspaceMemberService
from backend.api.pagination import NoPagination


class WorkspaceViewSet(viewsets.ModelViewSet):
    """ViewSet для рабочих пространств"""

    permission_classes = [permissions.IsAuthenticated]

    http_method_names = [
        "get",
        "post",
        "put",
        "patch",
        "delete",
    ]  # Явно разрешаем все методы

    def get_serializer_class(self):
        if self.action == "retrieve":
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

    @action(detail=True, methods=["get"])
    def members(self, request, pk=None):
        """Получение участников рабочего пространства"""
        members = WorkspaceMemberService.get_workspace_members(
            workspace_id=pk, user=request.user
        )
        serializer = WorkspaceMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="members/me")
    def me(self, request, pk=None):
        """Получение информации о текущем участнике"""
        try:
            member = WorkspaceMemberService.get_workspace_member(
                workspace_id=pk, user=request.user
            )
            serializer = WorkspaceMemberSerializer(member)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["delete"], url_path="members/me")
    def leave(self, request, pk=None):
        """Выход из рабочего пространства"""
        try:
            WorkspaceMemberService.leave_workspace(workspace_id=pk, user=request.user)
            return Response({"message": "Успешно покинули рабочее пространство"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def invite(self, request, pk=None):
        """Приглашение пользователя в рабочее пространство"""
        serializer = InviteUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                invitation = WorkspaceMemberService.invite_user(
                    workspace_id=pk, user=request.user, **serializer.validated_data
                )
                return Response(
                    {
                        "message": "Приглашение отправлено",
                        "invitation_id": invitation.id,
                    }
                )
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get", "patch"])
    def workspace_settings(self, request, pk=None):
        """Получение и обновление настроек рабочего пространства"""
        if request.method == "GET":
            try:
                settings = WorkspaceService.get_workspace_settings(
                    workspace_id=pk, user=request.user
                )
                return Response(settings)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        elif request.method == "PATCH":
            try:
                settings = WorkspaceService.update_workspace_settings(
                    workspace_id=pk, user=request.user, **request.data
                )
                return Response(settings)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["patch"], url_path="members/(?P<member_id>[^/.]+)")
    def update_member(self, request, pk=None, member_id=None):
        """Обновление роли участника рабочего пространства"""
        try:
            member = WorkspaceMemberService.update_member_role(
                workspace_id=pk,
                member_id=member_id,
                user=request.user,
                new_role=request.data.get("role"),
            )
            serializer = WorkspaceMemberSerializer(member)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["delete"], url_path="members/(?P<member_id>[^/.]+)")
    def remove_member(self, request, pk=None, member_id=None):
        """Удаление участника из рабочего пространства"""
        try:
            WorkspaceMemberService.remove_member(
                workspace_id=pk, member_id=member_id, user=request.user
            )
            return Response({"message": "Участник удален из рабочего пространства"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def task_stats(self, request, pk=None):
        """Получение статистики задач в рабочем пространстве"""
        try:
            from backend.services.taskboards import TaskBoardService
            stats = TaskBoardService.get_workspace_stats(pk, request.user)
            return Response(stats)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=["get"])
    def database_stats(self, request, pk=None):
        """Получение статистики баз данных в рабочем пространстве"""
        try:
            from backend.services.databases import DatabaseService
            databases = DatabaseService.get_user_databases(request.user, pk)
            stats = {
                'total_databases': len(databases),
                'total_records': sum(db.records.count() for db in databases),
                'total_properties': sum(db.properties.count() for db in databases)
            }
            return Response(stats)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class WorkspaceInvitationViewSet(viewsets.ViewSet):
    """ViewSet для управления приглашениями в рабочие пространства"""

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def pending(self, request):
        """Получение ожидающих приглашений пользователя"""
        try:
            invitations = WorkspaceMemberService.get_pending_invitations(
                user=request.user
            )
            return Response(invitations)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], url_path="accept")
    def accept_invitation_by_token(self, request):
        """Принятие приглашения по токену"""
        token = request.data.get("token")
        if not token:
            return Response(
                {"error": "Токен приглашения обязателен"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            member = WorkspaceMemberService.accept_invitation(
                token=token, user=request.user
            )
            return Response(
                {
                    "message": "Приглашение принято",
                    "workspace_id": member.workspace.id,
                    "workspace_name": member.workspace.name,
                }
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="accept")
    def accept_invitation(self, request, pk=None):
        """Принятие приглашения по ID"""
        try:
            member = WorkspaceMemberService.accept_invitation_by_id(
                invitation_id=pk, user=request.user
            )
            return Response(
                {
                    "message": "Приглашение принято",
                    "workspace_id": member.workspace.id,
                    "workspace_name": member.workspace.name,
                }
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="decline")
    def decline_invitation(self, request, pk=None):
        """Отклонение приглашения по ID"""
        try:
            WorkspaceMemberService.decline_invitation(
                invitation_id=pk, user=request.user
            )
            return Response({"message": "Приглашение отклонено"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
