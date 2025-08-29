"""
Тесты для tasks модуля - тестирование реальных API endpoints
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from backend.apps.workspaces.models import Workspace
from backend.apps.tasks.models import TaskBoard, Task, TaskComment

User = get_user_model()


class TaskModelTest(TestCase):
    """Тесты для моделей tasks"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            owner=self.user
        )

    def test_create_task_board(self):
        """Тест создания доски задач"""
        board = TaskBoard.objects.create(
            title='Test Board',
            description='A test task board',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(board.title, 'Test Board')
        self.assertEqual(board.workspace, self.workspace)
        self.assertEqual(board.created_by, self.user)

    def test_create_task(self):
        """Тест создания задачи"""
        board = TaskBoard.objects.create(
            title='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )
        
        task = Task.objects.create(
            title='Test Task',
            description='A test task',
            board=board,
            created_by=self.user
        )

        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.board, board)
        self.assertEqual(task.created_by, self.user)

    def test_create_task_comment(self):
        """Тест создания комментария к задаче"""
        board = TaskBoard.objects.create(
            title='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )
        task = Task.objects.create(
            title='Test Task',
            board=board,
            created_by=self.user
        )
        
        comment = TaskComment.objects.create(
            content='Test comment',
            task=task,
            author=self.user
        )

        self.assertEqual(comment.content, 'Test comment')
        self.assertEqual(comment.task, task)
        self.assertEqual(comment.author, self.user)


class TaskAPITest(APITestCase):
    """Тесты для tasks API - тестирование реальных endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            owner=self.user
        )
        self.board = TaskBoard.objects.create(
            title='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )

    def test_create_task_board_success(self):
        """Тест успешного создания доски задач через API"""
        self.client.force_authenticate(user=self.user)
        url = reverse('taskboard-list')
        payload = {
            'title': 'New Task Board',
            'description': 'A new task board',
            'workspace': self.workspace.id
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        board = TaskBoard.objects.get(id=res.data['id'])
        self.assertEqual(board.title, payload['title'])
        self.assertEqual(board.workspace, self.workspace)

    def test_create_task_board_unauthenticated(self):
        """Тест что аутентификация требуется для создания доски задач через API"""
        url = reverse('taskboard-list')
        payload = {'title': 'New Board'}
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_task_boards(self):
        """Тест получения списка досок задач через API"""
        self.client.force_authenticate(user=self.user)
        url = reverse('taskboard-list')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['title'], self.board.title)

    def test_create_task_success(self):
        """Тест успешного создания задачи через API"""
        self.client.force_authenticate(user=self.user)
        url = reverse('task-list')
        payload = {
            'title': 'New Task',
            'description': 'A new task',
            'board': self.board.id
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        task = Task.objects.get(id=res.data['id'])
        self.assertEqual(task.title, payload['title'])
        self.assertEqual(task.board, self.board)

    def test_create_task_comment_success(self):
        """Тест успешного создания комментария к задаче через API"""
        task = Task.objects.create(
            title='Test Task',
            board=self.board,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('taskcomment-list')
        payload = {
            'content': 'Test comment',
            'task': task.id
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        comment = TaskComment.objects.get(id=res.data['id'])
        self.assertEqual(comment.content, payload['content'])
        self.assertEqual(comment.task, task)

    def test_get_task_detail(self):
        """Тест получения деталей задачи через API"""
        task = Task.objects.create(
            title='Test Task',
            board=self.board,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('task-detail', args=[task.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], task.title)
        self.assertEqual(res.data['id'], task.id)

    def test_update_task(self):
        """Тест обновления задачи через API"""
        task = Task.objects.create(
            title='Test Task',
            board=self.board,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('task-detail', args=[task.id])
        payload = {'title': 'Updated Task'}
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.title, 'Updated Task')

    def test_delete_task(self):
        """Тест удаления задачи через API"""
        task = Task.objects.create(
            title='Test Task',
            board=self.board,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('task-detail', args=[task.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())
