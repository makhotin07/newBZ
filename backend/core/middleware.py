"""
Базовый middleware для централизованной обработки ошибок
"""
import logging
from django.http import JsonResponse
from rest_framework import status
from django.conf import settings

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware:
    """Middleware для обработки исключений и возврата JSON ответов"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        """Обработка исключений и логирование"""
        logger.error(f"Ошибка в запросе {request.path}: {str(exception)}")
        
        return JsonResponse(
            {
                'error': 'Внутренняя ошибка сервера',
                'detail': str(exception) if settings.DEBUG else 'Произошла ошибка'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
