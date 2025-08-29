"""
Тесты для API аналитики workspace
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from backend.apps.workspaces.models import Workspace, WorkspaceMember
from backend.apps.notes.models import Page, PageView
from backend.apps.tasks.models import Task, TaskBoard
from backend.apps.databases.models import Database, DatabaseRecord

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
class TestWorkspaceAnalyticsAPI:
    """Тесты для API аналитики workspace"""
    
    def test_analytics_overview_unauthorized(self, api_client, workspace):
        """Тест получения аналитики без авторизации"""
        response = api_client.get(f'/api/workspaces/analytics/overview/?workspace_id={workspace.id}')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_analytics_overview_missing_workspace_id(self, authenticated_client):
        """Тест получения аналитики без workspace_id"""
        response = authenticated_client.get('/api/workspaces/analytics/overview/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'workspace_id обязателен' in response.data['error']
    
    def test_analytics_overview_workspace_not_found(self, authenticated_client):
        """Тест получения аналитики для несуществующего workspace"""
        response = authenticated_client.get('/api/workspaces/analytics/overview/?workspace_id=999')
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert 'Workspace не найден или нет доступа' in response.data['error']
    
    def test_analytics_overview_success(self, authenticated_client, workspace):
        """Тест успешного получения аналитики"""
        response = authenticated_client.get(f'/api/workspaces/analytics/overview/?workspace_id={workspace.id}')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['workspace_id'] == workspace.id
        assert response.data['workspace_name'] == workspace.name
        assert response.data['period'] == 'last_30_days'
        
        # Проверяем структуру ответа
        assert 'pages' in response.data
        assert 'tasks' in response.data
        assert 'databases' in response.data
        assert 'members' in response.data
        assert 'activity' in response.data
    
    def test_analytics_with_data(self, authenticated_client, workspace, user):
        """Тест аналитики с реальными данными"""
        # Создаем страницу
        page = Page.objects.create(
            title='Test Page',
            workspace=workspace,
            author=user,
            last_edited_by=user,
            content={'text': 'Test content'}
        )
        
        # Создаем просмотр страницы
        PageView.objects.create(
            page=page,
            user=user,
            viewed_at=user.date_joined
        )
        
        # Создаем доску задач
        board = TaskBoard.objects.create(
            title='Test Board',
            workspace=workspace,
            owner=user
        )
        
        # Создаем задачу
        Task.objects.create(
            title='Test Task',
            board=board,
            assignee=user,
            created_by=user
        )
        
        # Создаем базу данных
        database = Database.objects.create(
            title='Test Database',
            workspace=workspace,
            owner=user
        )
        
        # Создаем запись
        DatabaseRecord.objects.create(
            database=database,
            created_by=user
        )
        
        response = authenticated_client.get(f'/api/workspaces/analytics/overview/?workspace_id={workspace.id}')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Проверяем статистику по страницам
        pages_data = response.data['pages']
        assert pages_data['total'] == 1
        assert pages_data['new_this_period'] == 1
        assert pages_data['views_this_period'] == 1
        
        # Проверяем статистику по задачам
        tasks_data = response.data['tasks']
        assert tasks_data['total'] == 1
        assert tasks_data['new_this_period'] == 1
        
        # Проверяем статистику по базам данных
        databases_data = response.data['databases']
        assert databases_data['total_databases'] == 1
        assert databases_data['new_databases_this_period'] == 1
        assert databases_data['total_records'] == 1
        assert databases_data['new_records_this_period'] == 1
        
        # Проверяем статистику по участникам
        members_data = response.data['members']
        assert members_data['total'] == 1
        assert members_data['new_this_week'] == 1
        
        # Проверяем активность
        activity_data = response.data['activity']
        assert 'daily_breakdown' in activity_data
        assert len(activity_data['daily_breakdown']) == 30  # 30 дней
        assert activity_data['total_activity_period'] > 0
    
    def test_analytics_access_control(self, authenticated_client, workspace):
        """Тест контроля доступа к аналитике"""
        # Создаем другого пользователя
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        
        # Пытаемся получить аналитику workspace, к которому нет доступа
        response = authenticated_client.get(f'/api/workspaces/analytics/overview/?workspace_id={workspace.id}')
        
        # Должен получить доступ, так как workspace принадлежит текущему пользователю
        assert response.status_code == status.HTTP_200_OK
        
        # Создаем другой workspace для другого пользователя
        other_workspace = Workspace.objects.create(
            name='Other Workspace',
            owner=other_user
        )
        
        # Пытаемся получить аналитику чужого workspace
        response = authenticated_client.get(f'/api/workspaces/analytics/overview/?workspace_id={other_workspace.id}')
        
        # Должен получить 404, так как нет доступа
        assert response.status_code == status.HTTP_404_NOT_FOUND
