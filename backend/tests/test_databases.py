"""
Тесты для databases модуля - тестирование реальных API endpoints
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from backend.apps.workspaces.models import Workspace
from backend.apps.databases.models import Database, DatabaseProperty, DatabaseRecord

User = get_user_model()


class DatabaseModelTest(TestCase):
    """Тесты для моделей databases"""

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

    def test_create_database_property(self):
        """Тест создания свойства базы данных"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        property_obj = DatabaseProperty.objects.create(
            name='Test Property',
            type='text',
            database=database,
            position=1
        )

        self.assertEqual(property_obj.name, 'Test Property')
        self.assertEqual(property_obj.type, 'text')
        self.assertEqual(property_obj.database, database)

    def test_create_database_record(self):
        """Тест создания записи базы данных"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        record = DatabaseRecord.objects.create(
            database=database,
            properties={'name': 'Test Record'},
            created_by=self.user,
            last_edited_by=self.user
        )

        self.assertEqual(record.database, database)
        self.assertEqual(record.properties['name'], 'Test Record')
        self.assertEqual(record.created_by, self.user)


class DatabaseAPITest(APITestCase):
    """Тесты для databases API - тестирование реальных endpoints"""

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

    def test_create_database_success(self):
        """Тест успешного создания базы данных через API"""
        self.client.force_authenticate(user=self.user)
        url = reverse('database-list')
        payload = {
            'title': 'New Database',
            'description': 'A new database',
            'workspace': self.workspace.id
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        database = Database.objects.get(id=res.data['id'])
        self.assertEqual(database.title, payload['title'])
        self.assertEqual(database.description, payload['description'])

    def test_create_database_unauthenticated(self):
        """Тест что аутентификация требуется для создания базы данных через API"""
        url = reverse('database-list')
        payload = {'title': 'New Database'}
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

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
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        database.refresh_from_db()
        self.assertEqual(database.title, 'Updated Database')

    def test_create_database_property_success(self):
        """Тест успешного создания свойства базы данных через API"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('databaseproperty-list')
        payload = {
            'name': 'New Property',
            'type': 'number',
            'database': database.id,
            'position': 1
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        property_obj = DatabaseProperty.objects.get(id=res.data['id'])
        self.assertEqual(property_obj.name, payload['name'])
        self.assertEqual(property_obj.type, payload['type'])

    def test_create_database_record_success(self):
        """Тест успешного создания записи базы данных через API"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('databaserecord-list')
        payload = {
            'properties': {'name': 'New Record'},
            'database': database.id
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        record = DatabaseRecord.objects.get(id=res.data['id'])
        self.assertEqual(record.properties['name'], 'New Record')
        self.assertEqual(record.database, database)

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
