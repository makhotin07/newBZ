import json
from channels.generic.websocket import AsyncWebsocketConsumer


class TestConsumer(AsyncWebsocketConsumer):
    """
    Простой тестовый consumer для проверки WebSocket соединений
    """
    
    async def connect(self):
        """Подключение пользователя к WebSocket"""
        print(f"WebSocket connect attempt from {self.scope['client']}")
        print(f"User: {self.scope['user']}")
        print(f"Headers: {dict(self.scope['headers'])}")
        
        # Принимаем соединение
        await self.accept()
        print("WebSocket connection accepted")
        
        # Отправляем приветственное сообщение
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'WebSocket connection established successfully!',
            'user': str(self.scope['user'])
        }))
    
    async def disconnect(self, close_code):
        """Отключение пользователя от WebSocket"""
        print(f"WebSocket disconnected with code: {close_code}")
    
    async def receive(self, text_data):
        """Получение сообщения от клиента"""
        try:
            data = json.loads(text_data)
            print(f"Received message: {data}")
            
            # Эхо-ответ
            await self.send(text_data=json.dumps({
                'type': 'echo',
                'message': f'Echo: {data.get("message", "No message")}',
                'timestamp': data.get('timestamp', '')
            }))
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
