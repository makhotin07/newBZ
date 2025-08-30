"""
Сервисный слой для управления рабочими пространствами
"""
from typing import List, Optional
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import secrets
import string

from backend.apps.workspaces.models import (
    Workspace,
    WorkspaceMember,
    WorkspaceInvitation,
)
from backend.core.exceptions import BusinessLogicException, NotFoundException

User = get_user_model()


class WorkspaceService:
    """Сервис для управления рабочими пространствами"""

    @staticmethod
    def get_user_workspaces(user: User) -> List[Workspace]:
        """Получение рабочих пространств пользователя"""
        return (
            Workspace.objects.filter(members__user=user)
            .distinct()
            .order_by("-updated_at")
        )

    @staticmethod
    def create_workspace(user: User, **data) -> Workspace:
        """Создание нового рабочего пространства"""
        workspace = Workspace.objects.create(**data)

        # Добавление создателя как владельца
        WorkspaceMember.objects.create(
            workspace=workspace, user=user, role="owner", joined_at=timezone.now()
        )

        return workspace

    @staticmethod
    def update_workspace(workspace_id: int, user: User, **data) -> Workspace:
        """Обновление рабочего пространства"""
        workspace = Workspace.objects.filter(id=workspace_id).first()
        if not workspace:
            raise NotFoundException("Рабочее пространство не найдено")

        # Проверка прав на обновление
        member = workspace.members.filter(user=user).first()
        if not member or member.role not in ["owner", "admin"]:
            raise BusinessLogicException("Недостаточно прав для обновления")

        for field, value in data.items():
            setattr(workspace, field, value)
        workspace.save()

        return workspace

    @staticmethod
    def delete_workspace(workspace_id: int, user: User) -> bool:
        """Удаление рабочего пространства"""
        workspace = Workspace.objects.filter(id=workspace_id).first()
        if not workspace:
            raise NotFoundException("Рабочее пространство не найдено")

        # Проверка прав на удаление
        member = workspace.members.filter(user=user).first()
        if not member or member.role != "owner":
            raise BusinessLogicException(
                "Только владелец может удалить рабочее пространство"
            )

        workspace.delete()
        return True

    @staticmethod
    def leave_workspace(workspace_id: int, user: User) -> bool:
        """Выход из рабочего пространства"""
        workspace = Workspace.objects.filter(id=workspace_id).first()
        if not workspace:
            raise NotFoundException("Рабочее пространство не найдено")

        member = workspace.members.filter(user=user).first()
        if not member:
            raise BusinessLogicException(
                "Вы не являетесь участником этого пространства"
            )

        if member.role == "owner":
            raise BusinessLogicException(
                "Владелец не может покинуть свое рабочее пространство"
            )

        member.delete()
        return True

    @staticmethod
    def get_workspace_settings(workspace_id: int, user: User) -> dict:
        """Получение настроек рабочего пространства"""
        workspace = Workspace.objects.filter(
            id=workspace_id, members__user=user
        ).first()

        if not workspace:
            raise NotFoundException("Рабочее пространство не найдено")

        # Возвращаем настройки по умолчанию
        return {
            "allow_member_invites": True,
            "allow_public_pages": False,
            "default_page_permissions": "private",
            "enable_comments": True,
            "enable_page_history": True,
        }

    @staticmethod
    def update_workspace_settings(workspace_id: int, user: User, **settings) -> dict:
        """Обновление настроек рабочего пространства"""
        workspace = Workspace.objects.filter(
            id=workspace_id, members__user=user
        ).first()

        if not workspace:
            raise NotFoundException("Рабочее пространство не найдено")

        # Проверка прав на обновление настроек
        member = workspace.members.filter(user=user).first()
        if not member or member.role not in ["owner", "admin"]:
            raise BusinessLogicException("Недостаточно прав для обновления настроек")

        # В реальном приложении здесь нужно сохранить настройки в базе
        # Пока возвращаем обновленные настройки
        current_settings = WorkspaceService.get_workspace_settings(workspace_id, user)
        current_settings.update(settings)

        return current_settings


class WorkspaceMemberService:
    """Сервис для управления участниками рабочего пространства"""

    @staticmethod
    def get_workspace_members(workspace_id: int, user: User) -> List[WorkspaceMember]:
        """Получение участников рабочего пространства"""
        workspace = Workspace.objects.filter(
            id=workspace_id, members__user=user
        ).first()

        if not workspace:
            return []

        return list(workspace.members.all().select_related("user"))

    @staticmethod
    def invite_user(
        workspace_id: int, inviter: User, email: str, role: str = "member"
    ) -> WorkspaceInvitation:
        """Приглашение пользователя в рабочее пространство"""
        workspace = Workspace.objects.filter(
            id=workspace_id, members__user=inviter
        ).first()

        if not workspace:
            raise NotFoundException("Рабочее пространство не найдено")

        # Проверка прав на приглашение
        member = workspace.members.filter(user=inviter).first()
        if not member or member.role not in ["owner", "admin"]:
            raise BusinessLogicException("Недостаточно прав для приглашения")

        # Генерация токена приглашения
        token = "".join(
            secrets.choice(string.ascii_letters + string.digits) for _ in range(32)
        )

        invitation = WorkspaceInvitation.objects.create(
            workspace=workspace,
            email=email,
            role=role,
            token=token,
            invited_by=inviter,
            expires_at=timezone.now() + timedelta(days=7),
        )

        return invitation

    @staticmethod
    def accept_invitation(token: str, user: User) -> WorkspaceMember:
        """Принятие приглашения в рабочее пространство"""
        invitation = WorkspaceInvitation.objects.filter(
            token=token, expires_at__gt=timezone.now()
        ).first()

        if not invitation:
            raise BusinessLogicException("Приглашение недействительно или истекло")

        # Проверка, что пользователь еще не участник
        if WorkspaceMember.objects.filter(
            workspace=invitation.workspace, user=user
        ).exists():
            raise BusinessLogicException(
                "Вы уже являетесь участником этого пространства"
            )

        # Создание участника
        member = WorkspaceMember.objects.create(
            workspace=invitation.workspace,
            user=user,
            role=invitation.role,
            joined_at=timezone.now(),
        )

        # Удаление приглашения
        invitation.delete()

        return member

    @staticmethod
    def get_pending_invitations(user: User) -> List[dict]:
        """Получение ожидающих приглашений пользователя"""
        invitations = WorkspaceInvitation.objects.filter(
            email=user.email, expires_at__gt=timezone.now()
        ).select_related("workspace", "invited_by")

        return [
            {
                "id": invitation.id,
                "workspace": invitation.workspace.id,
                "workspace_name": invitation.workspace.name,
                "email": invitation.email,
                "role": invitation.role,
                "invited_by": invitation.invited_by.id,
                "invited_by_name": invitation.invited_by.get_full_name()
                or invitation.invited_by.username,
                "status": "pending",
                "token": invitation.token,
                "created_at": invitation.created_at.isoformat(),
                "expires_at": invitation.expires_at.isoformat(),
            }
            for invitation in invitations
        ]

    @staticmethod
    def accept_invitation_by_id(invitation_id: int, user: User) -> WorkspaceMember:
        """Принятие приглашения по ID"""
        invitation = WorkspaceInvitation.objects.filter(
            id=invitation_id, email=user.email, expires_at__gt=timezone.now()
        ).first()

        if not invitation:
            raise BusinessLogicException("Приглашение недействительно или истекло")

        return WorkspaceMemberService.accept_invitation(invitation.token, user)

    @staticmethod
    def decline_invitation(invitation_id: int, user: User) -> bool:
        """Отклонение приглашения"""
        invitation = WorkspaceInvitation.objects.filter(
            id=invitation_id, email=user.email
        ).first()

        if not invitation:
            raise NotFoundException("Приглашение не найдено")

        invitation.delete()
        return True

    @staticmethod
    def update_member_role(
        workspace_id: int, member_id: int, user: User, new_role: str
    ) -> WorkspaceMember:
        """Обновление роли участника рабочего пространства"""
        workspace = Workspace.objects.filter(
            id=workspace_id, members__user=user
        ).first()

        if not workspace:
            raise NotFoundException("Рабочее пространство не найдено")

        # Проверка прав на обновление роли
        current_member = workspace.members.filter(user=user).first()
        if not current_member or current_member.role not in ["owner", "admin"]:
            raise BusinessLogicException("Недостаточно прав для обновления роли")

        # Проверка, что не пытаемся изменить роль владельца
        target_member = workspace.members.filter(id=member_id).first()
        if not target_member:
            raise NotFoundException("Участник не найден")

        if target_member.role == "owner" and current_member.role != "owner":
            raise BusinessLogicException(
                "Только владелец может изменять роль владельца"
            )

        # Обновление роли
        target_member.role = new_role
        target_member.save()

        return target_member

    @staticmethod
    def remove_member(workspace_id: int, member_id: int, user: User) -> bool:
        """Удаление участника из рабочего пространства"""
        workspace = Workspace.objects.filter(
            id=workspace_id, members__user=user
        ).first()

        if not workspace:
            raise NotFoundException("Рабочее пространство не найдено")

        # Проверка прав на удаление участника
        current_member = workspace.members.filter(user=user).first()
        if not current_member or current_member.role not in ["owner", "admin"]:
            raise BusinessLogicException("Недостаточно прав для удаления участника")

        # Проверка, что не пытаемся удалить владельца
        target_member = workspace.members.filter(id=member_id).first()
        if not target_member:
            raise NotFoundException("Участник не найден")

        if target_member.role == "owner":
            raise BusinessLogicException(
                "Нельзя удалить владельца рабочего пространства"
            )

        # Удаление участника
        target_member.delete()
        return True
