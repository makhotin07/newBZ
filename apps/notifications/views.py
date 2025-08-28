from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from .models import Notification, NotificationSettings, Reminder
from .serializers import (
    NotificationSerializer, NotificationSettingsSerializer,
    ReminderSerializer, BulkMarkReadSerializer
)


class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender').order_by('-created_at')
        
        # Filter by read status
        is_read = self.request.query_params.get('read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        
        # Filter by type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(type=notification_type)
        
        # Filter by date range
        since = self.request.query_params.get('since')
        if since:
            try:
                since_date = timezone.datetime.fromisoformat(since.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__gte=since_date)
            except ValueError:
                pass
        
        return queryset
    
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        
        # Add summary info
        user_notifications = Notification.objects.filter(recipient=request.user)
        summary = {
            'total': user_notifications.count(),
            'unread': user_notifications.filter(is_read=False).count(),
            'today': user_notifications.filter(
                created_at__date=timezone.now().date()
            ).count()
        }
        
        response.data = {
            'results': response.data['results'] if 'results' in response.data else response.data,
            'summary': summary,
            **{k: v for k, v in response.data.items() if k != 'results'}
        }
        
        return response


class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, notification_id):
        notification = get_object_or_404(
            Notification, 
            id=notification_id, 
            recipient=request.user
        )
        
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
        
        serializer = NotificationSerializer(notification, context={'request': request})
        return Response(serializer.data)


class MarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = BulkMarkReadSerializer(data=request.data)
        
        if serializer.is_valid():
            if serializer.validated_data.get('all', False):
                # Mark all unread notifications as read
                updated_count = Notification.objects.filter(
                    recipient=request.user,
                    is_read=False
                ).update(
                    is_read=True,
                    read_at=timezone.now()
                )
            else:
                # Mark specific notifications as read
                notification_ids = serializer.validated_data['notification_ids']
                updated_count = Notification.objects.filter(
                    id__in=notification_ids,
                    recipient=request.user,
                    is_read=False
                ).update(
                    is_read=True,
                    read_at=timezone.now()
                )
            
            return Response({
                'message': f'Marked {updated_count} notifications as read'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationSettingsView(RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        settings, created = NotificationSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


class ReminderListView(ListAPIView):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Reminder.objects.filter(
            user=self.request.user
        ).order_by('remind_at')
        
        # Filter by status
        is_sent = self.request.query_params.get('sent')
        if is_sent is not None:
            is_sent_bool = is_sent.lower() == 'true'
            queryset = queryset.filter(is_sent=is_sent_bool)
        
        # Filter by type
        reminder_type = self.request.query_params.get('type')
        if reminder_type:
            queryset = queryset.filter(type=reminder_type)
        
        # Filter by upcoming (next 7 days)
        upcoming = self.request.query_params.get('upcoming', 'false').lower() == 'true'
        if upcoming:
            from datetime import timedelta
            next_week = timezone.now() + timedelta(days=7)
            queryset = queryset.filter(
                remind_at__lte=next_week,
                is_sent=False
            )
        
        return queryset
    
    def post(self, request):
        serializer = ReminderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReminderDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'reminder_id'
    
    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)


# Utility functions for creating notifications
def create_notification(recipient, notification_type, title, message, sender=None, 
                       content_object=None, metadata=None):
    """Helper function to create notifications"""
    from django.contrib.contenttypes.models import ContentType
    
    notification_data = {
        'recipient': recipient,
        'type': notification_type,
        'title': title,
        'message': message,
        'sender': sender,
        'metadata': metadata or {}
    }
    
    if content_object:
        notification_data['content_type'] = ContentType.objects.get_for_model(content_object)
        notification_data['object_id'] = str(content_object.id)
    
    return Notification.objects.create(**notification_data)


def notify_page_comment(comment, mentioned_users=None):
    """Create notifications for page comments"""
    page = comment.page
    
    # Notify page author if they didn't comment
    if page.author != comment.author:
        create_notification(
            recipient=page.author,
            notification_type='comment',
            title=f'New comment on "{page.title}"',
            message=f'{comment.author.full_name} commented: {comment.content[:100]}...',
            sender=comment.author,
            content_object=page
        )
    
    # Notify mentioned users
    if mentioned_users:
        for user in mentioned_users:
            if user != comment.author:
                create_notification(
                    recipient=user,
                    notification_type='mention',
                    title=f'You were mentioned in "{page.title}"',
                    message=f'{comment.author.full_name} mentioned you: {comment.content[:100]}...',
                    sender=comment.author,
                    content_object=page
                )


def notify_task_assignment(task, assignee, assigner):
    """Create notification for task assignment"""
    if assignee != assigner:
        create_notification(
            recipient=assignee,
            notification_type='task_assigned',
            title=f'You were assigned to "{task.title}"',
            message=f'{assigner.full_name} assigned you to a task in {task.board.title}',
            sender=assigner,
            content_object=task
        )


def notify_workspace_invitation(invitation):
    """Create notification for workspace invitation"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        recipient = User.objects.get(email=invitation.email)
        create_notification(
            recipient=recipient,
            notification_type='workspace_invite',
            title=f'Invitation to join "{invitation.workspace.name}"',
            message=f'{invitation.invited_by.full_name} invited you to join their workspace',
            sender=invitation.invited_by,
            content_object=invitation.workspace,
            metadata={'invitation_token': invitation.token}
        )
    except User.DoesNotExist:
        pass  # User doesn't exist yet, will get notification via email


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_notification_api(request):
    """API endpoint for creating custom notifications"""
    from .serializers import CreateNotificationSerializer
    from django.contrib.auth import get_user_model
    from django.contrib.contenttypes.models import ContentType
    
    User = get_user_model()
    serializer = CreateNotificationSerializer(data=request.data)
    
    if serializer.is_valid():
        data = serializer.validated_data
        
        try:
            recipient = User.objects.get(id=data['recipient_id'])
        except User.DoesNotExist:
            return Response(
                {'error': 'Recipient not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        notification_data = {
            'recipient': recipient,
            'sender': request.user,
            'type': data['type'],
            'title': data['title'],
            'message': data['message'],
            'metadata': data.get('metadata', {})
        }
        
        # Add content object if provided
        if data.get('content_type_id') and data.get('object_id'):
            try:
                content_type = ContentType.objects.get(id=data['content_type_id'])
                notification_data['content_type'] = content_type
                notification_data['object_id'] = data['object_id']
            except ContentType.DoesNotExist:
                pass
        
        notification = Notification.objects.create(**notification_data)
        response_serializer = NotificationSerializer(notification, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
