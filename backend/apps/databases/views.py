"""
Импорты ViewSets из API слоя (Clean Architecture)
"""
from backend.api.database_views import (
    DatabaseViewSet,
    DatabasePropertyViewSet,
    DatabaseRecordViewSet,
    DatabaseViewViewSet
)

# Re-export для обратной совместимости
__all__ = [
    'DatabaseViewSet',
    'DatabasePropertyViewSet',
    'DatabaseRecordViewSet',
    'DatabaseViewViewSet'
]
