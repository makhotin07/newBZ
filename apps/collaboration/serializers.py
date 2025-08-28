from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ActiveSession, CollaborativeEdit, ShareLink

User = get_user_model()


class ActiveSessionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    page_title = serializers.CharField(source='page.title', read_only=True)
    database_title = serializers.CharField(source='database.title', read_only=True)
    
    class Meta:
        model = ActiveSession
        fields = [
            'id', 'user', 'user_name', 'user_email', 'user_avatar',
            'page', 'page_title', 'database', 'database_title',
            'session_id', 'cursor_position', 'selection',
            'last_seen', 'connected_at'
        ]
        read_only_fields = ['id', 'user', 'last_seen', 'connected_at']

    def get_user_avatar(self, obj):
        try:
            avatar = getattr(obj.user, 'avatar', None)
            if avatar and getattr(avatar, 'name', None):
                return avatar.url
        except ValueError:
            pass
        return None


class CollaborativeEditSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    page_title = serializers.CharField(source='page.title', read_only=True)
    
    class Meta:
        model = CollaborativeEdit
        fields = [
            'id', 'page', 'page_title', 'database_record', 'user', 'user_name',
            'operation', 'version', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ShareLinkSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    page_title = serializers.CharField(source='page.title', read_only=True)
    database_title = serializers.CharField(source='database.title', read_only=True)
    workspace_name = serializers.SerializerMethodField()
    absolute_url = serializers.ReadOnlyField(source='get_absolute_url')
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = ShareLink
        fields = [
            'id', 'page', 'page_title', 'database', 'database_title',
            'workspace_name', 'token', 'permission', 'created_by', 'created_by_name',
            'is_active', 'expires_at', 'password', 'view_count', 'last_accessed',
            'absolute_url', 'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'token', 'created_by', 'view_count', 'last_accessed', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_workspace_name(self, obj):
        if obj.page:
            return obj.page.workspace.name
        elif obj.database:
            return obj.database.workspace.name
        return None
    
    def get_is_expired(self, obj):
        if not obj.expires_at:
            return False
        from django.utils import timezone
        return obj.expires_at < timezone.now()
    
    def create(self, validated_data):
        import secrets
        import string
        
        # Generate unique token
        token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
        validated_data['token'] = token
        validated_data['created_by'] = self.context['request'].user
        
        return super().create(validated_data)
    
    def validate(self, attrs):
        # Ensure either page or database is provided, but not both
        page = attrs.get('page')
        database = attrs.get('database')
        
        if not page and not database:
            raise serializers.ValidationError("Either 'page' or 'database' must be provided")
        
        if page and database:
            raise serializers.ValidationError("Cannot share both 'page' and 'database' in the same link")
        
        return attrs


class ShareLinkAccessSerializer(serializers.Serializer):
    """For accessing shared content"""
    password = serializers.CharField(required=False, allow_blank=True)


class CreateShareLinkSerializer(serializers.Serializer):
    """Simplified serializer for creating share links"""
    content_type = serializers.ChoiceField(choices=['page', 'database'])
    content_id = serializers.UUIDField()
    permission = serializers.ChoiceField(
        choices=ShareLink.PERMISSION_CHOICES,
        default='read'
    )
    expires_in_days = serializers.IntegerField(required=False, min_value=1, max_value=365)
    password = serializers.CharField(required=False, allow_blank=True, max_length=128)
    
    def validate(self, attrs):
        from apps.notes.models import Page
        from apps.databases.models import Database
        
        content_type = attrs['content_type']
        content_id = attrs['content_id']
        request = self.context['request']
        
        # Validate that content exists and user has access
        if content_type == 'page':
            try:
                page = Page.objects.get(id=content_id)
                # Check if user has access to this page's workspace
                if not page.workspace.members.filter(user=request.user).exists():
                    raise serializers.ValidationError("You don't have access to this page")
                attrs['page'] = page
            except Page.DoesNotExist:
                raise serializers.ValidationError("Page not found")
        
        elif content_type == 'database':
            try:
                database = Database.objects.get(id=content_id)
                # Check if user has access to this database's workspace
                if not database.workspace.members.filter(user=request.user).exists():
                    raise serializers.ValidationError("You don't have access to this database")
                attrs['database'] = database
            except Database.DoesNotExist:
                raise serializers.ValidationError("Database not found")
        
        return attrs
    
    def create(self, validated_data):
        import secrets
        import string
        from django.utils import timezone
        from datetime import timedelta
        
        # Generate unique token
        token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
        
        share_link_data = {
            'token': token,
            'permission': validated_data['permission'],
            'created_by': self.context['request'].user,
        }
        
        # Set content
        if 'page' in validated_data:
            share_link_data['page'] = validated_data['page']
        elif 'database' in validated_data:
            share_link_data['database'] = validated_data['database']
        
        # Set expiration
        if 'expires_in_days' in validated_data:
            share_link_data['expires_at'] = timezone.now() + timedelta(days=validated_data['expires_in_days'])
        
        # Set password if provided
        if validated_data.get('password'):
            from django.contrib.auth.hashers import make_password
            share_link_data['password'] = make_password(validated_data['password'])
        
        return ShareLink.objects.create(**share_link_data)


class SharedContentSerializer(serializers.Serializer):
    """For returning shared content data"""
    type = serializers.CharField()
    title = serializers.CharField()
    content = serializers.JSONField()
    workspace_name = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    
    # Additional page-specific fields
    icon = serializers.CharField(required=False)
    cover_image = serializers.URLField(required=False)
    
    # Additional database-specific fields
    properties = serializers.ListField(required=False)
    records = serializers.ListField(required=False)
    
    # Share link info
    permission = serializers.CharField()
    view_count = serializers.IntegerField()


class OperationalTransformSerializer(serializers.Serializer):
    """For operational transform operations in collaborative editing"""
    operation_type = serializers.ChoiceField(choices=['insert', 'delete', 'retain'])
    position = serializers.IntegerField(min_value=0)
    content = serializers.CharField(required=False, allow_blank=True)
    length = serializers.IntegerField(required=False, min_value=0)
    attributes = serializers.DictField(required=False)


class CursorPositionSerializer(serializers.Serializer):
    """For tracking cursor positions in collaborative editing"""
    block_id = serializers.UUIDField(required=False)
    position = serializers.IntegerField(min_value=0)
    selection_start = serializers.IntegerField(required=False, min_value=0)
    selection_end = serializers.IntegerField(required=False, min_value=0)
