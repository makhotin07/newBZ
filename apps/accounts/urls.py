from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, UserRegistrationView, UserProfileView,
    UserListView, change_password
)

urlpatterns = [
    # JWT Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User management
    path('register/', UserRegistrationView.as_view(), name='user_register'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('change-password/', change_password, name='change_password'),
]
