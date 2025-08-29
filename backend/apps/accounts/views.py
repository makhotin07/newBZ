"""
Импорты ViewSets из API слоя (Clean Architecture)
"""
from backend.api.account_views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserProfileView,
    UserListView,
    change_password
)

# Re-export для обратной совместимости
__all__ = [
    'CustomTokenObtainPairView',
    'UserRegistrationView',
    'UserProfileView',
    'UserListView',
    'change_password'
]
