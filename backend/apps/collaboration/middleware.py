import json
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth.models import AnonymousUser

User = get_user_model()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware для аутентификации WebSocket соединений с JWT токенами
    """
    
    async def __call__(self, scope, receive, send):
        print(f"WebSocket middleware called for {scope.get('type', 'unknown')}")
        print(f"URL: {scope.get('path', 'unknown')}")
        print(f"Query string: {scope.get('query_string', b'').decode()}")
        
        # Получаем токен из query параметров
        query_string = scope.get('query_string', b'').decode()
        query_params = {}
        if query_string:
            for param in query_string.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    query_params[key] = value
        token = query_params.get('token', None)
        
        print(f"Token found: {bool(token)}")
        
        if token:
            try:
                # Валидируем JWT токен
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                print(f"User ID from token: {user_id}")
                
                # Получаем пользователя из базы данных
                user = await self.get_user(user_id)
                if user:
                    scope['user'] = user
                    print(f"User authenticated: {user.email}")
                else:
                    scope['user'] = AnonymousUser()
                    print("User not found in database")
            except (TokenError, InvalidToken, KeyError) as e:
                print(f"Token validation error: {e}")
                scope['user'] = AnonymousUser()
        else:
            print("No token provided, using anonymous user")
            scope['user'] = AnonymousUser()
        
        print(f"Final user: {scope['user']}")
        # Убираем лишние print'ы для production
        print(f"Middleware completed, user: {scope['user']}")
        # Убираем лишние print'ы для production
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
