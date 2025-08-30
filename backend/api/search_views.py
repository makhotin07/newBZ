"""
Контроллеры для поиска (Clean Architecture)
"""
from rest_framework import status, viewsets
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from backend.apps.search.models import SearchHistory, SavedSearch
from backend.apps.search.serializers import (
    SearchResultSerializer, SearchHistorySerializer, SavedSearchSerializer,
    AutocompleteSerializer, SearchRequestSerializer
)
from backend.services.search_service import SearchService


class SearchViewSet(viewsets.ViewSet):
    """ViewSet для поиска"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        """Основной поиск"""
        serializer = SearchRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        search_service = SearchService(request.user, data.get('workspace_id'))
        
        results = search_service.search(
            query=data.get('query', ''),
            search_type=data.get('search_type', 'all'),
            filters=data.get('filters', {}),
            sort_by=data.get('sort_by', 'relevance'),
            sort_order=data.get('sort_order', 'desc'),
            page=data.get('page', 1),
            page_size=data.get('page_size', 20)
        )
        
        return Response(results)
    
    @action(detail=False, methods=['get'])
    def autocomplete(self, request):
        """Автодополнение поиска"""
        query = request.query_params.get('q', '')
        workspace_id = request.query_params.get('workspace_id')
        limit = int(request.query_params.get('limit', 10))
        
        if not query or len(query) < 2:
            return Response([])
        
        search_service = SearchService(request.user, workspace_id)
        suggestions = search_service.get_autocomplete_suggestions(query, limit)
        
        serializer = AutocompleteSerializer(suggestions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='global')
    def global_search(self, request):
        """Глобальный поиск по всем workspace"""
        query = request.query_params.get('q', '')
        search_type = request.query_params.get('type', 'all')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        if not query:
            return Response({'results': [], 'count': 0})
        
        search_service = SearchService(request.user, None)  # None для глобального поиска
        results = search_service.search(
            query=query,
            search_type=search_type,
            page=page,
            page_size=page_size
        )
        
        return Response(results)
    
    @action(detail=False, methods=['get'], url_path='workspace/(?P<workspace_id>[^/.]+)')
    def workspace_search(self, request, workspace_id=None):
        """Поиск в конкретном workspace"""
        query = request.query_params.get('q', '')
        search_type = request.query_params.get('type', 'all')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        if not query:
            return Response({'results': [], 'count': 0})
        
        search_service = SearchService(request.user, workspace_id)
        results = search_service.search(
            query=query,
            search_type=search_type,
            page=page,
            page_size=page_size
        )
        
        return Response(results)


class SearchHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet для истории поиска"""
    serializer_class = SearchHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Получение истории поиска пользователя"""
        workspace_id = self.request.query_params.get('workspace_id')
        queryset = SearchHistory.objects.filter(user=self.request.user)
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Создание записи в истории поиска"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Очистка истории поиска"""
        workspace_id = request.query_params.get('workspace_id')
        queryset = SearchHistory.objects.filter(user=request.user)
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        count = queryset.count()
        queryset.delete()
        
        return Response({
            'message': f'Удалено {count} записей истории поиска'
        })


class SavedSearchViewSet(viewsets.ModelViewSet):
    """ViewSet для сохраненных поисков"""
    serializer_class = SavedSearchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Получение сохраненных поисков"""
        workspace_id = self.request.query_params.get('workspace_id')
        queryset = SavedSearch.objects.filter(
            Q(user=self.request.user) | Q(is_public=True)
        )
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Создание сохраненного поиска"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Выполнение сохраненного поиска"""
        saved_search = self.get_object()
        search_service = SearchService(request.user, saved_search.workspace_id)
        
        results = search_service.search(
            query=saved_search.query,
            search_type=saved_search.search_type,
            filters=saved_search.filters
        )
        
        return Response(results)
