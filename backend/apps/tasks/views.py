"""
Импорты ViewSets из API слоя (Clean Architecture)
"""
from backend.api.task_views import (
    TaskBoardViewSet,
    TaskViewSet, 
    TaskCommentViewSet
)

# Re-export для обратной совместимости
__all__ = [
    'TaskBoardViewSet',
    'TaskViewSet',
    'TaskCommentViewSet'
]
