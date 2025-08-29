from django.urls import path
from . import consumers
from . import test_consumer

websocket_urlpatterns = [
    # Тестовый WebSocket для отладки
    path('ws/test/', 
         test_consumer.TestConsumer.as_asgi()),
    
    # Совместная работа над ресурсами
    path('ws/collab/<str:workspace_id>/<str:resource_type>/<str:resource_id>/', 
         consumers.CollaborationConsumer.as_asgi()),
    
    # Уведомления пользователя
    path('ws/notifications/', 
         consumers.NotificationConsumer.as_asgi()),
]
