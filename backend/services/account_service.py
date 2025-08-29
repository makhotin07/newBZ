"""
Сервисный слой для управления пользователями
"""
from typing import List, Optional
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Q

from backend.core.exceptions import BusinessLogicException, ValidationException

User = get_user_model()


class AccountService:
    """Сервис для управления аккаунтами пользователей"""
    
    @staticmethod
    def register_user(email: str, username: str, first_name: str, last_name: str, password: str) -> User:
        """Регистрация нового пользователя"""
        # Проверка уникальности email
        if User.objects.filter(email=email).exists():
            raise BusinessLogicException("Пользователь с таким email уже существует")
        
        # Проверка уникальности username
        if User.objects.filter(username=username).exists():
            raise BusinessLogicException("Пользователь с таким username уже существует")
        
        # Валидация пароля
        try:
            validate_password(password)
        except ValidationError as e:
            raise ValidationException(f"Пароль не соответствует требованиям: {', '.join(e.messages)}")
        
        # Создание пользователя
        user = User.objects.create_user(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password
        )
        
        return user
    
    @staticmethod
    def update_user_profile(user: User, **data) -> User:
        """Обновление профиля пользователя"""
        # Проверка уникальности email при изменении
        if 'email' in data and data['email'] != user.email:
            if User.objects.filter(email=data['email']).exclude(id=user.id).exists():
                raise BusinessLogicException("Пользователь с таким email уже существует")
        
        # Проверка уникальности username при изменении
        if 'username' in data and data['username'] != user.username:
            if User.objects.filter(username=data['username']).exclude(id=user.id).exists():
                raise BusinessLogicException("Пользователь с таким username уже существует")
        
        # Обновление полей
        for field, value in data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        user.save()
        return user
    
    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> bool:
        """Смена пароля пользователя"""
        # Проверка старого пароля
        if not user.check_password(old_password):
            raise BusinessLogicException("Неверный старый пароль")
        
        # Валидация нового пароля
        try:
            validate_password(new_password)
        except ValidationError as e:
            raise ValidationException(f"Новый пароль не соответствует требованиям: {', '.join(e.messages)}")
        
        # Установка нового пароля
        user.set_password(new_password)
        user.save()
        
        return True
    
    @staticmethod
    def search_users(query: str, exclude_user: Optional[User] = None, limit: int = 20) -> List[User]:
        """Поиск пользователей по email, имени или фамилии"""
        queryset = User.objects.filter(is_active=True)
        
        if exclude_user:
            queryset = queryset.exclude(id=exclude_user.id)
        
        if query:
            queryset = queryset.filter(
                Q(email__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(username__icontains=query)
            )
        
        return list(queryset[:limit])
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """Получение пользователя по email"""
        try:
            return User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            return None
    
    @staticmethod
    def deactivate_user(user: User) -> bool:
        """Деактивация пользователя"""
        user.is_active = False
        user.save()
        return True
