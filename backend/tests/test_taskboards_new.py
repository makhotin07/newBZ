"""
Тесты для нового TaskBoard API
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from backend.apps.workspaces.models import Workspace, WorkspaceMember
from backend.apps.tasks.models import TaskBoard

User = get_user_model()


class TaskBoardModelTest(TestCase):
    """Тесты модели TaskBoard"""
    
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
        WorkspaceMember.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='admin'
        )

    def test_create_task_board(self):
        """Тест создания доски задач"""
        board = TaskBoard.objects.create(
            title='Test Board',
            description='A test board',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(board.title, 'Test Board')
        self.assertEqual(board.description, 'A test board')
        self.assertEqual(board.workspace, self.workspace)
        self.assertEqual(board.created_by, self.user)


class TaskBoardAPITest(APITestCase):
    """Тесты для TaskBoard API"""

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
        WorkspaceMember.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='admin'
        )

    def test_create_task_board_success(self):
        """Тест успешного создания доски задач через API"""
        self.client.force_authenticate(user=self.user)
        url = reverse('taskboard-list')
        payload = {
            'title': 'New Task Board',
            'description': 'A new task board',
            'workspace': str(self.workspace.id)
        }
        res = self.client.post(url, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        board = TaskBoard.objects.get(id=res.data['id'])
        self.assertEqual(board.title, payload['title'])
        self.assertEqual(board.description, payload['description'])

    def test_get_task_board_detail(self):
        """Тест получения деталей доски задач через API"""
        board = TaskBoard.objects.create(
            title='Test Board',
            description='Test description',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('taskboard-detail', args=[board.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], board.title)
        self.assertEqual(res.data['description'], board.description)

    def test_list_task_boards(self):
        """Тест получения списка досок задач через API"""
        board = TaskBoard.objects.create(
            title='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('taskboard-list')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['title'], board.title)

    def test_update_task_board(self):
        """Тест обновления доски задач через API"""
        board = TaskBoard.objects.create(
            title='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('taskboard-detail', args=[board.id])
        payload = {'title': 'Updated Board'}
        res = self.client.patch(url, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        board.refresh_from_db()
        self.assertEqual(board.title, 'Updated Board')

    def test_delete_task_board(self):
        """Тест удаления доски задач через API"""
        board = TaskBoard.objects.create(
            title='Test Board',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('taskboard-detail', args=[board.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(TaskBoard.objects.filter(id=board.id).exists())
