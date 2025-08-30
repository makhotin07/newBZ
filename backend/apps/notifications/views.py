"""
Импорты ViewSets из API слоя (Clean Architecture)
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, NotificationSettings, Reminder
from .serializers import NotificationSerializer, NotificationSettingsSerializer, ReminderSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet для уведомлений"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """Получение queryset с фильтрацией"""
        queryset = Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')
        
        # Фильтрация по непрочитанным
        unread_only = self.request.query_params.get('unread_only', '').lower() == 'true'
        if unread_only:
            queryset = queryset.filter(is_read=False)
        
        # Пагинация
        page_size = self.request.query_params.get('page_size')
        if page_size and page_size.isdigit():
            queryset = queryset[:int(page_size)]
        
        return queryset
    
    def perform_update(self, serializer):
        """Обновить уведомление (например, отметить как прочитанное)"""
        serializer.save()
    
    def perform_destroy(self, instance):
        """Удалить уведомление"""
        instance.delete()
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Отметить все уведомления как прочитанные"""
        try:
            count = self.get_queryset().filter(is_read=False).update(is_read=True)
            return Response({
                'message': f'Отмечено {count} уведомлений как прочитанные'
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class NotificationSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet для настроек уведомлений"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSettingsSerializer
    
    def get_queryset(self):
        return NotificationSettings.objects.filter(
            user=self.request.user
        )
    
    def list(self, request, *args, **kwargs):
        """Переопределяем list для возврата одного объекта без пагинации"""
        obj = self.get_object()
        serializer = self.get_serializer(obj)
        return Response(serializer.data)
    
    def get_object(self):
        """Получить или создать настройки пользователя"""
        obj = NotificationSettings.objects.filter(user=self.request.user).first()
        if not obj:
            # Создаем настройки по умолчанию
            obj = NotificationSettings.objects.create(
                user=self.request.user,
                email_on_comment=True,
                email_on_mention=True,
                email_on_page_share=True,
                email_on_task_assigned=True,
                email_on_task_due=True,
                email_on_workspace_invite=True,
                push_on_comment=True,
                push_on_mention=True,
                push_on_page_share=True,
                push_on_task_assigned=True,
                push_on_task_due=True,
                push_on_workspace_invite=True,
                daily_digest=False,
                weekly_digest=False
            )
        return obj


class ReminderViewSet(viewsets.ModelViewSet):
    """ViewSet для напоминаний"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReminderSerializer
    
    def get_queryset(self):
        return Reminder.objects.filter(
            user=self.request.user
        )
    
    def perform_create(self, serializer):
        """Создать напоминание с привязкой к пользователю"""
        serializer.save(user=self.request.user)
