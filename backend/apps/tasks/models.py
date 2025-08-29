from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class TaskBoard(models.Model):
    """Kanban board for tasks"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    workspace = models.ForeignKey(
        'workspaces.Workspace',
        on_delete=models.CASCADE,
        related_name='task_boards'
    )
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_boards')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title


class TaskColumn(models.Model):
    """Column in Kanban board"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    board = models.ForeignKey(TaskBoard, on_delete=models.CASCADE, related_name='columns')
    title = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#6B7280')
    position = models.FloatField(default=0)
    
    class Meta:
        ordering = ['position']
    
    def __str__(self):
        return f"{self.board.title} - {self.title}"


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'Review'),
        ('done', 'Done'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Board and column
    board = models.ForeignKey(TaskBoard, on_delete=models.CASCADE, related_name='tasks')
    column = models.ForeignKey(TaskColumn, on_delete=models.CASCADE, related_name='tasks')
    position = models.FloatField(default=0)
    
    # Task properties
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='todo')
    
    # People
    assignees = models.ManyToManyField(User, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    
    # Dates
    due_date = models.DateTimeField(null=True, blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    tags = models.ManyToManyField('notes.Tag', blank=True, related_name='tasks')
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['position', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_overdue(self):
        if not self.due_date or self.status == 'done':
            return False
        from django.utils import timezone
        return self.due_date < timezone.now()


class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.email} on {self.task.title}"


class TaskAttachment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='task_attachments/')
    original_name = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Attachment for {self.task.title}: {self.original_name}"


class TaskActivity(models.Model):
    """Track changes to tasks for activity feed"""
    ACTIVITY_TYPES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('moved', 'Moved'),
        ('assigned', 'Assigned'),
        ('unassigned', 'Unassigned'),
        ('commented', 'Commented'),
        ('completed', 'Completed'),
        ('reopened', 'Reopened'),
    ]
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=15, choices=ACTIVITY_TYPES)
    description = models.TextField()
    metadata = models.JSONField(default=dict)  # Additional context
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Task activities'
    
    def __str__(self):
        return f"{self.user.email} {self.activity_type} {self.task.title}"
