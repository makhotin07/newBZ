"""
Настройки пагинации для API
"""
from rest_framework.pagination import PageNumberPagination


class NoPagination(PageNumberPagination):
    """Отключает пагинацию для определенных ViewSets"""
    page_size = None
