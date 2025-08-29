"""
Тесты для API уведомлений
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from backend.apps.notifications.models import Notification, NotificationSettings

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
def authenticated_client(api_client, user):
    """Аутентифицированный API клиент"""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def notification(user):
    """Тестовое уведомление"""
    return Notification.objects.create(
        recipient=user,
        type='comment',
        title='Test Notification',
        message='This is a test notification'
    )


@pytest.mark.django_db
class TestNotificationAPI:
    """Тесты для API уведомлений"""
    
    def test_get_notifications_unauthorized(self, api_client):
        """Тест получения уведомлений без авторизации"""
        response = api_client.get('/api/notifications/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_notifications_authorized(self, authenticated_client, notification):
        """Тест получения уведомлений с авторизацией"""
        response = authenticated_client.get('/api/notifications/')
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 1
    
    def test_get_notifications_filtered(self, authenticated_client, notification):
        """Тест фильтрации уведомлений"""
        # Создаем прочитанное уведомление
        read_notification = Notification.objects.create(
            recipient=notification.recipient,
            type='mention',
            title='Read Notification',
            message='This is read',
            is_read=True
        )
        
        # Тест фильтрации по непрочитанным
        response = authenticated_client.get('/api/notifications/?unread_only=true')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['id'] == str(notification.id)
    
    def test_get_notifications_paginated(self, authenticated_client, notification):
        """Тест пагинации уведомлений"""
        response = authenticated_client.get('/api/notifications/?page_size=1')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_mark_notifications_read_all(self, authenticated_client, notification):
        """Тест отметки всех уведомлений как прочитанных"""
        response = authenticated_client.post(
            '/api/notifications/mark_read/',
            {'all': True}
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'Все уведомления отмечены как прочитанные' in response.data['message']
        
        # Проверяем, что уведомление отмечено как прочитанное
        notification.refresh_from_db()
        assert notification.is_read is True
    
    def test_mark_specific_notifications_read(self, authenticated_client, notification):
        """Тест отметки конкретных уведомлений как прочитанных"""
        response = authenticated_client.post(
            '/api/notifications/mark_read/',
            {'notification_ids': [str(notification.id)]}
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'Отмечено 1 уведомлений' in response.data['message']
        
        # Проверяем, что уведомление отмечено как прочитанное
        notification.refresh_from_db()
        assert notification.is_read is True
    
    def test_mark_notifications_read_invalid_data(self, authenticated_client):
        """Тест валидации данных для отметки уведомлений"""
        response = authenticated_client.post(
            '/api/notifications/mark_read/',
            {}
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestNotificationSettingsAPI:
    """Тесты для API настроек уведомлений"""
    
    def test_get_notification_settings(self, authenticated_client, user):
        """Тест получения настроек уведомлений"""
        # Создаем настройки
        settings = NotificationSettings.objects.create(user=user)
        
        response = authenticated_client.get('/api/notification-settings/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == settings.id
    
    def test_update_notification_settings(self, authenticated_client, user):
        """Тест обновления настроек уведомлений"""
        settings = NotificationSettings.objects.create(user=user)
        
        response = authenticated_client.patch(
            f'/api/notification-settings/{settings.id}/',
            {'email_on_comment': False}
        )
        assert response.status_code == status.HTTP_200_OK
        
        settings.refresh_from_db()
        assert settings.email_on_comment is False
