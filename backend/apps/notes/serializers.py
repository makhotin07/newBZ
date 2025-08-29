from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tag, Page, Block, PageVersion, Comment, PageView

User = get_user_model()


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'created_at']


class BlockSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Block
        fields = [
            'id', 'type', 'content', 'position', 'parent_block',
            'children', 'created_at', 'updated_at'
        ]
    
    def get_children(self, obj):
        children = obj.children.all()
        return BlockSerializer(children, many=True, context=self.context).data


class PageListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    last_edited_by_name = serializers.CharField(source='last_edited_by.full_name', read_only=True)
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    children_count = serializers.SerializerMethodField()
    path = serializers.ReadOnlyField(source='get_path')
    
    class Meta:
        model = Page
        fields = [
            'id', 'title', 'icon', 'cover_image', 'workspace', 'workspace_name',
            'parent', 'author', 'author_name', 'last_edited_by', 'last_edited_by_name',
            'tags', 'permissions', 'is_template', 'is_archived', 'is_deleted',
            'children_count', 'path', 'created_at', 'updated_at'
        ]
    
    def get_children_count(self, obj):
        return obj.children.filter(is_deleted=False).count()


class PageDetailSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    last_edited_by = serializers.StringRelatedField(read_only=True)
    workspace = serializers.StringRelatedField(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='tags'
    )
    blocks = BlockSerializer(many=True, read_only=True)
    children = PageListSerializer(many=True, read_only=True)
    path = serializers.ReadOnlyField(source='get_path')
    
    class Meta:
        model = Page
        fields = [
            'id', 'title', 'content', 'content_text', 'icon', 'cover_image',
            'workspace', 'parent', 'author', 'last_edited_by', 'tags', 'tag_ids',
            'permissions', 'is_template', 'is_archived', 'position',
            'blocks', 'children', 'path', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        instance.last_edited_by = self.context['request'].user
        
        # Extract content text for search
        if 'content' in validated_data:
            content_text = self.extract_text_from_content(validated_data['content'])
            validated_data['content_text'] = content_text
        
        return super().update(instance, validated_data)
    
    def extract_text_from_content(self, content):
        """Extract plain text from rich content for search indexing"""
        # Simple implementation - can be improved
        if isinstance(content, dict):
            text = content.get('text', '')
            for block in content.get('blocks', []):
                text += ' ' + block.get('text', '')
            return text
        return str(content)


class PageCreateSerializer(serializers.ModelSerializer):
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False,
        source='tags'
    )
    
    class Meta:
        model = Page
        fields = [
            'title', 'content', 'icon', 'cover_image', 'workspace', 
            'parent', 'tag_ids', 'permissions', 'is_template', 'position'
        ]
    
    def create(self, validated_data):
        request = self.context['request']
        validated_data['author'] = request.user
        validated_data['last_edited_by'] = request.user
        
        # Extract content text
        if 'content' in validated_data:
            content_text = self.extract_text_from_content(validated_data['content'])
            validated_data['content_text'] = content_text
        
        return super().create(validated_data)
    
    def extract_text_from_content(self, content):
        if isinstance(content, dict):
            text = content.get('text', '')
            for block in content.get('blocks', []):
                text += ' ' + block.get('text', '')
            return text
        return str(content)


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'author', 'author_name', 'author_avatar',
            'parent', 'block', 'is_resolved', 'replies',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_author_avatar(self, obj):
        user = getattr(obj, 'author', None)
        if not user:
            return None
        avatar = getattr(user, 'avatar', None)
        if not avatar:
            return None
        try:
            return avatar.url
        except Exception:
            return None

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class PageVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = PageVersion
        fields = [
            'id', 'version_number', 'title', 'content', 'content_text',
            'created_by', 'created_by_name', 'created_at'
        ]
