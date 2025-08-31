"""
WebSocket consumers для совместной работы (Clean Architecture)
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
import logging

from backend.apps.workspaces.models import Workspace, WorkspaceMember
from backend.apps.notes.models import Page
from backend.apps.databases.models import Database
from backend.apps.tasks.models import TaskBoard, Task
from backend.apps.collaboration.models import ActiveSession
from backend.services.collaboration_service import CollaborationService

User = get_user_model()
logger = logging.getLogger(__name__)


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
        self.collaboration_service = None

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
        
        # Инициализация сервиса
        self.collaboration_service = CollaborationService(
            user=self.user,
            workspace_id=self.workspace_id,
            resource_type=self.resource_type,
            resource_id=self.resource_id
        )
        
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

        # Создаем активную сессию через сервис
        await self.collaboration_service.create_active_session(self.session_id)

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

            # Удаляем активную сессию через сервис
            if self.collaboration_service:
                await self.collaboration_service.remove_active_session(self.session_id)

            # Покидаем группу
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Обработка входящих сообщений"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'cursor_move':
                await self.handle_cursor_move(data)
            elif message_type == 'selection_change':
                await self.handle_selection_change(data)
            elif message_type == 'content_change':
                await self.handle_content_change(data)
            elif message_type == 'comment_add':
                await self.handle_comment_add(data)
            elif message_type == 'reaction_add':
                await self.handle_reaction_add(data)
            else:
                await self.send(text_data=json.dumps({
                    'error': 'Неизвестный тип сообщения'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Неверный формат JSON'
            }))

    async def handle_cursor_move(self, data):
        """Обработка движения курсора"""
        cursor_data = {
            'user_id': str(self.user.id),
            'user_name': self.user.full_name or self.user.email,
            'position': data.get('position'),
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }
        
        # Отправляем всем участникам
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'cursor_moved',
                'data': cursor_data
            }
        )

    async def handle_selection_change(self, data):
        """Обработка изменения выделения"""
        selection_data = {
            'user_id': str(self.user.id),
            'user_name': self.user.full_name or self.user.email,
            'selection': data.get('selection'),
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'selection_changed',
                'data': selection_data
            }
        )

    async def handle_content_change(self, data):
        """Обработка изменения контента"""
        # Сохраняем изменения через сервис
        if self.collaboration_service:
            await self.collaboration_service.save_content_change(data)
        
        # Отправляем всем участникам
        change_data = {
            'user_id': str(self.user.id),
            'user_name': self.user.full_name or self.user.email,
            'changes': data.get('changes'),
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'content_changed',
                'data': change_data
            }
        )

    async def handle_comment_add(self, data):
        """Обработка добавления комментария"""
        # Добавляем комментарий через сервис
        if self.collaboration_service:
            comment = await self.collaboration_service.add_comment(data)
            data['comment_id'] = comment.id
        
        # Отправляем всем участникам
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'comment_added',
                'data': data
            }
        )

    async def handle_reaction_add(self, data):
        """Обработка добавления реакции"""
        # Добавляем реакцию через сервис
        if self.collaboration_service:
            reaction = await self.collaboration_service.add_reaction(data)
            data['reaction_id'] = reaction.id
        
        # Отправляем всем участникам
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'reaction_added',
                'data': data
            }
        )

    async def send_active_users(self):
        """Отправка списка активных пользователей"""
        if self.collaboration_service:
            active_users = await self.collaboration_service.get_active_users()
            await self.send(text_data=json.dumps({
                'type': 'active_users',
                'users': active_users
            }))

    @database_sync_to_async
    def check_resource_access(self):
        """Проверка доступа к ресурсу"""
        try:
            if self.resource_type == 'page':
                resource = Page.objects.get(
                    id=self.resource_id,
                    workspace_id=self.workspace_id,
                    workspace__members__user=self.user
                )
            elif self.resource_type == 'database':
                resource = Database.objects.get(
                    id=self.resource_id,
                    workspace_id=self.workspace_id,
                    workspace__members__user=self.user
                )
            elif self.resource_type == 'task':
                resource = Task.objects.get(
                    id=self.resource_id,
                    board__workspace_id=self.workspace_id,
                    board__workspace__members__user=self.user
                )
            else:
                return False
            
            return True
        except ObjectDoesNotExist:
            return False

    # WebSocket event handlers
    async def user_joined(self, event):
        """Обработка подключения пользователя"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user_id': event['user_id'],
            'user_name': event['user_name'],
            'session_id': event['session_id'],
            'timestamp': event['timestamp'],
        }))

    async def user_left(self, event):
        """Обработка отключения пользователя"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id'],
            'session_id': event['session_id'],
            'timestamp': event['timestamp'],
        }))

    async def cursor_moved(self, event):
        """Обработка движения курсора"""
        await self.send(text_data=json.dumps({
            'type': 'cursor_moved',
            'data': event['data']
        }))

    async def selection_changed(self, event):
        """Обработка изменения выделения"""
        await self.send(text_data=json.dumps({
            'type': 'selection_changed',
            'data': event['data']
        }))

    async def content_changed(self, event):
        """Обработка изменения контента"""
        await self.send(text_data=json.dumps({
            'type': 'content_changed',
            'data': event['data']
        }))

    async def comment_added(self, event):
        """Обработка добавления комментария"""
        await self.send(text_data=json.dumps({
            'type': 'comment_added',
            'data': event['data']
        }))

    async def reaction_added(self, event):
        """Обработка добавления реакции"""
        await self.send(text_data=json.dumps({
            'type': 'reaction_added',
            'data': event['data']
        }))


class DatabaseCollaborationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer для real-time обновлений базы данных"""
    
    async def connect(self):
        """Подключение к WebSocket"""
        self.database_id = self.scope['url_route']['kwargs']['database_id']
        self.room_group_name = f'database_{self.database_id}'
        
        # Проверяем авторизацию пользователя
        user = self.scope.get('user')
        if not user or user.is_anonymous:
            await self.close()
            return
        
        # Проверяем доступ к базе данных
        has_access = await self.check_database_access(user, self.database_id)
        if not has_access:
            await self.close()
            return
        
        # Присоединяемся к группе
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Уведомляем о подключении пользователя
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': str(user.id),
                'username': user.username
            }
        )
    
    async def disconnect(self, close_code):
        """Отключение от WebSocket"""
        # Покидаем группу
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Уведомляем об отключении пользователя
        user = self.scope.get('user')
        if user and not user.is_anonymous:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': str(user.id),
                    'username': user.username
                }
            )
    
    async def receive(self, text_data):
        """Обработка входящих сообщений"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'record_update':
                await self.handle_record_update(data)
            elif message_type == 'record_create':
                await self.handle_record_create(data)
            elif message_type == 'record_delete':
                await self.handle_record_delete(data)
            elif message_type == 'property_update':
                await self.handle_property_update(data)
            elif message_type == 'comment_create':
                await self.handle_comment_create(data)
            
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
        except Exception as e:
            logger.error(f"Error processing message: {e}")
    
    async def handle_record_update(self, data):
        """Обработка обновления записи"""
        user = self.scope.get('user')
        record_id = data.get('record_id')
        changes = data.get('changes', {})
        
        # Рассылаем обновление всем участникам
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'record_updated',
                'record_id': record_id,
                'changes': changes,
                'updated_by': {
                    'id': str(user.id),
                    'username': user.username
                }
            }
        )
    
    async def handle_record_create(self, data):
        """Обработка создания записи"""
        user = self.scope.get('user')
        record_data = data.get('record_data', {})
        
        # Рассылаем уведомление о создании
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'record_created',
                'record_data': record_data,
                'created_by': {
                    'id': str(user.id),
                    'username': user.username
                }
            }
        )
    
    async def handle_record_delete(self, data):
        """Обработка удаления записи"""
        user = self.scope.get('user')
        record_id = data.get('record_id')
        
        # Рассылаем уведомление об удалении
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'record_deleted',
                'record_id': record_id,
                'deleted_by': {
                    'id': str(user.id),
                    'username': user.username
                }
            }
        )
    
    async def handle_property_update(self, data):
        """Обработка изменения свойств базы данных"""
        user = self.scope.get('user')
        property_data = data.get('property_data', {})
        
        # Рассылаем уведомление об изменении структуры
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'property_updated',
                'property_data': property_data,
                'updated_by': {
                    'id': str(user.id),
                    'username': user.username
                }
            }
        )
    
    async def handle_comment_create(self, data):
        """Обработка создания комментария"""
        user = self.scope.get('user')
        comment_data = data.get('comment_data', {})
        
        # Рассылаем уведомление о новом комментарии
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'comment_created',
                'comment_data': comment_data,
                'created_by': {
                    'id': str(user.id),
                    'username': user.username
                }
            }
        )
    
    # Обработчики групповых сообщений
    async def user_joined(self, event):
        """Пользователь присоединился"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user_id': event['user_id'],
            'username': event['username']
        }))
    
    async def user_left(self, event):
        """Пользователь покинул"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id'],
            'username': event['username']
        }))
    
    async def record_updated(self, event):
        """Запись обновлена"""
        await self.send(text_data=json.dumps({
            'type': 'record_updated',
            'record_id': event['record_id'],
            'changes': event['changes'],
            'updated_by': event['updated_by']
        }))
    
    async def record_created(self, event):
        """Запись создана"""
        await self.send(text_data=json.dumps({
            'type': 'record_created',
            'record_data': event['record_data'],
            'created_by': event['created_by']
        }))
    
    async def record_deleted(self, event):
        """Запись удалена"""
        await self.send(text_data=json.dumps({
            'type': 'record_deleted',
            'record_id': event['record_id'],
            'deleted_by': event['deleted_by']
        }))
    
    async def property_updated(self, event):
        """Свойство обновлено"""
        await self.send(text_data=json.dumps({
            'type': 'property_updated',
            'property_data': event['property_data'],
            'updated_by': event['updated_by']
        }))
    
    async def comment_created(self, event):
        """Комментарий создан"""
        await self.send(text_data=json.dumps({
            'type': 'comment_created',
            'comment_data': event['comment_data'],
            'created_by': event['created_by']
        }))
    
    @database_sync_to_async
    def check_database_access(self, user, database_id):
        """Проверка доступа пользователя к базе данных"""
        try:
            from backend.apps.databases.models import Database
            database = Database.objects.get(
                id=database_id,
                workspace__members__user=user
            )
            return True
        except Database.DoesNotExist:
            return False
