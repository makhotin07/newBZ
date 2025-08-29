import uuid
from django.db import models
from django.contrib.auth import get_user_model
from backend.apps.workspaces.models import Workspace

User = get_user_model()


class SearchHistory(models.Model):
    """Модель для хранения истории поиска пользователя"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='search_history')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, null=True, blank=True)
    query = models.CharField(max_length=500)
    search_type = models.CharField(
        max_length=20,
        choices=[
            ('all', 'All Content'),
            ('pages', 'Pages'),
            ('tasks', 'Tasks'),
            ('databases', 'Databases'),
            ('users', 'Users'),
        ],
        default='all'
    )
    results_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email}: {self.query}"


class SavedSearch(models.Model):
    """Модель для сохраненных поисковых запросов"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_searches')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255)
    query = models.CharField(max_length=500)
    filters = models.JSONField(default=dict)  # Хранение фильтров в JSON
    search_type = models.CharField(
        max_length=20,
        choices=[
            ('all', 'All Content'),
            ('pages', 'Pages'),
            ('tasks', 'Tasks'),
            ('databases', 'Databases'),
            ('users', 'Users'),
        ],
        default='all'
    )
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email}: {self.name}"


class SearchIndex(models.Model):
    """Модель для индексации контента для быстрого поиска"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content_type = models.CharField(max_length=50)  # 'note', 'task', 'database', etc.
    object_id = models.UUIDField()
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    title = models.TextField()
    content = models.TextField()
    tags = models.TextField(blank=True)  # Comma-separated tags
    metadata = models.JSONField(default=dict)  # Additional searchable data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['workspace', 'content_type']),
            models.Index(fields=['workspace', 'created_at']),
        ]

    def __str__(self):
        return f"{self.content_type}: {self.title[:50]}"
