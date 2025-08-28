from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.WorkspaceViewSet, basename='workspace')

urlpatterns = [
    path('', include(router.urls)),
    path('<uuid:workspace_id>/members/', views.WorkspaceMemberListView.as_view(), name='workspace-members'),
    path('<uuid:workspace_id>/invite/', views.WorkspaceInviteView.as_view(), name='workspace-invite'),
    path('invitations/<str:token>/accept/', views.AcceptInviteView.as_view(), name='accept-invite'),
    path('invitations/<str:token>/decline/', views.DeclineInviteView.as_view(), name='decline-invite'),
    path('analytics/overview/', views.AnalyticsOverviewView.as_view(), name='analytics-overview'),
]
