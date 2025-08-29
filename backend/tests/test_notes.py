"""
Тесты для notes модуля - тестирование реальных API endpoints
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from backend.apps.workspaces.models import Workspace
from backend.apps.notes.models import Page, Tag, Comment

User = get_user_model()


class NoteModelTest(TestCase):
    """Тесты для моделей notes"""

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

    def test_create_page(self):
        """Тест создания страницы"""
        page = Page.objects.create(
            title='Test Page',
            content='Test content',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(page.title, 'Test Page')
        self.assertEqual(page.content, 'Test content')
        self.assertEqual(page.workspace, self.workspace)
        self.assertEqual(page.created_by, self.user)

    def test_create_tag(self):
        """Тест создания тега"""
        tag = Tag.objects.create(
            name='Test Tag',
            color='#FF0000',
            workspace=self.workspace,
            created_by=self.user
        )

        self.assertEqual(tag.name, 'Test Tag')
        self.assertEqual(tag.color, '#FF0000')
        self.assertEqual(tag.workspace, self.workspace)

    def test_create_comment(self):
        """Тест создания комментария"""
        page = Page.objects.create(
            title='Test Page',
            workspace=self.workspace,
            created_by=self.user
        )
        
        comment = Comment.objects.create(
            content='Test comment',
            page=page,
            author=self.user
        )

        self.assertEqual(comment.content, 'Test comment')
        self.assertEqual(comment.page, page)
        self.assertEqual(comment.author, self.user)


class NoteAPITest(APITestCase):
    """Тесты для notes API - тестирование реальных endpoints"""

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

    def test_create_page_success(self):
        """Тест успешного создания страницы через API"""
        self.client.force_authenticate(user=self.user)
        url = reverse('page-list')
        payload = {
            'title': 'New Page',
            'content': 'New page content',
            'workspace': self.workspace.id
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        page = Page.objects.get(id=res.data['id'])
        self.assertEqual(page.title, payload['title'])
        self.assertEqual(page.content, payload['content'])

    def test_create_page_unauthenticated(self):
        """Тест что аутентификация требуется для создания страницы через API"""
        url = reverse('page-list')
        payload = {'title': 'New Page'}
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_pages(self):
        """Тест получения списка страниц через API"""
        page = Page.objects.create(
            title='Test Page',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('page-list')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['title'], page.title)

    def test_get_page_detail(self):
        """Тест получения деталей страницы через API"""
        page = Page.objects.create(
            title='Test Page',
            content='Test content',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('page-detail', args=[page.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], page.title)
        self.assertEqual(res.data['content'], page.content)

    def test_update_page(self):
        """Тест обновления страницы через API"""
        page = Page.objects.create(
            title='Test Page',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('page-detail', args=[page.id])
        payload = {'title': 'Updated Page'}
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        page.refresh_from_db()
        self.assertEqual(page.title, 'Updated Page')

    def test_create_tag_success(self):
        """Тест успешного создания тега через API"""
        self.client.force_authenticate(user=self.user)
        url = reverse('tag-list')
        payload = {
            'name': 'New Tag',
            'color': '#00FF00',
            'workspace': self.workspace.id
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        tag = Tag.objects.get(id=res.data['id'])
        self.assertEqual(tag.name, payload['name'])
        self.assertEqual(tag.color, payload['color'])

    def test_create_comment_success(self):
        """Тест успешного создания комментария через API"""
        page = Page.objects.create(
            title='Test Page',
            workspace=self.workspace,
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('comment-list')
        payload = {
            'content': 'New comment',
            'page': page.id
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        comment = Comment.objects.get(id=res.data['id'])
        self.assertEqual(comment.content, payload['content'])
        self.assertEqual(comment.page, page)
