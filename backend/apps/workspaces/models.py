from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinLengthValidator

User = get_user_model()


class Workspace(models.Model):
    name = models.CharField(max_length=100, validators=[MinLengthValidator(1)])
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)  # Emoji or icon name
    color = models.CharField(max_length=7, default='#6366F1')  # Hex color
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_workspaces')
    is_personal = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(
                fields=['owner'], 
                condition=models.Q(is_personal=True),
                name='unique_personal_workspace'
            )
        ]
    
    def __str__(self):
        return self.name


class WorkspaceMember(models.Model):
    ROLE_CHOICES = [
        ('viewer', 'Viewer'),
        ('editor', 'Editor'), 
        ('admin', 'Admin'),
        ('owner', 'Owner'),
    ]
    
    workspace = models.ForeignKey(
        Workspace, 
        on_delete=models.CASCADE, 
        related_name='members'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='workspace_memberships'
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='viewer')
    invited_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='sent_invitations'
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['workspace', 'user']
    
    def __str__(self):
        return f"{self.user.email} - {self.workspace.name} ({self.role})"


class WorkspaceInvitation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    ]
    
    workspace = models.ForeignKey(
        Workspace, 
        on_delete=models.CASCADE, 
        related_name='invitations'
    )
    email = models.EmailField()
    role = models.CharField(max_length=10, choices=WorkspaceMember.ROLE_CHOICES, default='viewer')
    invited_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='sent_workspace_invitations'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    token = models.CharField(max_length=64, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        unique_together = ['workspace', 'email']
    
    def __str__(self):
        return f"Invitation for {self.email} to {self.workspace.name}"


class WorkspaceSettings(models.Model):
    workspace = models.OneToOneField(
        Workspace, 
        on_delete=models.CASCADE, 
        related_name='settings'
    )
    allow_member_invites = models.BooleanField(default=True)
    allow_public_pages = models.BooleanField(default=False)
    default_page_permissions = models.CharField(
        max_length=10,
        choices=[('private', 'Private'), ('workspace', 'Workspace'), ('public', 'Public')],
        default='workspace'
    )
    enable_comments = models.BooleanField(default=True)
    enable_page_history = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Settings for {self.workspace.name}"
