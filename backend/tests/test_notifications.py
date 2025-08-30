"""
Тесты для API уведомлений
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from backend.apps.notifications.models import Notification, NotificationSettings, Reminder

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


@pytest.fixture
def reminder(user):
    """Тестовое напоминание"""
    from django.utils import timezone
    return Reminder.objects.create(
        user=user,
        type='custom',
        title='Test Reminder',
        message='This is a test reminder',
        remind_at=timezone.now()
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
            '/api/notifications/mark_all_read/'
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'Отмечено' in response.data['message']
        
        # Проверяем, что уведомление отмечено как прочитанное
        notification.refresh_from_db()
        assert notification.is_read is True
    
    def test_mark_single_notification_read(self, authenticated_client, notification):
        """Тест отметки одного уведомления как прочитанного"""
        response = authenticated_client.patch(
            f'/api/notifications/{notification.id}/',
            {'is_read': True}
        )
        assert response.status_code == status.HTTP_200_OK
        
        # Проверяем, что уведомление отмечено как прочитанное
        notification.refresh_from_db()
        assert notification.is_read is True
    
    def test_delete_notification(self, authenticated_client, notification):
        """Тест удаления уведомления"""
        response = authenticated_client.delete(
            f'/api/notifications/{notification.id}/'
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Проверяем, что уведомление удалено
        assert not Notification.objects.filter(id=notification.id).exists()


@pytest.mark.django_db
class TestNotificationSettingsAPI:
    """Тесты для API настроек уведомлений"""
    
    def test_get_notification_settings(self, authenticated_client, user):
        """Тест получения настроек уведомлений"""
        response = authenticated_client.get('/api/notification-settings/')
        assert response.status_code == status.HTTP_200_OK
        # Должны создаться настройки по умолчанию
        assert 'id' in response.data
    
    def test_update_notification_settings(self, authenticated_client, user):
        """Тест обновления настроек уведомлений"""
        # Сначала получаем настройки (они создадутся автоматически)
        get_response = authenticated_client.get('/api/notification-settings/')
        settings_id = get_response.data['id']
        
        response = authenticated_client.patch(
            f'/api/notification-settings/{settings_id}/',
            {'email_on_comment': False}
        )
        assert response.status_code == status.HTTP_200_OK
        
        # Проверяем, что настройка обновилась
        assert response.data['email_on_comment'] is False


@pytest.mark.django_db
class TestReminderAPI:
    """Тесты для API напоминаний"""
    
    def test_get_reminders_unauthorized(self, api_client):
        """Тест получения напоминаний без авторизации"""
        response = api_client.get('/api/reminders/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_reminders_authorized(self, authenticated_client, reminder):
        """Тест получения напоминаний с авторизацией"""
        response = authenticated_client.get('/api/reminders/')
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 1
    
    def test_create_reminder(self, authenticated_client, user):
        """Тест создания напоминания"""
        from django.utils import timezone
        
        data = {
            'title': 'New Reminder',
            'message': 'Test message',
            'type': 'custom',
            'remind_at': timezone.now().isoformat()
        }
        
        response = authenticated_client.post('/api/reminders/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'New Reminder'
    
    def test_update_reminder(self, authenticated_client, reminder):
        """Тест обновления напоминания"""
        response = authenticated_client.patch(
            f'/api/reminders/{reminder.id}/',
            {'title': 'Updated Reminder'}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Reminder'
    
    def test_delete_reminder(self, authenticated_client, reminder):
        """Тест удаления напоминания"""
        response = authenticated_client.delete(
            f'/api/reminders/{reminder.id}/'
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Проверяем, что напоминание удалено
        assert not Reminder.objects.filter(id=reminder.id).exists()
