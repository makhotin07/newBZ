"""
Сервисный слой для управления рабочими пространствами
"""
from typing import List, Optional
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import secrets
import string

from backend.apps.workspaces.models import Workspace, WorkspaceMember, WorkspaceInvitation
from backend.core.exceptions import BusinessLogicException, NotFoundException

User = get_user_model()


class WorkspaceService:
    """Сервис для управления рабочими пространствами"""
    
    @staticmethod
    def get_user_workspaces(user: User) -> List[Workspace]:
        """Получение рабочих пространств пользователя"""
        return list(Workspace.objects.filter(
            members__user=user
        ).distinct().order_by('-updated_at'))
    
    @staticmethod
    def create_workspace(user: User, **data) -> Workspace:
        """Создание нового рабочего пространства"""
        workspace = Workspace.objects.create(**data)
        
        # Добавление создателя как владельца
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=user,
            role='owner',
            joined_at=timezone.now()
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
        if not member or member.role not in ['owner', 'admin']:
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
        if not member or member.role != 'owner':
            raise BusinessLogicException("Только владелец может удалить рабочее пространство")
        
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
            raise BusinessLogicException("Вы не являетесь участником этого пространства")
        
        if member.role == 'owner':
            raise BusinessLogicException("Владелец не может покинуть свое рабочее пространство")
        
        member.delete()
        return True


class WorkspaceMemberService:
    """Сервис для управления участниками рабочего пространства"""
    
    @staticmethod
    def get_workspace_members(workspace_id: int, user: User) -> List[WorkspaceMember]:
        """Получение участников рабочего пространства"""
        workspace = Workspace.objects.filter(
            id=workspace_id,
            members__user=user
        ).first()
        
        if not workspace:
            return []
        
        return list(workspace.members.all().select_related('user'))
    
    @staticmethod
    def invite_user(workspace_id: int, inviter: User, email: str, role: str = 'member') -> WorkspaceInvitation:
        """Приглашение пользователя в рабочее пространство"""
        workspace = Workspace.objects.filter(
            id=workspace_id,
            members__user=inviter
        ).first()
        
        if not workspace:
            raise NotFoundException("Рабочее пространство не найдено")
        
        # Проверка прав на приглашение
        member = workspace.members.filter(user=inviter).first()
        if not member or member.role not in ['owner', 'admin']:
            raise BusinessLogicException("Недостаточно прав для приглашения")
        
        # Генерация токена приглашения
        token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        
        invitation = WorkspaceInvitation.objects.create(
            workspace=workspace,
            email=email,
            role=role,
            token=token,
            invited_by=inviter,
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        return invitation
    
    @staticmethod
    def accept_invitation(token: str, user: User) -> WorkspaceMember:
        """Принятие приглашения в рабочее пространство"""
        invitation = WorkspaceInvitation.objects.filter(
            token=token,
            expires_at__gt=timezone.now()
        ).first()
        
        if not invitation:
            raise BusinessLogicException("Приглашение недействительно или истекло")
        
        # Проверка, что пользователь еще не участник
        if WorkspaceMember.objects.filter(
            workspace=invitation.workspace,
            user=user
        ).exists():
            raise BusinessLogicException("Вы уже являетесь участником этого пространства")
        
        # Создание участника
        member = WorkspaceMember.objects.create(
            workspace=invitation.workspace,
            user=user,
            role=invitation.role,
            joined_at=timezone.now()
        )
        
        # Удаление приглашения
        invitation.delete()
        
        return member
