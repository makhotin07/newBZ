"""
Тесты для создания баз данных через API
"""
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from backend.apps.databases.models import Database, DatabaseProperty
from backend.apps.workspaces.models import Workspace
from backend.apps.accounts.models import User


class TestDatabaseCreation(TestCase):
    """Тесты создания баз данных"""
    
    def setUp(self):
        """Настройка тестов"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            description='Test workspace for testing',
            owner=self.user
        )
        self.workspace.members.create(user=self.user, role='admin')
        self.client.force_authenticate(user=self.user)
    
    def test_create_database_success(self):
        """Тест успешного создания базы данных"""
        from django.urls import reverse
        
        url = reverse('database-list')
        data = {
            'title': 'Test Database',
            'description': 'Test database description',
            'workspace': self.workspace.id,
            'default_view': 'table'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Database.objects.count(), 1)
        
        database = Database.objects.first()
        self.assertEqual(database.title, 'Test Database')
        self.assertEqual(database.description, 'Test database description')
        self.assertEqual(database.workspace, self.workspace)
        self.assertEqual(database.created_by, self.user)
        
        # Проверяем, что создалось свойство по умолчанию
        self.assertEqual(database.properties.count(), 1)
        title_property = database.properties.first()
        self.assertEqual(title_property.name, 'Title')
        self.assertEqual(title_property.type, 'text')
    
    def test_create_database_missing_workspace(self):
        """Тест создания базы данных без workspace"""
        from django.urls import reverse
        
        url = reverse('database-list')
        data = {
            'title': 'Test Database',
            'description': 'Test database description',
            'default_view': 'table'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('workspace', response.data)
        self.assertEqual(Database.objects.count(), 0)
    
    def test_create_database_unauthorized_workspace(self):
        """Тест создания базы данных в workspace без доступа"""
        unauthorized_workspace = Workspace.objects.create(
            name='Unauthorized Workspace',
            description='Workspace without user access',
            owner=self.user
        )
        
        from django.urls import reverse
        
        url = reverse('database-list')
        data = {
            'title': 'Test Database',
            'description': 'Test database description',
            'workspace': unauthorized_workspace.id,
            'default_view': 'table'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('workspace', response.data)
        self.assertEqual(Database.objects.count(), 0)
    
    def test_create_database_unauthenticated(self):
        """Тест создания базы данных без аутентификации"""
        self.client.force_authenticate(user=None)
        
        from django.urls import reverse
        
        url = reverse('database-list')
        data = {
            'title': 'Test Database',
            'description': 'Test database description',
            'workspace': self.workspace.id,
            'default_view': 'table'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Database.objects.count(), 0)
