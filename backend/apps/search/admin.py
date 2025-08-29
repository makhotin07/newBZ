from django.contrib import admin
from .models import SearchHistory, SavedSearch, SearchIndex


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'query', 'search_type', 'results_count', 'created_at']
    list_filter = ['search_type', 'created_at']
    search_fields = ['query', 'user__email']
    readonly_fields = ['created_at']


@admin.register(SavedSearch)
class SavedSearchAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'search_type', 'is_public', 'created_at']
    list_filter = ['search_type', 'is_public', 'created_at']
    search_fields = ['name', 'query', 'user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(SearchIndex)
class SearchIndexAdmin(admin.ModelAdmin):
    list_display = ['title', 'content_type', 'workspace', 'updated_at']
    list_filter = ['content_type', 'workspace', 'updated_at']
    search_fields = ['title', 'content', 'tags']
    readonly_fields = ['created_at', 'updated_at']
