"""
Импорты ViewSets из API слоя (Clean Architecture)
"""
from backend.api.search_views import (
    SearchViewSet,
    SearchHistoryViewSet,
    SavedSearchViewSet
)

# Re-export для обратной совместимости
__all__ = [
    'SearchViewSet',
    'SearchHistoryViewSet',
    'SavedSearchViewSet'
]
