from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from apps.workspaces.models import Workspace
from apps.notes.models import Note, Tag
from apps.tasks.models import TaskBoard, TaskStatus, Task
from .models import SearchHistory, SavedSearch
from .services import SearchService

User = get_user_model()


class SearchServiceTest(TestCase):
    """Tests for search service"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )
        
        # Create test content
        self.note = Note.objects.create(
            title='Test Note About Python',
            content='This note contains information about Python programming.',
            workspace=self.workspace,
            created_by=self.user
        )
        
        tag = Tag.objects.create(name='python')
        self.note.tags.add(tag)
        
        self.board = TaskBoard.objects.create(
            name='Development Board',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.status = TaskStatus.objects.create(
            name='To Do',
            board=self.board,
            order=0
        )
        
        self.task = Task.objects.create(
            title='Learn Python Basics',
            description='Complete Python tutorial',
            board=self.board,
            status=self.status,
            created_by=self.user
        )

    def test_search_pages(self):
        """Test searching pages"""
        search_service = SearchService(self.user, str(self.workspace.id))
        results = search_service.search('Python', 'pages')
        
        self.assertGreater(results['total_count'], 0)
        self.assertEqual(results['results'][0]['content_type'], 'page')
        self.assertEqual(results['results'][0]['title'], self.note.title)

    def test_search_tasks(self):
        """Test searching tasks"""
        search_service = SearchService(self.user, str(self.workspace.id))
        results = search_service.search('Python', 'tasks')
        
        self.assertGreater(results['total_count'], 0)
        self.assertEqual(results['results'][0]['content_type'], 'task')
        self.assertEqual(results['results'][0]['title'], self.task.title)

    def test_search_all_types(self):
        """Test searching all content types"""
        search_service = SearchService(self.user, str(self.workspace.id))
        results = search_service.search('Python', 'all')
        
        self.assertGreater(results['total_count'], 0)
        
        # Should find both note and task
        content_types = [r['content_type'] for r in results['results']]
        self.assertIn('page', content_types)
        self.assertIn('task', content_types)

    def test_search_with_filters(self):
        """Test searching with filters"""
        search_service = SearchService(self.user, str(self.workspace.id))
        filters = {'tags': ['python']}
        results = search_service.search('', 'pages', filters)
        
        self.assertGreater(results['total_count'], 0)
        self.assertEqual(results['results'][0]['title'], self.note.title)

    def test_search_history_creation(self):
        """Test that search history is created"""
        search_service = SearchService(self.user, str(self.workspace.id))
        search_service.search('Python')
        
        history = SearchHistory.objects.filter(
            user=self.user,
            query='Python'
        )
        self.assertTrue(history.exists())

    def test_autocomplete_suggestions(self):
        """Test autocomplete suggestions"""
        search_service = SearchService(self.user, str(self.workspace.id))
        suggestions = search_service.get_autocomplete_suggestions('Pyt')
        
        # Should suggest based on existing content
        self.assertGreater(len(suggestions), 0)


class SearchAPITest(APITestCase):
    """Tests for search API"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )
        
        # Create test content
        self.note = Note.objects.create(
            title='Django Tutorial',
            content='Learn Django web framework',
            workspace=self.workspace,
            created_by=self.user
        )

    def test_search_endpoint(self):
        """Test search API endpoint"""
        self.client.force_authenticate(user=self.user)
        url = reverse('search-search')
        payload = {
            'query': 'Django',
            'search_type': 'all',
            'workspace_id': str(self.workspace.id)
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('results', res.data)
        self.assertIn('total_count', res.data)

    def test_quick_search_endpoint(self):
        """Test quick search API endpoint"""
        self.client.force_authenticate(user=self.user)
        url = reverse('quick-search')
        payload = {
            'query': 'Django',
            'workspace_id': str(self.workspace.id)
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('pages', res.data)
        self.assertIn('tasks', res.data)
        self.assertIn('databases', res.data)

    def test_autocomplete_endpoint(self):
        """Test autocomplete API endpoint"""
        self.client.force_authenticate(user=self.user)
        url = reverse('search-autocomplete')
        res = self.client.get(url, {'q': 'Dja', 'workspace_id': str(self.workspace.id)})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data, list)

    def test_search_history_endpoint(self):
        """Test search history API endpoint"""
        # Create search history
        SearchHistory.objects.create(
            user=self.user,
            workspace=self.workspace,
            query='Django',
            search_type='all',
            results_count=1
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('searchhistory-list')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)
        self.assertEqual(res.data['results'][0]['query'], 'Django')

    def test_clear_search_history(self):
        """Test clearing search history"""
        SearchHistory.objects.create(
            user=self.user,
            workspace=self.workspace,
            query='Django',
            search_type='all',
            results_count=1
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('searchhistory-clear')
        res = self.client.delete(url)

        self.assertEqual(res.status_status, status.HTTP_200_OK)
        self.assertFalse(
            SearchHistory.objects.filter(user=self.user).exists()
        )

    def test_create_saved_search(self):
        """Test creating saved search"""
        self.client.force_authenticate(user=self.user)
        url = reverse('savedsearch-list')
        payload = {
            'name': 'Django Resources',
            'query': 'Django',
            'search_type': 'pages',
            'workspace_id': str(self.workspace.id),
            'filters': {'tags': ['tutorial']}
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        saved_search = SavedSearch.objects.get(id=res.data['id'])
        self.assertEqual(saved_search.name, payload['name'])
        self.assertEqual(saved_search.user, self.user)

    def test_execute_saved_search(self):
        """Test executing saved search"""
        saved_search = SavedSearch.objects.create(
            user=self.user,
            workspace=self.workspace,
            name='Django Search',
            query='Django',
            search_type='all',
            filters={}
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('savedsearch-execute', args=[saved_search.id])
        res = self.client.post(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('results', res.data)
        self.assertIn('total_count', res.data)

    def test_search_permissions(self):
        """Test that search respects workspace permissions"""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )
        
        self.client.force_authenticate(user=other_user)
        url = reverse('search-search')
        payload = {
            'query': 'Django',
            'workspace_id': str(self.workspace.id)
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Should return no results as user is not member of workspace
        self.assertEqual(res.data['total_count'], 0)


class SavedSearchModelTest(TestCase):
    """Tests for SavedSearch model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            created_by=self.user
        )

    def test_create_saved_search(self):
        """Test creating saved search"""
        saved_search = SavedSearch.objects.create(
            user=self.user,
            workspace=self.workspace,
            name='Python Resources',
            query='Python',
            search_type='all',
            filters={'tags': ['python']}
        )

        self.assertEqual(saved_search.name, 'Python Resources')
        self.assertEqual(saved_search.user, self.user)
        self.assertEqual(saved_search.workspace, self.workspace)
        self.assertEqual(saved_search.query, 'Python')
        self.assertFalse(saved_search.is_public)

    def test_saved_search_str(self):
        """Test saved search string representation"""
        saved_search = SavedSearch.objects.create(
            user=self.user,
            workspace=self.workspace,
            name='Python Resources',
            query='Python',
            search_type='all'
        )

        expected_str = f'{self.user.email}: Python Resources'
        self.assertEqual(str(saved_search), expected_str)
