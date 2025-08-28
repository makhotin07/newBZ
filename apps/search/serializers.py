from rest_framework import serializers
from .models import SearchHistory, SavedSearch, SearchIndex


class SearchResultSerializer(serializers.Serializer):
    """Сериализатор для результатов поиска"""
    id = serializers.UUIDField()
    title = serializers.CharField()
    content = serializers.CharField()
    content_type = serializers.CharField()
    url = serializers.CharField()
    workspace_id = serializers.UUIDField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    metadata = serializers.DictField(required=False)
    highlight = serializers.DictField(required=False)


class SearchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchHistory
        fields = ['id', 'query', 'search_type', 'results_count', 'created_at']
        read_only_fields = ['id', 'created_at']


class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearch
        fields = [
            'id', 'name', 'query', 'filters', 'search_type', 
            'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SearchIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchIndex
        fields = [
            'id', 'content_type', 'object_id', 'workspace', 'title', 
            'content', 'tags', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AutocompleteSerializer(serializers.Serializer):
    """Сериализатор для автодополнения"""
    value = serializers.CharField()
    label = serializers.CharField()
    type = serializers.CharField()
    count = serializers.IntegerField(required=False)


class SearchRequestSerializer(serializers.Serializer):
    """Сериализатор для поискового запроса"""
    query = serializers.CharField(max_length=500, required=False, allow_blank=True)
    search_type = serializers.ChoiceField(
        choices=['all', 'pages', 'tasks', 'databases', 'users'],
        default='all'
    )
    workspace_id = serializers.UUIDField(required=False)
    filters = serializers.DictField(required=False, default=dict)
    page = serializers.IntegerField(min_value=1, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=100, default=20)
    sort_by = serializers.ChoiceField(
        choices=['relevance', 'created_at', 'updated_at', 'title'],
        default='relevance'
    )
    sort_order = serializers.ChoiceField(choices=['asc', 'desc'], default='desc')
