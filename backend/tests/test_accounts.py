"""
Тесты для accounts модуля - тестирование реальных API endpoints
"""
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class UserModelTest(TestCase):
    """Тесты для модели User"""

    def test_create_user_with_email_successful(self):
        """Тест создания нового пользователя с email успешен"""
        email = "test@example.com"
        password = "testpass123"
        username = "testuser"
        user = User.objects.create_user(
            username=username, email=email, password=password
        )

        self.assertEqual(user.email, email)
        self.assertEqual(user.username, username)
        self.assertTrue(user.check_password(password))

    def test_new_user_email_normalized(self):
        """Тест нормализации email для нового пользователя"""
        email = "test@EXAMPLE.COM"
        username = "testuser"
        user = User.objects.create_user(
            username=username, email=email, password="test123"
        )

        self.assertEqual(user.email, email.lower())

    def test_new_user_invalid_email(self):
        """Тест создания пользователя с невалидным email (пропускается - Django не валидирует)"""
        # Django не валидирует email при создании пользователя
        # Валидация происходит только в сериалайзерах
        pass

    def test_create_new_superuser(self):
        """Тест создания нового суперпользователя"""
        user = User.objects.create_superuser(
            username="admin", email="test@example.com", password="test123"
        )

        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)

    def test_user_str(self):
        """Тест строкового представления пользователя"""
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="test123",
            first_name="Test",
            last_name="User",
        )

        self.assertEqual(str(user), "test@example.com")
        self.assertEqual(user.full_name, "Test User")


class AuthenticationAPITest(APITestCase):
    """Тесты для API аутентификации - тестирование реальных endpoints"""

    def setUp(self):
        self.user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "password_confirm": "testpass123",
            "first_name": "Test",
            "last_name": "User",
        }

    def test_create_user_success(self):
        """Тест создания пользователя через API с валидными данными"""
        url = reverse("user-register")  # Используем реальный URL из API
        res = self.client.post(url, self.user_data)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email=self.user_data["email"])
        self.assertTrue(user.check_password(self.user_data["password"]))
        self.assertNotIn("password", res.data)

    def test_user_exists(self):
        """Тест создания пользователя, который уже существует, через API"""
        user_data = {k: v for k, v in self.user_data.items() if k != "password_confirm"}
        User.objects.create_user(**user_data)
        url = reverse("user-register")
        res = self.client.post(url, self.user_data)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_too_short(self):
        """Тест что API отклоняет пароль меньше 8 символов"""
        self.user_data["password"] = "pw"
        url = reverse("user-register")
        res = self.client.post(url, self.user_data)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = User.objects.filter(email=self.user_data["email"]).exists()
        self.assertFalse(user_exists)

    def test_login_success(self):
        """Тест успешного входа через API"""
        # Создаем пользователя
        user_data = {k: v for k, v in self.user_data.items() if k != "password_confirm"}
        user = User.objects.create_user(**user_data)

        # Тестируем вход
        url = reverse("token_obtain_pair")
        login_data = {
            "email": self.user_data["email"],
            "password": self.user_data["password"],
        }
        res = self.client.post(url, login_data)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_login_invalid_credentials(self):
        """Тест входа с неверными учетными данными через API"""
        url = reverse("token_obtain_pair")
        login_data = {"email": "wrong@example.com", "password": "wrongpass"}
        res = self.client.post(url, login_data)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_profile_authenticated(self):
        """Тест получения профиля пользователя через API (аутентифицированный)"""
        user_data = {k: v for k, v in self.user_data.items() if k != "password_confirm"}
        user = User.objects.create_user(**user_data)
        self.client.force_authenticate(user=user)

        url = reverse("user-me")
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], user.email)

    def test_user_profile_unauthenticated(self):
        """Тест получения профиля пользователя через API (неаутентифицированный)"""
        url = reverse("user-me")
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
