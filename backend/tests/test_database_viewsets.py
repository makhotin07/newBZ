"""
Тесты для ViewSets баз данных (API контроллеры)
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from backend.apps.workspaces.models import Workspace, WorkspaceMember
from backend.apps.databases.models import Database, DatabaseProperty, DatabaseRecord, DatabaseView

User = get_user_model()


class DatabaseViewSetTest(APITestCase):
    """Тесты для DatabaseViewSet"""
    
    def setUp(self):
        """Настройка тестовых данных"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            owner=self.user
        )
        self.client.force_authenticate(user=self.user)
        
        # Создаем членство в workspace
        WorkspaceMember.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='admin'
        )
    
    def test_list_databases(self):
        """Тест получения списка баз данных"""
        # Создаем тестовую базу данных
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        url = reverse('database-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Проверяем, что наша база данных есть в списке
        # API возвращает данные в формате пагинации
        if 'results' in response.data:
            # Пагинированный ответ
            database_titles = [db['title'] for db in response.data['results'] if isinstance(db, dict)]
            self.assertIn('Test Database', database_titles)
        elif hasattr(response.data, '__iter__') and not isinstance(response.data, str):
            # Обычный список
            database_titles = [db['title'] for db in response.data if isinstance(db, dict)]
            self.assertIn('Test Database', database_titles)
        else:
            # Если response.data - это строка, проверяем что она содержит название
            self.assertIn('Test Database', str(response.data))
    
    def test_create_database(self):
        """Тест создания базы данных"""
        url = reverse('database-list')
        data = {
            'title': 'New Database',
            'description': 'Test description',
            'workspace': self.workspace.id
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Database')
        self.assertEqual(response.data['workspace'], self.workspace.id)
    
    def test_retrieve_database(self):
        """Тест получения базы данных по ID"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        url = reverse('database-detail', kwargs={'pk': database.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Database')
    
    def test_update_database(self):
        """Тест обновления базы данных"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        url = reverse('database-detail', kwargs={'pk': database.id})
        data = {'title': 'Updated Database'}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Database')
    
    def test_delete_database(self):
        """Тест удаления базы данных"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        url = reverse('database-detail', kwargs={'pk': database.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Database.objects.filter(id=database.id).exists())
    
    def test_database_properties_action(self):
        """Тест получения свойств базы данных через action"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        # Создаем свойство
        DatabaseProperty.objects.create(
            name='Test Property',
            type='text',
            database=database
        )
        
        url = reverse('database-properties', kwargs={'pk': database.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Property')
    
    def test_database_records_action(self):
        """Тест получения записей базы данных через action"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        # Создаем запись
        DatabaseRecord.objects.create(
            database=database,
            properties={'name': 'Test Record'},
            created_by=self.user,
            last_edited_by=self.user
        )
        
        url = reverse('database-records', kwargs={'pk': database.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['properties']['name'], 'Test Record')
    
    def test_database_views_action(self):
        """Тест получения представлений базы данных через action"""
        database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        
        # Создаем представление
        DatabaseView.objects.create(
            name='Test View',
            type='table',
            database=database,
            created_by=self.user
        )
        
        url = reverse('database-views', kwargs={'pk': database.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test View')


class DatabasePropertyViewSetTest(APITestCase):
    """Тесты для DatabasePropertyViewSet"""
    
    def setUp(self):
        """Настройка тестовых данных"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            owner=self.user
        )
        self.database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        self.client.force_authenticate(user=self.user)
        
        # Создаем членство в workspace
        WorkspaceMember.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='admin'
        )
    
    def test_list_properties(self):
        """Тест получения списка свойств базы данных"""
        # Создаем тестовое свойство
        property_obj = DatabaseProperty.objects.create(
            name='Test Property',
            type='text',
            database=self.database
        )
        
        url = reverse('database-property-list', kwargs={'database_pk': self.database.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Property')
    
    def test_create_property(self):
        """Тест создания свойства базы данных"""
        url = reverse('database-property-list', kwargs={'database_pk': self.database.id})
        data = {
            'name': 'New Property',
            'type': 'number',
            'position': 1
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Property')
        self.assertEqual(response.data['type'], 'number')
    
    def test_update_property(self):
        """Тест обновления свойства базы данных"""
        property_obj = DatabaseProperty.objects.create(
            name='Test Property',
            type='text',
            database=self.database
        )
        
        url = reverse('database-property-detail', kwargs={
            'database_pk': self.database.id,
            'pk': property_obj.id
        })
        data = {'name': 'Updated Property'}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Property')
    
    def test_delete_property(self):
        """Тест удаления свойства базы данных"""
        property_obj = DatabaseProperty.objects.create(
            name='Test Property',
            type='text',
            database=self.database
        )
        
        url = reverse('database-property-detail', kwargs={
            'database_pk': self.database.id,
            'pk': property_obj.id
        })
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DatabaseProperty.objects.filter(id=property_obj.id).exists())


class DatabaseRecordViewSetTest(APITestCase):
    """Тесты для DatabaseRecordViewSet"""
    
    def setUp(self):
        """Настройка тестовых данных"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            owner=self.user
        )
        self.database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        self.client.force_authenticate(user=self.user)
        
        # Создаем членство в workspace
        WorkspaceMember.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='admin'
        )
    
    def test_list_records(self):
        """Тест получения списка записей базы данных"""
        # Создаем тестовую запись
        record = DatabaseRecord.objects.create(
            database=self.database,
            properties={'name': 'Test Record'},
            created_by=self.user,
            last_edited_by=self.user
        )
        
        url = reverse('database-record-list', kwargs={'database_pk': self.database.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['properties']['name'], 'Test Record')
    
    def test_create_record(self):
        """Тест создания записи в базе данных"""
        url = reverse('database-record-list', kwargs={'database_pk': self.database.id})
        data = {
            'properties': {'name': 'New Record', 'value': 123}
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['properties']['name'], 'New Record')
        self.assertEqual(response.data['properties']['value'], 123)
    
    def test_retrieve_record(self):
        """Тест получения записи по ID"""
        record = DatabaseRecord.objects.create(
            database=self.database,
            properties={'name': 'Test Record'},
            created_by=self.user,
            last_edited_by=self.user
        )
        
        url = reverse('database-record-detail', kwargs={
            'database_pk': self.database.id,
            'pk': record.id
        })
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['properties']['name'], 'Test Record')
    
    def test_update_record(self):
        """Тест обновления записи"""
        record = DatabaseRecord.objects.create(
            database=self.database,
            properties={'name': 'Test Record'},
            created_by=self.user,
            last_edited_by=self.user
        )
        
        url = reverse('database-record-detail', kwargs={
            'database_pk': self.database.id,
            'pk': record.id
        })
        data = {'properties': {'name': 'Updated Record'}}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['properties']['name'], 'Updated Record')
    
    def test_delete_record(self):
        """Тест удаления записи"""
        record = DatabaseRecord.objects.create(
            database=self.database,
            properties={'name': 'Test Record'},
            created_by=self.user,
            last_edited_by=self.user
        )
        
        url = reverse('database-record-detail', kwargs={
            'database_pk': self.database.id,
            'pk': record.id
        })
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DatabaseRecord.objects.filter(id=record.id).exists())
    
    def test_filter_records(self):
        """Тест фильтрации записей"""
        # Создаем записи с разными пользователями
        record1 = DatabaseRecord.objects.create(
            database=self.database,
            properties={'name': 'Record 1'},
            created_by=self.user,
            last_edited_by=self.user
        )
        
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        record2 = DatabaseRecord.objects.create(
            database=self.database,
            properties={'name': 'Record 2'},
            created_by=other_user,
            last_edited_by=other_user
        )
        
        url = reverse('database-record-list', kwargs={'database_pk': self.database.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Проверяем, что возвращаются все записи (фильтрация не реализована)
        self.assertEqual(len(response.data), 2)
        # Проверяем, что записи содержат правильные данные
        record_names = [record['properties']['name'] for record in response.data]
        self.assertIn('Record 1', record_names)
        self.assertIn('Record 2', record_names)


class DatabaseViewViewSetTest(APITestCase):
    """Тесты для DatabaseViewViewSet"""
    
    def setUp(self):
        """Настройка тестовых данных"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            owner=self.user
        )
        self.database = Database.objects.create(
            title='Test Database',
            workspace=self.workspace,
            created_by=self.user
        )
        self.client.force_authenticate(user=self.user)
        
        # Создаем членство в workspace
        WorkspaceMember.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='admin'
        )
    
    def test_list_views(self):
        """Тест получения списка представлений базы данных"""
        # Создаем тестовое представление
        view = DatabaseView.objects.create(
            name='Test View',
            type='table',
            database=self.database,
            created_by=self.user
        )
        
        url = reverse('database-view-list', kwargs={'database_pk': self.database.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test View')
    
    def test_create_view(self):
        """Тест создания представления базы данных"""
        url = reverse('database-view-list', kwargs={'database_pk': self.database.id})
        data = {
            'name': 'New View',
            'type': 'board',
            'filters': [],
            'sorts': [],
            'groups': []
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New View')
        self.assertEqual(response.data['type'], 'board')
    
    def test_update_view(self):
        """Тест обновления представления"""
        view = DatabaseView.objects.create(
            name='Test View',
            type='table',
            database=self.database,
            created_by=self.user
        )
        
        url = reverse('database-view-detail', kwargs={
            'database_pk': self.database.id,
            'pk': view.id
        })
        data = {'name': 'Updated View'}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated View')
    
    def test_delete_view(self):
        """Тест удаления представления"""
        view = DatabaseView.objects.create(
            name='Test View',
            type='table',
            database=self.database,
            created_by=self.user
        )
        
        url = reverse('database-view-detail', kwargs={
            'database_pk': self.database.id,
            'pk': view.id
        })
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DatabaseView.objects.filter(id=view.id).exists())

