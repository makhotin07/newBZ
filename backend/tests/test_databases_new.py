"""
Тесты для нового Database API
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from backend.apps.workspaces.models import Workspace, WorkspaceMember
from backend.apps.databases.models import Database

User = get_user_model()


class DatabaseModelTest(TestCase):
    """Тесты модели Database"""
    
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

    def test_create_database(self):
        """Тест создания базы данных"""
        database = Database.objects.create(
            title='Test Database',
            description='A test database',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(database.title, 'Test Database')
        self.assertEqual(database.description, 'A test database')
        self.assertEqual(database.workspace, self.workspace)
        self.assertEqual(database.created_by, self.user)


class DatabaseAPITest(APITestCase):
    """Тесты для Database API"""

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

    def test_create_database_success(self):
        """Тест успешного создания базы данных через API"""
        self.client.force_authenticate(user=self.user)
        url = reverse('database-list')
        payload = {
            'title': 'New Database',
            'description': 'A new database',
            'workspace': str(self.workspace.id)
        }
        res = self.client.post(url, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        database = Database.objects.get(id=res.data['id'])
        self.assertEqual(database.title, payload['title'])
        self.assertEqual(database.description, payload['description'])

    def test_get_database_detail(self):
        """Тест получения деталей базы данных через API"""
        database = Database.objects.create(
            title='Test Database',
            description='Test description',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('database-detail', args=[database.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], database.title)
        self.assertEqual(res.data['description'], database.description)

    def test_list_databases(self):
        """Тест получения списка баз данных через API"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('database-list')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['title'], database.title)

    def test_update_database(self):
        """Тест обновления базы данных через API"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('database-detail', args=[database.id])
        payload = {'title': 'Updated Database'}
        res = self.client.patch(url, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        database.refresh_from_db()
        self.assertEqual(database.title, 'Updated Database')

    def test_delete_database(self):
        """Тест удаления базы данных через API"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('database-detail', args=[database.id])
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Database.objects.filter(id=database.id).exists())
