from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceSettings

User = get_user_model()


class WorkspaceMemberSerializer(serializers.ModelSerializer):
    """Сериалайзер для участников рабочего пространства"""
    user_id = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    
    def get_user_id(self, obj):
        try:
            return obj.user.id
        except (AttributeError, TypeError):
            return None
    
    def get_user_email(self, obj):
        try:
            return obj.user.email
        except (AttributeError, TypeError):
            return str(obj.user)
    
    def get_user_name(self, obj):
        try:
            return obj.user.full_name
        except (AttributeError, TypeError):
            return obj.user.email or str(obj.user)
    
    class Meta:
        model = WorkspaceMember
        fields = [
            'id', 'user', 'user_id', 'user_email', 'user_name',
            'role', 'joined_at'
        ]


class WorkspaceSettingsSerializer(serializers.ModelSerializer):
    """Сериалайзер для настроек рабочего пространства"""
    class Meta:
        model = WorkspaceSettings
        fields = [
            'allow_member_invites', 'allow_public_pages', 'default_page_permissions',
            'enable_comments', 'enable_page_history'
        ]


class WorkspaceSerializer(serializers.ModelSerializer):
    """Сериалайзер для рабочих пространств"""
    owner = serializers.StringRelatedField(read_only=True)
    owner_id = serializers.IntegerField(read_only=True)
    members_count = serializers.SerializerMethodField()
    member_role = serializers.SerializerMethodField()
    settings = WorkspaceSettingsSerializer(read_only=True)
    
    class Meta:
        model = Workspace
        fields = [
            'id', 'name', 'description', 'icon', 'color', 'owner', 'owner_id',
            'is_personal', 'members_count', 'member_role', 'settings',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def get_member_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = obj.members.filter(user=request.user).first()
            return member.role if member else None
        return None
    
    def create(self, validated_data):
        request = self.context['request']
        workspace = Workspace.objects.create(
            owner=request.user,
            **validated_data
        )
        
        # Add owner as admin member
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=request.user,
            role='owner'
        )
        
        # Create default settings
        WorkspaceSettings.objects.create(workspace=workspace)
        
        return workspace


class WorkspaceDetailSerializer(WorkspaceSerializer):
    members = WorkspaceMemberSerializer(many=True, read_only=True)
    
    class Meta(WorkspaceSerializer.Meta):
        fields = WorkspaceSerializer.Meta.fields + ['members']


class WorkspaceInvitationSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    invited_by_name = serializers.SerializerMethodField()
    
    def get_invited_by_name(self, obj):
        if obj.invited_by:
            return obj.invited_by.full_name
        return None
    
    class Meta:
        model = WorkspaceInvitation
        fields = [
            'id', 'workspace', 'workspace_name', 'email', 'role', 
            'invited_by', 'invited_by_name', 'status', 'token',
            'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'token', 'created_at', 'expires_at']


class InviteUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=WorkspaceMember.ROLE_CHOICES,
        default='viewer'
    )
