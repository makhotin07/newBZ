"""
Тесты для сервиса задач
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from backend.services.task_service import TaskBoardService, TaskService, TaskCommentService
from backend.apps.tasks.models import TaskBoard, Task, TaskComment
from backend.apps.workspaces.models import Workspace, WorkspaceMember

User = get_user_model()


@pytest.mark.django_db
class TestTaskBoardService:
    """Тесты для сервиса досок задач"""
    
    def test_get_user_boards(self):
        """Тест получения досок пользователя"""
        # Создание тестовых данных
        user = User.objects.create_user(username='testuser', email='test@example.com')
        workspace = Workspace.objects.create(name='Test Workspace')
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=user,
            role='member'
        )
        
        board = TaskBoard.objects.create(
            name='Test Board',
            workspace=workspace,
            created_by=user
        )
        
        # Тест
        boards = TaskBoardService.get_user_boards(user)
        assert len(boards) == 1
        assert boards[0].id == board.id
    
    def test_create_board(self):
        """Тест создания доски"""
        user = User.objects.create_user(username='testuser', email='test@example.com')
        workspace = Workspace.objects.create(name='Test Workspace')
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=user,
            role='member'
        )
        
        # Тест
        board = TaskBoardService.create_board(
            user=user,
            workspace_id=workspace.id,
            name='New Board'
        )
        
        assert board.name == 'New Board'
        assert board.workspace_id == workspace.id
        assert board.created_by == user


@pytest.mark.django_db
class TestTaskService:
    """Тесты для сервиса задач"""
    
    def test_get_user_tasks(self):
        """Тест получения задач пользователя"""
        user = User.objects.create_user(username='testuser', email='test@example.com')
        workspace = Workspace.objects.create(name='Test Workspace')
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=user,
            role='member'
        )
        
        board = TaskBoard.objects.create(
            name='Test Board',
            workspace=workspace,
            created_by=user
        )
        
        task = Task.objects.create(
            title='Test Task',
            board=board,
            created_by=user
        )
        
        # Тест
        tasks = TaskService.get_user_tasks(user)
        assert len(tasks) == 1
        assert tasks[0].id == task.id
    
    def test_create_task(self):
        """Тест создания задачи"""
        user = User.objects.create_user(username='testuser', email='test@example.com')
        workspace = Workspace.objects.create(name='Test Workspace')
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=user,
            role='member'
        )
        
        board = TaskBoard.objects.create(
            name='Test Board',
            workspace=workspace,
            created_by=user
        )
        
        # Тест
        task = TaskService.create_task(
            user=user,
            board_id=board.id,
            title='New Task',
            description='Task description'
        )
        
        assert task.title == 'New Task'
        assert task.board_id == board.id
        assert task.created_by == user


@pytest.mark.django_db
class TestTaskCommentService:
    """Тесты для сервиса комментариев к задачам"""
    
    def test_add_comment(self):
        """Тест добавления комментария"""
        user = User.objects.create_user(username='testuser', email='test@example.com')
        workspace = Workspace.objects.create(name='Test Workspace')
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=user,
            role='member'
        )
        
        board = TaskBoard.objects.create(
            name='Test Board',
            workspace=workspace,
            created_by=user
        )
        
        task = Task.objects.create(
            title='Test Task',
            board=board,
            created_by=user
        )
        
        # Тест
        comment = TaskCommentService.add_comment(
            user=user,
            task_id=task.id,
            content='Test comment'
        )
        
        assert comment.content == 'Test comment'
        assert comment.task_id == task.id
        assert comment.author == user
