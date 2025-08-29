"""
Главные URL-маршруты для API (Clean Architecture)
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from backend.api.task_views import TaskBoardViewSet, TaskViewSet, TaskCommentViewSet
from backend.api.note_views import PageViewSet, TagViewSet, CommentViewSet
from backend.api.workspace_views import WorkspaceViewSet
from backend.api.workspace_analytics_views import WorkspaceAnalyticsViewSet
from backend.api.search_views import SearchViewSet, SearchHistoryViewSet, SavedSearchViewSet
from backend.apps.notifications.views import NotificationViewSet, NotificationSettingsViewSet, ReminderViewSet
from backend.api.account_views import (
    CustomTokenObtainPairView, UserRegistrationView, UserProfileView, 
    UserListView, change_password, get_current_user
)
from rest_framework_simplejwt.views import TokenRefreshView
from backend.api.database_views import DatabaseViewSet, DatabasePropertyViewSet, DatabaseRecordViewSet

# Создание роутеров для ViewSets
task_router = DefaultRouter()
task_router.register(r'taskboards', TaskBoardViewSet, basename='taskboard')
task_router.register(r'tasks', TaskViewSet, basename='task')
task_router.register(r'task-comments', TaskCommentViewSet, basename='taskcomment')

note_router = DefaultRouter()
note_router.register(r'pages', PageViewSet, basename='page')
note_router.register(r'tags', TagViewSet, basename='tag')
note_router.register(r'comments', CommentViewSet, basename='comment')

workspace_router = DefaultRouter()
workspace_router.register(r'workspaces', WorkspaceViewSet, basename='workspace')

analytics_router = DefaultRouter()
analytics_router.register(r'workspaces/analytics', WorkspaceAnalyticsViewSet, basename='workspace-analytics')

search_router = DefaultRouter()
search_router.register(r'search', SearchViewSet, basename='search')
search_router.register(r'search-history', SearchHistoryViewSet, basename='searchhistory')
search_router.register(r'saved-searches', SavedSearchViewSet, basename='savedsearch')

notifications_router = DefaultRouter()
notifications_router.register(r'notifications', NotificationViewSet, basename='notification')
notifications_router.register(r'notification-settings', NotificationSettingsViewSet, basename='notificationsettings')
notifications_router.register(r'reminders', ReminderViewSet, basename='reminder')

database_router = DefaultRouter()
database_router.register(r'', DatabaseViewSet, basename='database')
database_router.register(r'properties', DatabasePropertyViewSet, basename='databaseproperty')
database_router.register(r'records', DatabaseRecordViewSet, basename='databaserecord')

urlpatterns = [
    # API маршруты для задач
    path('tasks/', include(task_router.urls)),
    
    # API маршруты для заметок
    path('notes/', include(note_router.urls)),
    
    # API маршруты для рабочих пространств
    path('', include(workspace_router.urls)),
    
    # API маршруты для аналитики
    path('', include(analytics_router.urls)),
    
    # API маршруты для поиска
    path('search/', include(search_router.urls)),
    
    # API маршруты для уведомлений
    path('', include(notifications_router.urls)),
    
    # API маршруты для пользователей
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', UserRegistrationView.as_view(), name='user-register'),
    path('auth/user/', get_current_user, name='user-current'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('auth/users/', UserListView.as_view(), name='user-list'),
    path('auth/change-password/', change_password, name='change-password'),
    
    # API маршруты для баз данных
    path('databases/', include(database_router.urls)),
    

]
