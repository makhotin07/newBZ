from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserModelTest(TestCase):
    """Tests for the User model"""

    def test_create_user_with_email_successful(self):
        """Test creating a new user with an email is successful"""
        email = 'test@example.com'
        password = 'testpass123'
        user = User.objects.create_user(
            email=email,
            password=password
        )

        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))

    def test_new_user_email_normalized(self):
        """Test the email for a new user is normalized"""
        email = 'test@EXAMPLE.COM'
        user = User.objects.create_user(email, 'test123')

        self.assertEqual(user.email, email.lower())

    def test_new_user_invalid_email(self):
        """Test creating user with no email raises error"""
        with self.assertRaises(ValueError):
            User.objects.create_user(None, 'test123')

    def test_create_new_superuser(self):
        """Test creating a new superuser"""
        user = User.objects.create_superuser(
            'test@example.com',
            'test123'
        )

        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)

    def test_user_str(self):
        """Test the user string representation"""
        user = User.objects.create_user(
            email='test@example.com',
            password='test123',
            first_name='Test',
            last_name='User'
        )

        self.assertEqual(str(user), 'test@example.com')
        self.assertEqual(user.full_name, 'Test User')


class AuthenticationAPITest(APITestCase):
    """Tests for the authentication API"""

    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_create_user_success(self):
        """Test creating user with valid payload is successful"""
        url = reverse('user-list')
        res = self.client.post(url, self.user_data)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(**res.data)
        self.assertTrue(user.check_password(self.user_data['password']))
        self.assertNotIn('password', res.data)

    def test_user_exists(self):
        """Test creating user that already exists fails"""
        User.objects.create_user(**self.user_data)
        url = reverse('user-list')
        res = self.client.post(url, self.user_data)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_too_short(self):
        """Test that password must be more than 8 characters"""
        self.user_data['password'] = 'pw'
        url = reverse('user-list')
        res = self.client.post(url, self.user_data)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = User.objects.filter(
            email=self.user_data['email']
        ).exists()
        self.assertFalse(user_exists)

    def test_token_generation(self):
        """Test that token is generated for valid user credentials"""
        user = User.objects.create_user(**self.user_data)
        url = reverse('token_obtain_pair')
        payload = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_token_invalid_credentials(self):
        """Test that token is not created if invalid credentials are given"""
        User.objects.create_user(**self.user_data)
        url = reverse('token_obtain_pair')
        payload = {
            'email': self.user_data['email'],
            'password': 'wrongpassword'
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', res.data)

    def test_token_no_user(self):
        """Test that token is not created if user doesn't exist"""
        url = reverse('token_obtain_pair')
        payload = {
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        }
        res = self.client.post(url, payload)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', res.data)

    def test_retrieve_user_unauthorized(self):
        """Test that authentication is required for users"""
        url = reverse('user-me')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_profile_success(self):
        """Test retrieving profile for logged in user"""
        user = User.objects.create_user(**self.user_data)
        self.client.force_authenticate(user=user)
        url = reverse('user-me')
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], user.email)
        self.assertEqual(res.data['first_name'], user.first_name)

    def test_post_me_not_allowed(self):
        """Test that POST is not allowed on the me URL"""
        url = reverse('user-me')
        res = self.client.post(url, {})

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_user_profile(self):
        """Test updating the user profile for authenticated user"""
        user = User.objects.create_user(**self.user_data)
        self.client.force_authenticate(user=user)
        url = reverse('user-me')
        payload = {
            'first_name': 'New Name',
            'last_name': 'Updated'
        }
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.first_name, payload['first_name'])
        self.assertEqual(user.last_name, payload['last_name'])
