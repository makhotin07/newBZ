"""
Главные URL-маршруты для API (Clean Architecture)
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from backend.api.account_views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserProfileView,
    UserListView,
    change_password,
    forgot_password,
    reset_password,
)
from backend.api.database_views import (
    DatabaseViewSet, DatabasePropertyViewSet, DatabaseRecordViewSet
)
from backend.api.taskboard_views import (
    TaskBoardViewSet, TaskColumnViewSet, TaskViewSet
)
from backend.api.note_views import PageViewSet, TagViewSet, BlockViewSet
from backend.api.search_views import (
    SearchViewSet,
    SearchHistoryViewSet,
    SavedSearchViewSet,
)
from backend.api.workspace_analytics_views import WorkspaceAnalyticsViewSet
from backend.api.workspace_views import WorkspaceViewSet, WorkspaceInvitationViewSet
from backend.apps.notifications.views import (
    NotificationViewSet,
    NotificationSettingsViewSet,
    ReminderViewSet,
)
from backend.api.note_views import PageCommentsListView, PageCommentDetailView, PageCommentResolveView

# Создание роутеров для ViewSets
database_router = DefaultRouter()
database_router.register(r"", DatabaseViewSet, basename="database")

taskboard_router = DefaultRouter()
taskboard_router.register(r"", TaskBoardViewSet, basename="taskboard")

task_router = DefaultRouter()
task_router.register(r"", TaskViewSet, basename="task")

note_router = DefaultRouter()
note_router.register(r"pages", PageViewSet, basename="page")
note_router.register(r"tags", TagViewSet, basename="tag")

note_router.register(r"blocks", BlockViewSet, basename="block")

workspace_router = DefaultRouter()
workspace_router.register(r"", WorkspaceViewSet, basename="workspace")

workspace_invitation_router = DefaultRouter()
workspace_invitation_router.register(
    r"",
    WorkspaceInvitationViewSet,
    basename="workspace-invitation",
)

analytics_router = DefaultRouter()
analytics_router.register(
    r"", WorkspaceAnalyticsViewSet, basename="workspace-analytics"
)

search_router = DefaultRouter()
search_router.register(r"", SearchViewSet, basename="search")
search_router.register(
    r"history", SearchHistoryViewSet, basename="searchhistory"
)
search_router.register(r"saved", SavedSearchViewSet, basename="savedsearch")

notifications_router = DefaultRouter()
notifications_router.register(
    r"",
    NotificationViewSet,
    basename="notification"
)
notifications_router.register(
    r"settings",
    NotificationSettingsViewSet,
    basename="notificationsettings",
)
notifications_router.register(r"reminders", ReminderViewSet, basename="reminder")

urlpatterns = [
    # API маршруты для баз данных
    path("databases/", include(database_router.urls)),
    # API маршруты для досок задач
    path("taskboards/", include(taskboard_router.urls)),
    # API маршруты для задач
    path("tasks/", include(task_router.urls)),
    # API маршруты для заметок
    path("notes/", include(note_router.urls)),
    # URL для комментариев страниц (стандартные RESTful маршруты с pk)
    path("notes/pages/<str:page_id>/comments/", 
         PageCommentsListView.as_view(),
         name='page-comments'),
    path("notes/pages/<str:page_id>/comments/<str:pk>/", 
         PageCommentDetailView.as_view(),
         name='page-comment-detail'),
    path("notes/pages/<str:page_id>/comments/<str:pk>/resolve/", 
         PageCommentResolveView.as_view(),
         name='page-comment-resolve'),
    # API маршруты для рабочих пространств
    path("workspaces/", include(workspace_router.urls)),
    # API маршруты для приглашений в рабочие пространства
    path("workspaces/invitations/", include(workspace_invitation_router.urls)),
    # API маршруты для аналитики
    path("workspaces/analytics/", include(analytics_router.urls)),
    # API маршруты для поиска
    path("search/", include(search_router.urls)),
    # API маршруты для уведомлений
    path("notifications/", include(notifications_router.urls)),
    # API маршруты для пользователей
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", UserRegistrationView.as_view(), name="user-register"),
    path("auth/me/", UserProfileView.as_view(), name="user-me"),
    path("auth/me/password/", change_password, name="user-password"),
    path("auth/users/", UserListView.as_view(), name="user-list"),
    path("auth/password-reset/", forgot_password, name="password-reset"),
    path("auth/password-reset/confirm/", reset_password, name="password-reset-confirm"),
]
