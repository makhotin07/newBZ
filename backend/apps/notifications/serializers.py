from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, NotificationSettings, Reminder

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_avatar = serializers.SerializerMethodField()
    content_object_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'sender', 'sender_name', 'sender_avatar',
            'content_type', 'object_id', 'content_object_data', 'metadata',
            'is_read', 'is_email_sent', 'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'recipient', 'sender', 'created_at', 'read_at']
    
    def get_sender_avatar(self, obj):
        try:
            avatar = getattr(obj.sender, 'avatar', None)
            if avatar and getattr(avatar, 'name', None):
                return avatar.url
        except ValueError:
            pass
        return None
    
    def get_content_object_data(self, obj):
        """Return basic info about the related object"""
        if not obj.content_object:
            return None
        
        content_obj = obj.content_object
        
        # Page notification
        if hasattr(content_obj, 'title') and hasattr(content_obj, 'workspace'):
            return {
                'type': 'page',
                'id': str(content_obj.id),
                'title': content_obj.title,
                'workspace_id': str(content_obj.workspace.id),
                'workspace_name': content_obj.workspace.name
            }
        
        # Task notification
        elif hasattr(content_obj, 'title') and hasattr(content_obj, 'board'):
            return {
                'type': 'task',
                'id': str(content_obj.id),
                'title': content_obj.title,
                'board_id': str(content_obj.board.id),
                'board_title': content_obj.board.title
            }
        
        # Workspace notification
        elif hasattr(content_obj, 'name') and hasattr(content_obj, 'owner'):
            return {
                'type': 'workspace',
                'id': str(content_obj.id),
                'name': content_obj.name
            }
        
        # Database notification
        elif hasattr(content_obj, 'title') and hasattr(content_obj, 'workspace'):
            return {
                'type': 'database',
                'id': str(content_obj.id),
                'title': content_obj.title,
                'workspace_id': str(content_obj.workspace.id),
                'workspace_name': content_obj.workspace.name
            }
        
        return {
            'type': 'unknown',
            'id': str(content_obj.id) if hasattr(content_obj, 'id') else None
        }


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            'id', 'email_on_comment', 'email_on_mention', 'email_on_page_share',
            'email_on_task_assigned', 'email_on_task_due', 'email_on_workspace_invite',
            'push_on_comment', 'push_on_mention', 'push_on_page_share',
            'push_on_task_assigned', 'push_on_task_due', 'push_on_workspace_invite',
            'daily_digest', 'weekly_digest'
        ]


class ReminderSerializer(serializers.ModelSerializer):
    content_object_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Reminder
        fields = [
            'id', 'type', 'title', 'message', 'content_type', 'object_id',
            'content_object_data', 'remind_at', 'is_sent', 'created_at', 'sent_at'
        ]
        read_only_fields = ['id', 'user', 'is_sent', 'created_at', 'sent_at']
    
    def get_content_object_data(self, obj):
        """Return basic info about the related object"""
        if not obj.content_object:
            return None
        
        content_obj = obj.content_object
        
        if hasattr(content_obj, 'title'):
            return {
                'id': str(content_obj.id),
                'title': content_obj.title
            }
        elif hasattr(content_obj, 'name'):
            return {
                'id': str(content_obj.id),
                'name': content_obj.name
            }
        
        return {'id': str(content_obj.id) if hasattr(content_obj, 'id') else None}
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)



