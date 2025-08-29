"""
Импорты ViewSets из API слоя (Clean Architecture)
"""
# TODO: Создать сервисы и API контроллеры для уведомлений
# Пока используем простые CRUD операции

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, NotificationSettings, Reminder
from .serializers import NotificationSerializer, NotificationSettingsSerializer, ReminderSerializer, BulkMarkReadSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для уведомлений (только чтение)"""
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
    
    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        """Отметить уведомления как прочитанные"""
        serializer = BulkMarkReadSerializer(data=request.data)
        if serializer.is_valid():
            if serializer.validated_data.get('all'):
                # Отметить все как прочитанные
                self.get_queryset().update(is_read=True)
                return Response({'message': 'Все уведомления отмечены как прочитанные'})
            else:
                # Отметить конкретные уведомления
                notification_ids = serializer.validated_data.get('notification_ids', [])
                Notification.objects.filter(
                    id__in=notification_ids,
                    recipient=request.user
                ).update(is_read=True)
                return Response({'message': f'Отмечено {len(notification_ids)} уведомлений'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet для настроек уведомлений"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSettingsSerializer
    
    def get_queryset(self):
        return NotificationSettings.objects.filter(
            user=self.request.user
        )


class ReminderViewSet(viewsets.ModelViewSet):
    """ViewSet для напоминаний"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReminderSerializer
    
    def get_queryset(self):
        return Reminder.objects.filter(
            user=self.request.user
        )
