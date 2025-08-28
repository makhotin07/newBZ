from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ActiveSession(models.Model):
    """Track active user sessions for real-time collaboration"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='active_sessions')
    page = models.ForeignKey(
        'notes.Page',
        on_delete=models.CASCADE,
        related_name='active_sessions',
        null=True,
        blank=True
    )
    database = models.ForeignKey(
        'databases.Database',
        on_delete=models.CASCADE,
        related_name='active_sessions',
        null=True,
        blank=True
    )
    
    session_id = models.CharField(max_length=100, unique=True)
    channel_name = models.CharField(max_length=100)
    
    # Cursor position for collaborative editing
    cursor_position = models.JSONField(default=dict)
    selection = models.JSONField(default=dict)
    
    last_seen = models.DateTimeField(auto_now=True)
    connected_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['page', 'last_seen']),
            models.Index(fields=['database', 'last_seen']),
        ]
    
    def __str__(self):
        if self.page:
            return f"{self.user.email} editing {self.page.title}"
        elif self.database:
            return f"{self.user.email} editing {self.database.title}"
        return f"{self.user.email} active session"


class CollaborativeEdit(models.Model):
    """Store collaborative editing operations for operational transforms"""
    page = models.ForeignKey(
        'notes.Page',
        on_delete=models.CASCADE,
        related_name='collaborative_edits',
        null=True,
        blank=True
    )
    database_record = models.ForeignKey(
        'databases.DatabaseRecord',
        on_delete=models.CASCADE,
        related_name='collaborative_edits',
        null=True,
        blank=True
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    operation = models.JSONField()  # Operation data (insert, delete, retain)
    version = models.PositiveIntegerField()  # For operational transformation
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['page', 'version']),
            models.Index(fields=['database_record', 'version']),
        ]
    
    def __str__(self):
        target = self.page or self.database_record
        return f"Edit by {self.user.email} on {target}"


class ShareLink(models.Model):
    """Public/shareable links to pages or databases"""
    PERMISSION_CHOICES = [
        ('read', 'Can read'),
        ('comment', 'Can comment'),
        ('edit', 'Can edit'),
    ]
    
    # Generic relation to shareable content
    page = models.ForeignKey(
        'notes.Page',
        on_delete=models.CASCADE,
        related_name='share_links',
        null=True,
        blank=True
    )
    database = models.ForeignKey(
        'databases.Database',
        on_delete=models.CASCADE,
        related_name='share_links',
        null=True,
        blank=True
    )
    
    token = models.CharField(max_length=64, unique=True)
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default='read')
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_share_links')
    
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    password = models.CharField(max_length=128, blank=True)  # Optional password protection
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    last_accessed = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        target = self.page or self.database
        return f"Share link for {target}"
    
    def get_absolute_url(self):
        return f"/shared/{self.token}"
