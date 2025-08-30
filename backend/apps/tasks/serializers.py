"""
Сериалайзеры для задач
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TaskBoard, Task, TaskComment
from backend.apps.notes.models import Tag
from backend.apps.workspaces.models import Workspace
from backend.apps.tasks.models import TaskColumn

User = get_user_model()


class TaskBoardSerializer(serializers.ModelSerializer):
    """Сериалайзер для доски задач"""
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskBoard
        fields = [
            'id', 'title', 'description', 'workspace', 'workspace_name',
            'created_by', 'created_by_name', 'tasks_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_tasks_count(self, obj):
        return obj.tasks.count()


class TaskColumnSerializer(serializers.ModelSerializer):
    """Сериалайзер для колонок задач"""
    
    class Meta:
        model = TaskColumn
        fields = ['id', 'title', 'color', 'position', 'board']
        read_only_fields = ['id', 'board']


class TaskSerializer(serializers.ModelSerializer):
    """Сериалайзер для задач"""
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    board_title = serializers.CharField(source='board.title', read_only=True)
    column_title = serializers.CharField(source='column.title', read_only=True)
    tags = serializers.StringRelatedField(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        write_only=True,
        source='tags',
        required=False
    )
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'board', 'board_title', 
            'column', 'column_title', 'position', 'priority', 'status', 
            'created_by', 'created_by_name',
            'due_date', 'start_date', 'completed_at', 'estimated_hours',
            'tags', 'tag_ids', 'comments_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'completed_at', 'created_at', 'updated_at', 'position', 'board', 'column']
    
    def get_comments_count(self, obj):
        return obj.comments.count()


class TaskCommentSerializer(serializers.ModelSerializer):
    """Сериалайзер для комментариев к задачам"""
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = [
            'id', 'content', 'author', 'author_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
