"""
Сервисный слой для совместной работы
"""
from typing import List, Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count

from backend.apps.collaboration.models import ActiveSession, CollaborationComment, CollaborationReaction
from backend.apps.workspaces.models import Workspace
from backend.core.exceptions import BusinessLogicException, NotFoundException

User = get_user_model()


class CollaborationService:
    """Сервис для управления совместной работой"""
    
    def __init__(self, user: User, workspace_id: int, resource_type: str, resource_id: int):
        self.user = user
        self.workspace_id = workspace_id
        self.resource_type = resource_type
        self.resource_id = resource_id
    
    async def create_active_session(self, session_id: str) -> ActiveSession:
        """Создание активной сессии пользователя"""
        # Проверка доступа к workspace
        if not await self._check_workspace_access():
            raise BusinessLogicException("Нет доступа к рабочему пространству")
        
        # Создание или обновление активной сессии
        session, created = ActiveSession.objects.get_or_create(
            user=self.user,
            workspace_id=self.workspace_id,
            resource_type=self.resource_type,
            resource_id=self.resource_id,
            defaults={
                'session_id': session_id,
                'last_activity': timezone.now()
            }
        )
        
        if not created:
            session.session_id = session_id
            session.last_activity = timezone.now()
            session.save()
        
        return session
    
    async def remove_active_session(self, session_id: str) -> bool:
        """Удаление активной сессии пользователя"""
        try:
            session = ActiveSession.objects.get(
                user=self.user,
                workspace_id=self.workspace_id,
                resource_type=self.resource_type,
                resource_id=self.resource_id,
                session_id=session_id
            )
            session.delete()
            return True
        except ActiveSession.DoesNotExist:
            return False
    
    async def get_active_users(self) -> List[Dict[str, Any]]:
        """Получение списка активных пользователей"""
        active_sessions = ActiveSession.objects.filter(
            workspace_id=self.workspace_id,
            resource_type=self.resource_type,
            resource_id=self.resource_id,
            last_activity__gte=timezone.now() - timezone.timedelta(minutes=5)
        ).select_related('user')
        
        users = []
        for session in active_sessions:
            users.append({
                'user_id': str(session.user.id),
                'user_name': session.user.full_name or session.user.email,
                'session_id': session.session_id,
                'last_activity': session.last_activity.isoformat()
            })
        
        return users
    
    async def save_content_change(self, change_data: Dict[str, Any]) -> bool:
        """Сохранение изменений контента"""
        # Здесь можно добавить логику для сохранения изменений
        # Например, создание версии документа или логирование
        
        # Обновление времени последней активности
        try:
            session = ActiveSession.objects.get(
                user=self.user,
                workspace_id=self.workspace_id,
                resource_type=self.resource_type,
                resource_id=self.resource_id
            )
            session.last_activity = timezone.now()
            session.save()
        except ActiveSession.DoesNotExist:
            pass
        
        return True
    
    async def add_comment(self, comment_data: Dict[str, Any]) -> CollaborationComment:
        """Добавление комментария к ресурсу"""
        # Проверка доступа к workspace
        if not await self._check_workspace_access():
            raise BusinessLogicException("Нет доступа к рабочему пространству")
        
        comment = CollaborationComment.objects.create(
            user=self.user,
            workspace_id=self.workspace_id,
            resource_type=self.resource_type,
            resource_id=self.resource_id,
            content=comment_data.get('content', ''),
            position=comment_data.get('position', {}),
            parent_comment_id=comment_data.get('parent_comment_id')
        )
        
        return comment
    
    async def add_reaction(self, reaction_data: Dict[str, Any]) -> CollaborationReaction:
        """Добавление реакции к ресурсу или комментарию"""
        # Проверка доступа к workspace
        if not await self._check_workspace_access():
            raise BusinessLogicException("Нет доступа к рабочему пространству")
        
        # Проверка, что реакция еще не существует
        existing_reaction = CollaborationReaction.objects.filter(
            user=self.user,
            workspace_id=self.workspace_id,
            resource_type=self.resource_type,
            resource_id=self.resource_id,
            reaction_type=reaction_data.get('reaction_type'),
            comment_id=reaction_data.get('comment_id')
        ).first()
        
        if existing_reaction:
            # Если реакция уже существует, удаляем её (toggle)
            existing_reaction.delete()
            return None
        
        # Создание новой реакции
        reaction = CollaborationReaction.objects.create(
            user=self.user,
            workspace_id=self.workspace_id,
            resource_type=self.resource_type,
            resource_id=self.resource_id,
            reaction_type=reaction_data.get('reaction_type'),
            comment_id=reaction_data.get('comment_id')
        )
        
        return reaction
    
    async def get_comments(self, limit: int = 50) -> List[CollaborationComment]:
        """Получение комментариев к ресурсу"""
        comments = CollaborationComment.objects.filter(
            workspace_id=self.workspace_id,
            resource_type=self.resource_type,
            resource_id=self.resource_id
        ).select_related('user').order_by('-created_at')[:limit]
        
        return list(comments)
    
    async def get_reactions_summary(self) -> Dict[str, int]:
        """Получение сводки реакций к ресурсу"""
        reactions = CollaborationReaction.objects.filter(
            workspace_id=self.workspace_id,
            resource_type=self.resource_type,
            resource_id=self.resource_id
        ).values('reaction_type').annotate(count=Count('id'))
        
        summary = {}
        for reaction in reactions:
            summary[reaction['reaction_type']] = reaction['count']
        
        return summary
    
    async def _check_workspace_access(self) -> bool:
        """Проверка доступа пользователя к workspace"""
        return Workspace.objects.filter(
            id=self.workspace_id,
            members__user=self.user
        ).exists()
