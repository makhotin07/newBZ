"""
API контроллеры для управления пользователями (Clean Architecture)
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from backend.apps.accounts.serializers import (
    UserSerializer,
    UserUpdateSerializer,
    UserRegistrationSerializer,
)
from backend.services.account_service import AccountService


class CustomTokenObtainPairView(TokenObtainPairView):
    """Кастомный JWT токен view, возвращающий данные пользователя с токенами"""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = AccountService.get_user_by_email(request.data["email"])
            if user:
                user_data = UserSerializer(user).data
                response.data["user"] = user_data
        return response


class UserRegistrationView(generics.CreateAPIView):
    """Регистрация нового пользователя"""

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        """Создание пользователя через сервис"""
        data = serializer.validated_data
        user = AccountService.register_user(
            email=data["email"],
            username=data["username"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            password=data["password"],
        )
        serializer.instance = user


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Просмотр и обновление профиля пользователя"""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Получение текущего пользователя"""
        return self.request.user

    def get_serializer_class(self):
        """Выбор сериалайзера в зависимости от метода"""
        if self.request.method in ["PUT", "PATCH"]:
            return UserUpdateSerializer
        return UserSerializer

    def perform_update(self, serializer):
        """Обновление профиля через сервис"""
        user = AccountService.update_user_profile(
            user=self.request.user, **serializer.validated_data
        )
        serializer.instance = user


class UserListView(generics.ListAPIView):
    """Поиск пользователей для добавления в workspace"""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Получение списка пользователей через сервис"""
        search_query = self.request.query_params.get("search", "")
        users = AccountService.search_users(
            query=search_query, exclude_user=self.request.user, limit=20
        )
        return users


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Смена пароля пользователя"""
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response(
            {"error": "Требуются старый и новый пароли"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        AccountService.change_password(
            user=request.user, old_password=old_password, new_password=new_password
        )
        return Response({"message": "Пароль успешно изменен"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """Запрос на сброс пароля"""
    email = request.data.get("email")

    if not email:
        return Response(
            {"error": "Требуется email"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        AccountService.forgot_password(email)
        return Response({"message": "Инструкции по сбросу пароля отправлены на email"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Сброс пароля по токену"""
    token = request.data.get("token")
    new_password = request.data.get("new_password")

    if not token or not new_password:
        return Response(
            {"error": "Требуются токен и новый пароль"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        AccountService.reset_password(token, new_password)
        return Response({"message": "Пароль успешно сброшен"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
