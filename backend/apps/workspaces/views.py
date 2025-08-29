"""
Импорты ViewSets из API слоя (Clean Architecture)
"""
from backend.api.workspace_views import (
    WorkspaceViewSet,
    WorkspaceMemberListView,
    WorkspaceInvitationView,
    AcceptInvitationView
)

# Re-export для обратной совместимости
__all__ = [
    'WorkspaceViewSet',
    'WorkspaceMemberListView',
    'WorkspaceInvitationView',
    'AcceptInvitationView'
]
