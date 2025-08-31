from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Database(models.Model):
    """User-created database (table)"""
    VIEW_TYPES = [
        ('table', 'Table'),
        ('board', 'Board'),
        ('list', 'List'),
        ('calendar', 'Calendar'),
        ('gallery', 'Gallery'),
        ('timeline', 'Timeline'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)
    
    workspace = models.ForeignKey(
        'workspaces.Workspace',
        on_delete=models.CASCADE,
        related_name='databases'
    )
    
    # Default view
    default_view = models.CharField(max_length=10, choices=VIEW_TYPES, default='table')
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_databases')
    
    # Compatibility aliases
    @property
    def name(self):
        return self.title
        
    @property
    def author(self):
        return self.created_by
        
    @property
    def fields(self):
        return self.properties
        
    @property
    def rows(self):
        return self.records
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title


class DatabaseProperty(models.Model):
    """Column definition in database"""
    PROPERTY_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('select', 'Select'),
        ('multi_select', 'Multi-select'),
        ('date', 'Date'),
        ('person', 'Person'),
        ('files', 'Files & media'),
        ('checkbox', 'Checkbox'),
        ('url', 'URL'),
        ('email', 'Email'),
        ('phone', 'Phone number'),
        ('formula', 'Formula'),
        ('relation', 'Relation'),
        ('rollup', 'Rollup'),
        ('created_time', 'Created time'),
        ('created_by', 'Created by'),
        ('last_edited_time', 'Last edited time'),
        ('last_edited_by', 'Last edited by'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    database = models.ForeignKey(Database, on_delete=models.CASCADE, related_name='properties')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    
    # Configuration for different property types
    config = models.JSONField(default=dict)  # Options, formulas, etc.
    
    position = models.FloatField(default=0)
    is_visible = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['position']
        unique_together = ['database', 'name']
    
    def __str__(self):
        return f"{self.database.title} - {self.name} ({self.type})"


class DatabaseRecord(models.Model):
    """Row in database"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    database = models.ForeignKey(Database, on_delete=models.CASCADE, related_name='records')
    
    @property
    def rows(self):
        return self.records
    
    # Properties data stored as JSON
    properties = models.JSONField(default=dict)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_records')
    last_edited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='edited_records')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        title_prop = self.properties.get('title', 'Untitled')
        return f"{self.database.title} - {title_prop}"


class DatabaseView(models.Model):
    """Saved view of database with filters/sorting"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    database = models.ForeignKey(Database, on_delete=models.CASCADE, related_name='views')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=Database.VIEW_TYPES)
    
    # View configuration
    filters = models.JSONField(default=list)  # Filter conditions
    sorts = models.JSONField(default=list)    # Sort conditions
    groups = models.JSONField(default=list)   # Group conditions
    properties = models.JSONField(default=list)  # Visible properties
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['database', 'name']
        ordering = ['name']
    
    def __str__(self):
        return f"{self.database.title} - {self.name}"


class SelectOption(models.Model):
    """Options for select/multi-select properties"""
    property = models.ForeignKey(
        DatabaseProperty,
        on_delete=models.CASCADE,
        related_name='options'
    )
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#6B7280')
    position = models.FloatField(default=0)
    
    class Meta:
        ordering = ['position']
        unique_together = ['property', 'name']
    
    def __str__(self):
        return f"{self.property.name} - {self.name}"


class DatabaseRelation(models.Model):
    """Relation between databases"""
    from_database = models.ForeignKey(
        Database,
        on_delete=models.CASCADE,
        related_name='outgoing_relations'
    )
    to_database = models.ForeignKey(
        Database,
        on_delete=models.CASCADE,
        related_name='incoming_relations'
    )
    from_property = models.ForeignKey(
        DatabaseProperty,
        on_delete=models.CASCADE,
        related_name='outgoing_relations'
    )
    to_property = models.ForeignKey(
        DatabaseProperty,
        on_delete=models.CASCADE,
        related_name='incoming_relations',
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['from_database', 'to_database', 'from_property']
    
    def __str__(self):
        return f"{self.from_database.title} → {self.to_database.title}"


class DatabaseRecordRevision(models.Model):
    """История изменений записи базы данных"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    record = models.ForeignKey('DatabaseRecord', on_delete=models.CASCADE, related_name='revisions')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='database_revisions')
    
    # Изменения в формате JSON
    changes = models.JSONField()  # {property_id: {'old': value, 'new': value}}
    change_type = models.CharField(max_length=20, choices=[
        ('create', 'Create'),
        ('delete', 'Delete'),
        ('update', 'Update'),
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Revision by {self.author.username} on {self.record.id} at {self.created_at}"


class DatabaseComment(models.Model):
    """Комментарий к записи базы данных"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    record = models.ForeignKey('DatabaseRecord', on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='database_comments')
    content = models.TextField()
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.record.id}"
