from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Database, DatabaseProperty, DatabaseRecord, DatabaseView, SelectOption, DatabaseRelation
from .models import DatabaseComment, DatabaseRecordRevision

User = get_user_model()


class SelectOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelectOption
        fields = ['id', 'name', 'color', 'position']


class DatabasePropertySerializer(serializers.ModelSerializer):
    options = SelectOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = DatabaseProperty
        fields = [
            'id', 'name', 'type', 'config', 'position', 'is_visible',
            'options', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        database_id = self.context['database_id']
        database = Database.objects.get(id=database_id)
        return DatabaseProperty.objects.create(database=database, **validated_data)


class DatabaseListSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    properties_count = serializers.SerializerMethodField()
    records_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Database
        fields = [
            'id', 'title', 'description', 'icon', 'workspace', 'workspace_name',
            'default_view', 'created_by', 'created_by_name', 'properties_count',
            'records_count', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'workspace': {'required': True}
        }
    
    def get_properties_count(self, obj):
        return obj.properties.count()
    
    def get_records_count(self, obj):
        return obj.records.count()
    
    def validate_workspace(self, value):
        """Валидация workspace"""
        request = self.context.get('request')
        if request and request.user:
            # Проверяем, что пользователь имеет доступ к workspace
            if not value.members.filter(user=request.user).exists():
                raise serializers.ValidationError("У вас нет доступа к этому рабочему пространству")
        return value


class DatabaseDetailSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    properties = DatabasePropertySerializer(many=True, read_only=True)
    properties_count = serializers.SerializerMethodField()
    records_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Database
        fields = [
            'id', 'title', 'description', 'icon', 'workspace',
            'workspace_name', 'default_view', 'created_by', 'created_by_name',
            'properties', 'properties_count', 'records_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
        extra_kwargs = {
            'workspace': {'required': True}
        }
    
    def get_properties_count(self, obj):
        return obj.properties.count()
    
    def get_records_count(self, obj):
        return obj.records.count()
    
    def create(self, validated_data):
        request = self.context['request']
        
        # Проверяем, что workspace передан
        if 'workspace' not in validated_data:
            raise serializers.ValidationError("Workspace обязателен для создания базы данных")
        
        # Создаем базу данных
        database = Database.objects.create(
            created_by=request.user,
            **validated_data
        )
        
        # Создаем свойство по умолчанию "Title"
        DatabaseProperty.objects.create(
            database=database,
            name='Title',
            type='text',
            position=1,
            config={'required': True}
        )
        
        return database
    
    def validate_workspace(self, value):
        """Валидация workspace"""
        request = self.context.get('request')
        if request and request.user:
            # Проверяем, что пользователь имеет доступ к workspace
            if not value.members.filter(user=request.user).exists():
                raise serializers.ValidationError("У вас нет доступа к этому рабочему пространству")
        return value


class DatabaseRecordSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    last_edited_by_name = serializers.CharField(source='last_edited_by.full_name', read_only=True)
    
    class Meta:
        model = DatabaseRecord
        fields = [
            'id', 'properties', 'created_by', 'created_by_name',
            'last_edited_by', 'last_edited_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'last_edited_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        request = self.context['request']
        database_id = self.context['database_id']
        database = Database.objects.get(id=database_id)
        
        return DatabaseRecord.objects.create(
            database=database,
            created_by=request.user,
            last_edited_by=request.user,
            **validated_data
        )
    
    def update(self, instance, validated_data):
        request = self.context['request']
        validated_data['last_edited_by'] = request.user
        return super().update(instance, validated_data)
    
    def validate_properties(self, value):
        """Validate properties against database schema"""
        database_id = self.context.get('database_id')
        if not database_id:
            return value
        
        database = Database.objects.get(id=database_id)
        db_properties = {prop.name: prop for prop in database.properties.all()}
        
        # Validate each property
        for prop_name, prop_value in value.items():
            if prop_name not in db_properties:
                continue
                
            db_prop = db_properties[prop_name]
            
            # Type-specific validation
            if db_prop.type == 'number' and prop_value is not None:
                try:
                    float(prop_value)
                except (ValueError, TypeError):
                    raise serializers.ValidationError(
                        f'Property "{prop_name}" must be a number'
                    )
            
            elif db_prop.type == 'date' and prop_value:
                from datetime import datetime
                if not isinstance(prop_value, str):
                    raise serializers.ValidationError(
                        f'Property "{prop_name}" must be a date string'
                    )
            
            elif db_prop.type in ['select', 'multi_select'] and prop_value:
                valid_options = [opt.name for opt in db_prop.options.all()]
                if db_prop.type == 'select':
                    if prop_value not in valid_options:
                        raise serializers.ValidationError(
                            f'Property "{prop_name}" must be one of: {valid_options}'
                        )
                elif db_prop.type == 'multi_select':
                    if not isinstance(prop_value, list):
                        raise serializers.ValidationError(
                            f'Property "{prop_name}" must be a list'
                        )
                    for val in prop_value:
                        if val not in valid_options:
                            raise serializers.ValidationError(
                                f'Property "{prop_name}" contains invalid option: {val}'
                            )
        
        return value


class DatabaseViewSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = DatabaseView
        fields = [
            'id', 'name', 'type', 'filters', 'sorts', 'groups', 'properties',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        request = self.context['request']
        database_id = self.context['database_id']
        database = Database.objects.get(id=database_id)
        
        return DatabaseView.objects.create(
            database=database,
            created_by=request.user,
            **validated_data
        )


class DatabaseRelationSerializer(serializers.ModelSerializer):
    from_database_title = serializers.CharField(source='from_database.title', read_only=True)
    to_database_title = serializers.CharField(source='to_database.title', read_only=True)
    from_property_name = serializers.CharField(source='from_property.name', read_only=True)
    to_property_name = serializers.CharField(source='to_property.name', read_only=True)
    
    class Meta:
        model = DatabaseRelation
        fields = [
            'id', 'from_database', 'from_database_title', 'to_database', 'to_database_title',
            'from_property', 'from_property_name', 'to_property', 'to_property_name',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# Specialized serializers for different property types
class CreateSelectPropertySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    type = serializers.ChoiceField(choices=['select', 'multi_select'])
    options = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    config = serializers.DictField(required=False, default=dict)
    position = serializers.FloatField(required=False, default=0)


class UpdateRecordPropertySerializer(serializers.Serializer):
    """For updating specific property values in records"""
    record_id = serializers.UUIDField()
    property_name = serializers.CharField()
    value = serializers.JSONField()


class BulkUpdateRecordsSerializer(serializers.Serializer):
    """For bulk operations on records"""
    record_ids = serializers.ListField(child=serializers.UUIDField())
    updates = serializers.DictField()  # property_name: value pairs
    operation = serializers.ChoiceField(choices=['update', 'delete'], default='update')


class FilterSerializer(serializers.Serializer):
    """For validating database view filters"""
    property = serializers.CharField()
    operator = serializers.ChoiceField(choices=[
        'equals', 'not_equals', 'contains', 'not_contains', 
        'starts_with', 'ends_with', 'is_empty', 'is_not_empty',
        'greater_than', 'less_than', 'greater_equal', 'less_equal',
        'is_true', 'is_false'
    ])
    value = serializers.JSONField(required=False)


class DatabaseCommentSerializer(serializers.ModelSerializer):
    """Сериализатор для комментариев к записям"""
    author_name = serializers.CharField(source='author.username', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = DatabaseComment
        fields = [
            'id', 'record', 'author', 'author_name', 'content', 
            'parent_comment', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'author_name', 'created_at', 'updated_at']

    def get_replies(self, obj):
        """Получение ответов на комментарий"""
        if obj.replies.exists():
            return DatabaseCommentSerializer(obj.replies.all(), many=True).data
        return []


class DatabaseRecordRevisionSerializer(serializers.ModelSerializer):
    """Сериализатор для истории изменений записей"""
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = DatabaseRecordRevision
        fields = [
            'id', 'record', 'author', 'author_name', 'changes', 
            'change_type', 'created_at'
        ]
        read_only_fields = ['id', 'author', 'author_name', 'created_at']
