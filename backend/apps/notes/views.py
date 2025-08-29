"""
Импорты ViewSets из API слоя (Clean Architecture)
"""
from backend.api.note_views import (
    PageViewSet,
    TagViewSet,
    CommentViewSet
)

# Re-export для обратной совместимости
__all__ = [
    'PageViewSet',
    'TagViewSet', 
    'CommentViewSet'
]
