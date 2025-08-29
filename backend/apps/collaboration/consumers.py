"""
WebSocket consumer для совместной работы в реальном времени
"""
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Any
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from backend.apps.workspaces.models import Workspace, WorkspaceMember
from backend.apps.notes.models import Page
from backend.apps.databases.models import Database
from backend.apps.tasks.models import TaskBoard, Task
from backend.apps.notifications.models import Notification
from .models import ActiveSession

User = get_user_model()


class CollaborationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer для совместной работы в реальном времени"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.workspace_id = None
        self.resource_type = None
        self.resource_id = None
        self.session_id = None
        self.room_group_name = None

    async def connect(self):
        """Подключение пользователя к WebSocket"""
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated:
            await self.close()
            return

        # Извлекаем параметры из URL
        self.workspace_id = self.scope['url_route']['kwargs']['workspace_id']
        self.resource_type = self.scope['url_route']['kwargs']['resource_type']
        self.resource_id = self.scope['url_route']['kwargs']['resource_id']
        
        # Проверяем доступ к ресурсу
        has_access = await self.check_resource_access()
        if not has_access:
            await self.close()
            return

        # Создаем группу для комнаты
        self.room_group_name = f"collab_{self.resource_type}_{self.resource_id}"
        self.session_id = str(uuid.uuid4())

        # Присоединяемся к группе
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Создаем активную сессию
        await self.create_active_session()

        # Уведомляем других о подключении
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': str(self.user.id),
                'user_name': self.user.full_name or self.user.email,
                'session_id': self.session_id,
                'timestamp': datetime.now(timezone.utc).isoformat(),
            }
        )

        # Отправляем список активных пользователей
        await self.send_active_users()

    async def disconnect(self, close_code):
        """Отключение пользователя от WebSocket"""
        if hasattr(self, 'room_group_name') and self.room_group_name:
            # Уведомляем других об отключении
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': str(self.user.id),
                    'session_id': self.session_id,
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                }
            )

            # Удаляем активную сессию
            await self.remove_active_session()

            # Покидаем группу
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Получение сообщения от клиента"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'content_change':
                await self.handle_content_change(data)
            elif message_type == 'cursor_position':
                await self.handle_cursor_position(data)
            elif message_type == 'selection_change':
                await self.handle_selection_change(data)
            elif message_type == 'save_content':
                await self.handle_save_content(data)
            elif message_type == 'typing_start':
                await self.handle_typing_start(data)
            elif message_type == 'typing_stop':
                await self.handle_typing_stop(data)
            else:
                await self.send_error('Unknown message type')
                
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON')
        except Exception as e:
            await self.send_error(f'Error processing message: {str(e)}')

    async def handle_content_change(self, data):
        """Обработка изменений контента"""
        change_data = {
            'type': 'content_change',
            'user_id': str(self.user.id),
            'user_name': self.user.full_name or self.user.email,
            'session_id': self.session_id,
            'changes': data.get('changes', []),
            'version': data.get('version'),
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }

        # Отправляем изменения всем кроме отправителя
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_content_change',
                'data': change_data,
                'sender_channel': self.channel_name,
            }
        )

    async def handle_cursor_position(self, data):
        """Обработка изменения позиции курсора"""
        cursor_data = {
            'type': 'cursor_position',
            'user_id': str(self.user.id),
            'user_name': self.user.full_name or self.user.email,
            'session_id': self.session_id,
            'position': data.get('position'),
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }

        # Отправляем позицию курсора всем кроме отправителя
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_cursor_position',
                'data': cursor_data,
                'sender_channel': self.channel_name,
            }
        )

    async def handle_selection_change(self, data):
        """Обработка изменения выделения текста"""
        selection_data = {
            'type': 'selection_change',
            'user_id': str(self.user.id),
            'user_name': self.user.full_name or self.user.email,
            'session_id': self.session_id,
            'selection': data.get('selection'),
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }

        # Отправляем выделение всем кроме отправителя
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_selection_change',
                'data': selection_data,
                'sender_channel': self.channel_name,
            }
        )

    async def handle_save_content(self, data):
        """Обработка сохранения контента"""
        try:
            content = data.get('content')
            version = data.get('version')
            
            if self.resource_type == 'page':
                await self.save_page_content(content, version)
            elif self.resource_type == 'database':
                await self.save_database_content(content, version)
            elif self.resource_type == 'task':
                await self.save_task_content(content, version)
            
            # Уведомляем всех о сохранении
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_content_saved',
                    'data': {
                        'type': 'content_saved',
                        'user_id': str(self.user.id),
                        'user_name': self.user.full_name or self.user.email,
                        'version': version,
                        'timestamp': datetime.now(timezone.utc).isoformat(),
                    }
                }
            )
            
        except Exception as e:
            await self.send_error(f'Error saving content: {str(e)}')

    async def handle_typing_start(self, data):
        """Обработка начала печати"""
        typing_data = {
            'type': 'typing_start',
            'user_id': str(self.user.id),
            'user_name': self.user.full_name or self.user.email,
            'session_id': self.session_id,
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_typing_start',
                'data': typing_data,
                'sender_channel': self.channel_name,
            }
        )

    async def handle_typing_stop(self, data):
        """Обработка окончания печати"""
        typing_data = {
            'type': 'typing_stop',
            'user_id': str(self.user.id),
            'session_id': self.session_id,
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_typing_stop',
                'data': typing_data,
                'sender_channel': self.channel_name,
            }
        )

    # Методы для трансляции сообщений

    async def user_joined(self, event):
        """Трансляция подключения пользователя"""
        await self.send(text_data=json.dumps(event))

    async def user_left(self, event):
        """Трансляция отключения пользователя"""
        await self.send(text_data=json.dumps(event))

    async def broadcast_content_change(self, event):
        """Трансляция изменений контента"""
        if self.channel_name != event.get('sender_channel'):
            await self.send(text_data=json.dumps(event['data']))

    async def broadcast_cursor_position(self, event):
        """Трансляция позиции курсора"""
        if self.channel_name != event.get('sender_channel'):
            await self.send(text_data=json.dumps(event['data']))

    async def broadcast_selection_change(self, event):
        """Трансляция изменения выделения"""
        if self.channel_name != event.get('sender_channel'):
            await self.send(text_data=json.dumps(event['data']))

    async def broadcast_content_saved(self, event):
        """Трансляция сохранения контента"""
        await self.send(text_data=json.dumps(event['data']))

    async def broadcast_typing_start(self, event):
        """Трансляция начала печати"""
        if self.channel_name != event.get('sender_channel'):
            await self.send(text_data=json.dumps(event['data']))

    async def broadcast_typing_stop(self, event):
        """Трансляция окончания печати"""
        if self.channel_name != event.get('sender_channel'):
            await self.send(text_data=json.dumps(event['data']))

    async def notification_message(self, event):
        """Трансляция уведомления"""
        await self.send(text_data=json.dumps(event['data']))

    # Вспомогательные методы

    async def send_error(self, message):
        """Отправка сообщения об ошибке"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message,
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }))

    async def send_active_users(self):
        """Отправка списка активных пользователей"""
        active_users = await self.get_active_users()
        await self.send(text_data=json.dumps({
            'type': 'active_users',
            'users': active_users,
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }))

    @database_sync_to_async
    def check_resource_access(self):
        """Проверка доступа к ресурсу"""
        try:
            workspace = Workspace.objects.get(id=self.workspace_id)
            member = WorkspaceMember.objects.get(
                workspace=workspace, 
                user=self.user
            )
            
            if self.resource_type == 'page':
                Page.objects.get(id=self.resource_id, workspace=workspace)
            elif self.resource_type == 'database':
                Database.objects.get(id=self.resource_id, workspace=workspace)
            elif self.resource_type == 'task':
                Task.objects.get(id=self.resource_id, board__workspace=workspace)
            else:
                return False
                
            return True
        except ObjectDoesNotExist:
            return False

    @database_sync_to_async
    def create_active_session(self):
        """Создание активной сессии"""
        ActiveSession.objects.create(
            user=self.user,
            session_id=self.session_id,
            resource_type=self.resource_type,
            resource_id=self.resource_id,
            workspace_id=self.workspace_id,
            last_seen=datetime.now(timezone.utc)
        )

    @database_sync_to_async
    def remove_active_session(self):
        """Удаление активной сессии"""
        ActiveSession.objects.filter(
            user=self.user,
            session_id=self.session_id
        ).delete()

    @database_sync_to_async
    def get_active_users(self):
        """Получение списка активных пользователей"""
        sessions = ActiveSession.objects.filter(
            resource_type=self.resource_type,
            resource_id=self.resource_id
        ).select_related('user')
        
        return [
            {
                'user_id': str(session.user.id),
                'user_name': session.user.full_name or session.user.email,
                'session_id': session.session_id,
                'last_seen': session.last_seen.isoformat(),
            }
            for session in sessions
        ]

    @database_sync_to_async
    def save_page_content(self, content, version):
        """Сохранение содержимого страницы"""
        page = Page.objects.get(id=self.resource_id)
        page.content = content
        page.save()

    @database_sync_to_async
    def save_database_content(self, content, version):
        """Сохранение содержимого базы данных"""
        # Реализация сохранения данных базы данных
        pass

    @database_sync_to_async
    def save_task_content(self, content, version):
        """Сохранение содержимого задачи"""
        task = Task.objects.get(id=self.resource_id)
        task.description = content.get('description', task.description)
        task.save()


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer для уведомлений"""

    async def connect(self):
        print(f"NotificationConsumer.connect() called for user: {self.scope['user']}")
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated:
            print(f"User not authenticated, closing connection")
            await self.close()
            return

        print(f"User authenticated: {self.user.email}")
        self.user_group_name = f"user_{self.user.id}"
        print(f"User group name: {self.user_group_name}")

        # Присоединяемся к персональной группе пользователя
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        print(f"Added to channel layer group: {self.user_group_name}")

        await self.accept()
        print(f"WebSocket connection accepted for user: {self.user.email}")

    async def disconnect(self, close_code):
        print(f"NotificationConsumer.disconnect() called with code: {close_code}")
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
            print(f"Removed from channel layer group: {self.user_group_name}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_read':
                notification_id = data.get('notification_id')
                await self.mark_notification_read(notification_id)
            elif message_type == 'ping':
                # Отвечаем на ping для keep-alive
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
                
        except json.JSONDecodeError:
            pass

    async def notification_message(self, event):
        """Отправка уведомления пользователю"""
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Отметка уведомления как прочитанного"""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=self.user
            )
            notification.is_read = True
            notification.read_at = datetime.now(timezone.utc)
            notification.save()
        except ObjectDoesNotExist:
            pass