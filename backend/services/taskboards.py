"""
Сервисный слой для управления досками задач
"""
from typing import List, Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.db.models import Q, Max

from backend.apps.tasks.models import TaskBoard, TaskColumn, Task
from backend.apps.workspaces.models import Workspace
from backend.core.exceptions import BusinessLogicException, NotFoundException

User = get_user_model()


class TaskBoardService:
    """Сервис для управления досками задач"""
    
    @staticmethod
    def get_user_boards(user: User, workspace_id: Optional[str] = None) -> List[TaskBoard]:
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
    def get_board_by_id(board_id: str, user: User) -> TaskBoard:
        """Получение доски задач по ID с проверкой доступа"""
        board = TaskBoard.objects.filter(
            id=board_id,
            workspace__members__user=user
        ).select_related('workspace', 'created_by').first()
        
        if not board:
            raise NotFoundException("Доска задач не найдена")
        
        return board
    
    @staticmethod
    def create_board(user: User, workspace_id: str, **data) -> TaskBoard:
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
        
        # Создаем колонки по умолчанию
        default_columns = [
            {'title': 'To Do', 'color': '#6B7280', 'position': 1},
            {'title': 'In Progress', 'color': '#3B82F6', 'position': 2},
            {'title': 'Done', 'color': '#10B981', 'position': 3},
        ]
        
        for column_data in default_columns:
            TaskColumn.objects.create(board=board, **column_data)
        
        return board
    
    @staticmethod
    def update_board(board_id: str, user: User, **data) -> TaskBoard:
        """Обновление доски задач"""
        board = TaskBoardService.get_board_by_id(board_id, user)
        
        for field, value in data.items():
            if hasattr(board, field):
                setattr(board, field, value)
        
        board.save()
        return board
    
    @staticmethod
    def delete_board(board_id: str, user: User) -> bool:
        """Удаление доски задач"""
        board = TaskBoardService.get_board_by_id(board_id, user)
        board.delete()
        return True


class TaskColumnService:
    """Сервис для управления колонками задач"""
    
    @staticmethod
    def get_board_columns(board_id: str, user: User) -> List[TaskColumn]:
        """Получение колонок доски"""
        board = TaskBoardService.get_board_by_id(board_id, user)
        return list(board.columns.all().order_by('position'))
    
    @staticmethod
    def create_column(board_id: str, user: User, **data) -> TaskColumn:
        """Создание новой колонки"""
        board = TaskBoardService.get_board_by_id(board_id, user)
        
        # Определяем позицию новой колонки
        max_position = TaskColumn.objects.filter(board=board).aggregate(
            max_pos=Max('position')
        )['max_pos'] or 0
        
        column = TaskColumn.objects.create(
            board=board,
            position=max_position + 1,
            **data
        )
        
        return column
    
    @staticmethod
    def update_column(column_id: str, user: User, **data) -> TaskColumn:
        """Обновление колонки"""
        column = TaskColumn.objects.filter(
            id=column_id,
            board__workspace__members__user=user
        ).first()
        
        if not column:
            raise NotFoundException("Колонка не найдена")
        
        for field, value in data.items():
            if hasattr(column, field):
                setattr(column, field, value)
        
        column.save()
        return column
    
    @staticmethod
    def delete_column(column_id: str, user: User) -> bool:
        """Удаление колонки"""
        column = TaskColumn.objects.filter(
            id=column_id,
            board__workspace__members__user=user
        ).first()
        
        if not column:
            raise NotFoundException("Колонка не найдена")
        
        column.delete()
        return True


class TaskService:
    """Сервис для управления задачами"""
    
    @staticmethod
    def get_board_tasks(board_id: str, user: User, **filters) -> List[Task]:
        """Получение задач доски"""
        board = TaskBoardService.get_board_by_id(board_id, user)
        
        queryset = Task.objects.filter(board=board).select_related(
            'board', 'column', 'created_by'
        ).prefetch_related('assignees', 'tags').order_by('position', '-created_at')
        
        # Применяем фильтры
        if filters.get('column_id'):
            queryset = queryset.filter(column_id=filters['column_id'])
        
        if filters.get('assignee_id'):
            queryset = queryset.filter(assignees__id=filters['assignee_id'])
        
        if filters.get('status'):
            queryset = queryset.filter(status=filters['status'])
        
        return list(queryset)
    
    @staticmethod
    def create_task(user: User, board_id: str, **data) -> Task:
        """Создание новой задачи"""
        board = TaskBoardService.get_board_by_id(board_id, user)
        
        # Исключаем board, column и many-to-many поля из данных
        data.pop('board', None)
        data.pop('column', None)
        tags = data.pop('tags', [])
        assignees = data.pop('assignees', [])
        
        # Если не указана колонка, берем первую
        if 'column' not in data:
            first_column = board.columns.first()
            if first_column:
                data['column'] = first_column
        
        task = Task.objects.create(
            board=board,
            created_by=user,
            **data
        )
        
        # Устанавливаем many-to-many поля отдельно
        if tags:
            task.tags.set(tags)
        if assignees:
            task.assignees.set(assignees)
        
        return task
    
    @staticmethod
    def update_task(task_id: str, user: User, **data) -> Task:
        """Обновление задачи"""
        task = Task.objects.filter(
            id=task_id,
            board__workspace__members__user=user
        ).first()
        
        if not task:
            raise NotFoundException("Задача не найдена")
        
        for field, value in data.items():
            if hasattr(task, field):
                setattr(task, field, value)
        
        task.save()
        return task
    
    @staticmethod
    def delete_task(task_id: str, user: User) -> bool:
        """Удаление задачи"""
        task = Task.objects.filter(
            id=task_id,
            board__workspace__members__user=user
        ).first()
        
        if not task:
            raise NotFoundException("Задача не найдена")
        
        task.delete()
        return True
    
    @staticmethod
    def move_task(task_id: str, user: User, column_id: str, position: int = 0) -> Task:
        """Перемещение задачи в другую колонку"""
        task = Task.objects.filter(
            id=task_id,
            board__workspace__members__user=user
        ).first()
        
        if not task:
            raise NotFoundException("Задача не найдена")
        
        # Проверяем, что колонка принадлежит той же доске
        column = TaskColumn.objects.filter(
            id=column_id,
            board=task.board
        ).first()
        
        if not column:
            raise NotFoundException("Колонка не найдена")
        
        task.column = column
        task.position = position
        task.save()
        
        return task
