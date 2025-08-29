"""
Сервисный слой для управления задачами
"""
from typing import List, Optional
from django.db.models import Q
from django.contrib.auth.models import User

from backend.apps.tasks.models import TaskBoard, TaskColumn, Task, TaskComment
from backend.apps.workspaces.models import Workspace
from backend.core.exceptions import BusinessLogicException, NotFoundException


class TaskBoardService:
    """Сервис для управления досками задач"""
    
    @staticmethod
    def get_user_boards(user: User, workspace_id: Optional[int] = None) -> List[TaskBoard]:
        """Получение досок задач пользователя"""
        user_workspaces = Workspace.objects.filter(
            members__user=user
        ).values_list('id', flat=True)
        
        queryset = TaskBoard.objects.filter(
            workspace__in=user_workspaces
        ).select_related('workspace', 'created_by').order_by('-updated_at')
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return list(queryset)
    
    @staticmethod
    def create_board(user: User, workspace_id: int, **data) -> TaskBoard:
        """Создание новой доски задач"""
        # Проверка доступа к workspace
        if not Workspace.objects.filter(
            id=workspace_id, 
            members__user=user
        ).exists():
            raise BusinessLogicException("Нет доступа к рабочему пространству")
        
        board = TaskBoard.objects.create(
            workspace_id=workspace_id,
            created_by=user,
            **data
        )
        return board


class TaskService:
    """Сервис для управления задачами"""
    
    @staticmethod
    def get_user_tasks(
        user: User, 
        board_id: Optional[int] = None,
        assigned_to_me: bool = False,
        status: Optional[str] = None,
        priority: Optional[str] = None
    ) -> List[Task]:
        """Получение задач пользователя с фильтрацией"""
        user_workspaces = Workspace.objects.filter(
            members__user=user
        ).values_list('id', flat=True)
        
        queryset = Task.objects.filter(
            board__workspace__in=user_workspaces
        ).select_related('board', 'column', 'created_by').prefetch_related('assignees', 'tags')
        
        if board_id:
            queryset = queryset.filter(board_id=board_id)
        
        if assigned_to_me:
            queryset = queryset.filter(assignees=user)
        
        if status:
            queryset = queryset.filter(status=status)
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return list(queryset)
    
    @staticmethod
    def create_task(user: User, board_id: int, **data) -> Task:
        """Создание новой задачи"""
        # Проверка доступа к доске
        board = TaskBoard.objects.filter(
            id=board_id,
            workspace__members__user=user
        ).first()
        
        if not board:
            raise NotFoundException("Доска задач не найдена")
        
        task = Task.objects.create(
            board=board,
            created_by=user,
            **data
        )
        return task
    
    @staticmethod
    def update_task_status(task_id: int, user: User, new_status: str) -> Task:
        """Обновление статуса задачи"""
        task = Task.objects.filter(
            id=task_id,
            board__workspace__members__user=user
        ).first()
        
        if not task:
            raise NotFoundException("Задача не найдена")
        
        task.status = new_status
        task.save()
        return task


class TaskCommentService:
    """Сервис для управления комментариями к задачам"""
    
    @staticmethod
    def add_comment(user: User, task_id: int, content: str) -> TaskComment:
        """Добавление комментария к задаче"""
        task = Task.objects.filter(
            id=task_id,
            board__workspace__members__user=user
        ).first()
        
        if not task:
            raise NotFoundException("Задача не найдена")
        
        comment = TaskComment.objects.create(
            task=task,
            author=user,
            content=content
        )
        return comment
