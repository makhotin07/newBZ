from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TaskBoard, TaskColumn, Task, TaskComment, TaskAttachment, TaskActivity
from apps.notes.models import Tag

User = get_user_model()


class TaskColumnSerializer(serializers.ModelSerializer):
    tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskColumn
        fields = ['id', 'title', 'color', 'position', 'tasks_count']
    
    def get_tasks_count(self, obj):
        return obj.tasks.count()


class TaskBoardListSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    columns_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskBoard
        fields = [
            'id', 'title', 'description', 'workspace', 'workspace_name',
            'created_by', 'created_by_name', 'columns_count', 'tasks_count',
            'created_at', 'updated_at'
        ]
    
    def get_columns_count(self, obj):
        return obj.columns.count()
    
    def get_tasks_count(self, obj):
        return obj.tasks.count()


class TaskBoardDetailSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    columns = TaskColumnSerializer(many=True, read_only=True)
    
    class Meta:
        model = TaskBoard
        fields = [
            'id', 'title', 'description', 'workspace', 'workspace_name',
            'created_by', 'created_by_name', 'columns',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        request = self.context['request']
        board = TaskBoard.objects.create(
            created_by=request.user,
            **validated_data
        )
        
        # Create default columns
        default_columns = [
            {'title': 'To Do', 'color': '#6B7280', 'position': 1},
            {'title': 'In Progress', 'color': '#F59E0B', 'position': 2},
            {'title': 'Review', 'color': '#3B82F6', 'position': 3},
            {'title': 'Done', 'color': '#10B981', 'position': 4},
        ]
        
        for col_data in default_columns:
            TaskColumn.objects.create(board=board, **col_data)
        
        return board


class TaskListSerializer(serializers.ModelSerializer):
    assignees = serializers.StringRelatedField(many=True, read_only=True)
    assignee_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        source='assignees',
        required=False
    )
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
    attachments_count = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'board', 'board_title', 
            'column', 'column_title', 'position', 'priority', 'status',
            'assignees', 'assignee_ids', 'created_by', 'created_by_name',
            'due_date', 'start_date', 'completed_at', 'estimated_hours',
            'tags', 'tag_ids', 'comments_count', 'attachments_count',
            'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'completed_at', 'created_at', 'updated_at', 'board', 'column']
    
    def validate_board(self, value):
        # This field is set by the view, not by the user
        return value
    
    def validate_column(self, value):
        # This field is set by the view, not by the user
        return value
    
    def to_internal_value(self, data):
        # Remove board_id and column from data before validation
        if 'board_id' in data:
            data.pop('board_id')
        if 'column' in data:
            data.pop('column')
        return super().to_internal_value(data)
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def get_attachments_count(self, obj):
        return obj.attachments.count()


class TaskDetailSerializer(TaskListSerializer):
    assignees_details = serializers.SerializerMethodField()
    
    class Meta(TaskListSerializer.Meta):
        fields = TaskListSerializer.Meta.fields + ['assignees_details']
    
    def get_assignees_details(self, obj):
        return [
            {
                'id': user.id,
                'name': user.full_name,
                'email': user.email,
                'avatar': (user.avatar.url if getattr(user, 'avatar', None) and getattr(getattr(user, 'avatar', None), 'name', None) else None)
            }
            for user in obj.assignees.all()
        ]
    
    def create(self, validated_data):
        request = self.context['request']
        validated_data['created_by'] = request.user
        
        # Handle assignees
        assignees = validated_data.pop('assignees', [])
        tags = validated_data.pop('tags', [])
        
        task = Task.objects.create(**validated_data)
        task.assignees.set(assignees)
        task.tags.set(tags)
        
        # Create activity log
        TaskActivity.objects.create(
            task=task,
            user=request.user,
            activity_type='created',
            description=f'Created task "{task.title}"'
        )
        
        return task
    
    def update(self, instance, validated_data):
        request = self.context['request']
        
        # Track changes for activity log
        old_column = instance.column
        old_status = instance.status
        old_assignees = set(instance.assignees.all())
        
        # Handle assignees and tags
        assignees = validated_data.pop('assignees', None)
        tags = validated_data.pop('tags', None)
        
        # Update task
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if assignees is not None:
            new_assignees = set(assignees)
            instance.assignees.set(assignees)
            
            # Log assignment changes
            added = new_assignees - old_assignees
            removed = old_assignees - new_assignees
            
            for user in added:
                TaskActivity.objects.create(
                    task=instance,
                    user=request.user,
                    activity_type='assigned',
                    description=f'Assigned {user.full_name} to task'
                )
            
            for user in removed:
                TaskActivity.objects.create(
                    task=instance,
                    user=request.user,
                    activity_type='unassigned',
                    description=f'Unassigned {user.full_name} from task'
                )
        
        if tags is not None:
            instance.tags.set(tags)
        
        # Log status/column changes
        if old_column != instance.column:
            TaskActivity.objects.create(
                task=instance,
                user=request.user,
                activity_type='moved',
                description=f'Moved task from "{old_column.title}" to "{instance.column.title}"'
            )
        
        if old_status != instance.status and instance.status == 'done':
            TaskActivity.objects.create(
                task=instance,
                user=request.user,
                activity_type='completed',
                description='Marked task as completed'
            )
        elif old_status == 'done' and instance.status != 'done':
            TaskActivity.objects.create(
                task=instance,
                user=request.user,
                activity_type='reopened',
                description='Reopened task'
            )
        
        return instance


class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskComment
        fields = [
            'id', 'content', 'author', 'author_name', 'author_avatar',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_author_avatar(self, obj):
        try:
            avatar = getattr(obj.author, 'avatar', None)
            if avatar and getattr(avatar, 'name', None):
                return avatar.url
        except ValueError:
            pass
        return None
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        comment = super().create(validated_data)
        
        # Create activity log
        TaskActivity.objects.create(
            task=comment.task,
            user=comment.author,
            activity_type='commented',
            description=f'Added comment: "{comment.content[:50]}..."'
        )
        
        return comment


class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskAttachment
        fields = [
            'id', 'file', 'original_name', 'uploaded_by', 'uploaded_by_name',
            'file_size', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']
    
    def get_file_size(self, obj):
        return obj.file.size if obj.file else 0
    
    def create(self, validated_data):
        request = self.context['request']
        validated_data['uploaded_by'] = request.user
        
        # Get original filename if not provided
        if 'original_name' not in validated_data and 'file' in validated_data:
            validated_data['original_name'] = validated_data['file'].name
        
        return super().create(validated_data)


class TaskActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskActivity
        fields = [
            'id', 'activity_type', 'description', 'user', 'user_name',
            'user_avatar', 'metadata', 'created_at'
        ]
    
    def get_user_avatar(self, obj):
        try:
            avatar = getattr(obj.user, 'avatar', None)
            if avatar and getattr(avatar, 'name', None):
                return avatar.url
        except ValueError:
            pass
        return None
