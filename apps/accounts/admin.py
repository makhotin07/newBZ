from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_staff', 'is_active', 'created_at']
    list_filter = ['is_staff', 'is_active', 'is_superuser', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('avatar', 'bio', 'timezone', 'theme_preference', 'is_email_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company', 'job_title', 'phone']
    search_fields = ['user__email', 'company', 'job_title']
    list_filter = ['company']
