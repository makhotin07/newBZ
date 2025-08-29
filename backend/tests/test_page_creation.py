"""
Тесты для проверки создания страниц
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from backend.apps.notes.models import Page
from backend.apps.workspaces.models import Workspace, WorkspaceMember

User = get_user_model()


@pytest.fixture
def api_client():
    """API клиент для тестирования"""
    return APIClient()


@pytest.fixture
def user():
    """Тестовый пользователь"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def workspace(user):
    """Тестовое рабочее пространство"""
    workspace = Workspace.objects.create(
        name='Test Workspace',
        owner=user
    )
    # Добавляем пользователя как участника
    WorkspaceMember.objects.create(
        workspace=workspace,
        user=user,
        role='owner'
    )
    return workspace


@pytest.fixture
def authenticated_client(api_client, user):
    """Аутентифицированный API клиент"""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.mark.django_db
class TestPageCreation:
    """Тесты для создания страниц"""
    
    def test_create_page_success(self, authenticated_client, workspace):
        """Тест успешного создания страницы"""
        data = {
            'title': 'Test Page',
            'workspace': workspace.id,
            'content': {'text': 'Test content'}
        }
        
        response = authenticated_client.post('/api/notes/pages/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'Test Page'
        assert response.data['author'] == 'testuser'  # Проверяем, что author установлен
        
        # Проверяем в базе данных
        page = Page.objects.get(id=response.data['id'])
        assert page.author.username == 'testuser'
        assert page.last_edited_by.username == 'testuser'
    
    def test_create_page_without_author_fails(self, api_client, workspace):
        """Тест что создание страницы без авторизации не удается"""
        data = {
            'title': 'Test Page',
            'workspace': workspace.id,
            'content': {'text': 'Test content'}
        }
        
        response = api_client.post('/api/notes/pages/', data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_page_with_parent(self, authenticated_client, workspace):
        """Тест создания страницы с родительской страницей"""
        # Создаем родительскую страницу
        parent_page = Page.objects.create(
            title='Parent Page',
            workspace=workspace,
            author=authenticated_client.handler._force_user,
            last_edited_by=authenticated_client.handler._force_user
        )
        
        data = {
            'title': 'Child Page',
            'workspace': workspace.id,
            'parent': parent_page.id,
            'content': {'text': 'Child content'}
        }
        
        response = authenticated_client.post('/api/notes/pages/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['parent'] == parent_page.id
        
        # Проверяем в базе данных
        child_page = Page.objects.get(id=response.data['id'])
        assert child_page.parent == parent_page
        assert child_page.author.username == 'testuser'
    
    def test_create_page_with_tags(self, authenticated_client, workspace):
        """Тест создания страницы с тегами"""
        from backend.apps.notes.models import Tag
        
        # Создаем теги
        tag1 = Tag.objects.create(name='Important', color='#FF0000')
        tag2 = Tag.objects.create(name='Work', color='#00FF00')
        
        data = {
            'title': 'Tagged Page',
            'workspace': workspace.id,
            'content': {'text': 'Page with tags'},
            'tag_ids': [tag1.id, tag2.id]
        }
        
        response = authenticated_client.post('/api/notes/pages/', data)
        
        assert response.status_code == status.HTTP_201_CREATED
        
        # Проверяем в базе данных
        page = Page.objects.get(id=response.data['id'])
        assert page.tags.count() == 2
        assert tag1 in page.tags.all()
        assert tag2 in page.tags.all()
