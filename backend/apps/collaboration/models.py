from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ActiveSession(models.Model):
    """Track active user sessions for real-time collaboration"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='active_sessions')
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, null=True, blank=True)
    
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
    last_activity = models.DateTimeField(auto_now=True)
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


class CollaborationComment(models.Model):
    """Комментарии для совместной работы"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collaboration_comments')
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE)
    
    # Generic relation to commentable content
    page = models.ForeignKey(
        'notes.Page',
        on_delete=models.CASCADE,
        related_name='collaboration_comments',
        null=True,
        blank=True
    )
    database = models.ForeignKey(
        'databases.Database',
        on_delete=models.CASCADE,
        related_name='collaboration_comments',
        null=True,
        blank=True
    )
    database_record = models.ForeignKey(
        'databases.DatabaseRecord',
        on_delete=models.CASCADE,
        related_name='collaboration_comments',
        null=True,
        blank=True
    )
    
    content = models.TextField()
    parent_comment = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['workspace', 'created_at']),
            models.Index(fields=['page', 'created_at']),
            models.Index(fields=['database', 'created_at']),
            models.Index(fields=['database_record', 'created_at']),
        ]
    
    def __str__(self):
        target = self.page or self.database or self.database_record
        return f"Comment by {self.user.email} on {target}"


class CollaborationReaction(models.Model):
    """Реакции на комментарии"""
    REACTION_TYPES = [
        ('like', '👍'),
        ('love', '❤️'),
        ('laugh', '😂'),
        ('wow', '😮'),
        ('sad', '😢'),
        ('angry', '😠'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collaboration_reactions')
    comment = models.ForeignKey(CollaborationComment, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'comment', 'reaction_type']
        indexes = [
            models.Index(fields=['comment', 'reaction_type']),
            models.Index(fields=['user', 'reaction_type']),
        ]
    
    def __str__(self):
        return f"{self.user.email} {self.get_reaction_type_display()} on {self.comment}"
