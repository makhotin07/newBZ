from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import uuid

User = get_user_model()


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('comment', 'Comment'),
        ('mention', 'Mention'),
        ('page_shared', 'Page Shared'),
        ('task_assigned', 'Task Assigned'),
        ('task_due', 'Task Due'),
        ('workspace_invite', 'Workspace Invite'),
        ('database_updated', 'Database Updated'),
        ('reminder', 'Reminder'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='sent_notifications'
    )
    
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Generic relation to any object
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=100, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Additional data
    metadata = models.JSONField(default=dict)
    
    is_read = models.BooleanField(default=False)
    is_email_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification for {self.recipient.email}: {self.title}"


class NotificationSettings(models.Model):
    """User notification preferences"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_settings'
    )
    
    # Email notifications
    email_on_comment = models.BooleanField(default=True)
    email_on_mention = models.BooleanField(default=True)
    email_on_page_share = models.BooleanField(default=True)
    email_on_task_assigned = models.BooleanField(default=True)
    email_on_task_due = models.BooleanField(default=True)
    email_on_workspace_invite = models.BooleanField(default=True)
    
    # In-app notifications
    push_on_comment = models.BooleanField(default=True)
    push_on_mention = models.BooleanField(default=True)
    push_on_page_share = models.BooleanField(default=True)
    push_on_task_assigned = models.BooleanField(default=True)
    push_on_task_due = models.BooleanField(default=True)
    push_on_workspace_invite = models.BooleanField(default=True)
    
    # Digest settings
    daily_digest = models.BooleanField(default=False)
    weekly_digest = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Notification settings for {self.user.email}"


class Reminder(models.Model):
    """User-set reminders"""
    REMINDER_TYPES = [
        ('page', 'Page'),
        ('task', 'Task'),
        ('custom', 'Custom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    
    type = models.CharField(max_length=10, choices=REMINDER_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    
    # Generic relation to any object
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=100, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    remind_at = models.DateTimeField()
    is_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['remind_at']
    
    def __str__(self):
        return f"Reminder for {self.user.email}: {self.title}"
