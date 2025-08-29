from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import uuid

User = get_user_model()


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#6B7280')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class Page(models.Model):
    PERMISSION_CHOICES = [
        ('private', 'Private'),
        ('workspace', 'Workspace'),
        ('public', 'Public'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, default='Untitled')
    content = models.JSONField(default=dict)  # Rich content blocks
    content_text = models.TextField(blank=True)  # For search
    icon = models.CharField(max_length=100, blank=True)
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True)
    
    workspace = models.ForeignKey(
        'workspaces.Workspace',
        on_delete=models.CASCADE,
        related_name='pages'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_pages')
    last_edited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='edited_pages')
    
    tags = models.ManyToManyField(Tag, blank=True, related_name='pages')
    
    permissions = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default='workspace')
    is_template = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    
    # Ordering
    position = models.FloatField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['position', '-updated_at']
    
    def __str__(self):
        return self.title
    
    def get_path(self):
        """Get full path from root to this page"""
        path = []
        current = self
        while current:
            path.insert(0, current.title)
            current = current.parent
        return ' / '.join(path)


class Block(models.Model):
    BLOCK_TYPES = [
        ('text', 'Text'),
        ('heading1', 'Heading 1'),
        ('heading2', 'Heading 2'),
        ('heading3', 'Heading 3'),
        ('bulleted_list', 'Bulleted List'),
        ('numbered_list', 'Numbered List'),
        ('todo', 'To-Do'),
        ('toggle', 'Toggle'),
        ('quote', 'Quote'),
        ('divider', 'Divider'),
        ('callout', 'Callout'),
        ('code', 'Code'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('file', 'File'),
        ('embed', 'Embed'),
        ('bookmark', 'Bookmark'),
        ('table', 'Table'),
        ('database', 'Database'),
        ('equation', 'Equation'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='blocks')
    parent_block = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    
    type = models.CharField(max_length=20, choices=BLOCK_TYPES, default='text')
    content = models.JSONField(default=dict)  # Block-specific content
    position = models.FloatField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['position']
    
    def __str__(self):
        return f"{self.type} block in {self.page.title}"


class PageVersion(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    content = models.JSONField()
    content_text = models.TextField(blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['page', 'version_number']
        ordering = ['-version_number']
    
    def __str__(self):
        return f"{self.page.title} v{self.version_number}"


class Comment(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='comments')
    block = models.ForeignKey(
        Block,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='comments'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    is_resolved = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.email} on {self.page.title}"


class PageView(models.Model):
    """Track page views for analytics"""
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['page', 'viewed_at']),
        ]
