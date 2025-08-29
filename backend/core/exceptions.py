"""
Базовые исключения для приложения
"""
from rest_framework.exceptions import APIException


class BusinessLogicException(APIException):
    """Исключение для бизнес-логики"""
    status_code = 400
    default_detail = 'Ошибка бизнес-логики'


class ValidationException(APIException):
    """Исключение для валидации данных"""
    status_code = 422
    default_detail = 'Ошибка валидации данных'


class NotFoundException(APIException):
    """Исключение для отсутствующих ресурсов"""
    status_code = 404
    default_detail = 'Ресурс не найден'
