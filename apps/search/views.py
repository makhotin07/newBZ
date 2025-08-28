from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from .models import SearchHistory, SavedSearch
from .serializers import (
    SearchResultSerializer, SearchHistorySerializer, SavedSearchSerializer,
    AutocompleteSerializer, SearchRequestSerializer
)
from .services import SearchService


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


class SearchHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для истории поиска"""
    serializer_class = SearchHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        workspace_id = self.request.query_params.get('workspace_id')
        queryset = SearchHistory.objects.filter(user=self.request.user)
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return queryset.order_by('-created_at')
    
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
            'message': f'Deleted {count} search history entries'
        })


class SavedSearchViewSet(viewsets.ModelViewSet):
    """ViewSet для сохраненных поисков"""
    serializer_class = SavedSearchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        workspace_id = self.request.query_params.get('workspace_id')
        queryset = SavedSearch.objects.filter(
            Q(user=self.request.user) | Q(is_public=True)
        )
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return queryset.order_by('-updated_at')
    
    def perform_create(self, serializer):
        workspace_id = self.request.data.get('workspace_id')
        workspace = None
        
        if workspace_id:
            from apps.workspaces.models import Workspace
            try:
                workspace = Workspace.objects.get(
                    id=workspace_id,
                    members__user=self.request.user
                )
            except Workspace.DoesNotExist:
                pass
        
        serializer.save(user=self.request.user, workspace=workspace)
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Выполнение сохраненного поиска"""
        saved_search = self.get_object()
        
        search_service = SearchService(
            request.user, 
            str(saved_search.workspace_id) if saved_search.workspace else None
        )
        
        # Получаем параметры страницы из запроса
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        results = search_service.search(
            query=saved_search.query,
            search_type=saved_search.search_type,
            filters=saved_search.filters,
            page=page,
            page_size=page_size
        )
        
        return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_suggestions(request):
    """Получение популярных поисковых запросов и тегов"""
    workspace_id = request.query_params.get('workspace_id')
    
    # Популярные запросы
    popular_queries = SearchHistory.objects.filter(user=request.user)
    if workspace_id:
        popular_queries = popular_queries.filter(workspace_id=workspace_id)
    
    popular_queries = popular_queries.values('query').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    # Популярные теги
    from apps.notes.models import Tag
    popular_tags_queryset = Tag.objects.filter(
        notes__workspace__members__user=request.user
    )
    
    if workspace_id:
        popular_tags_queryset = popular_tags_queryset.filter(
            notes__workspace_id=workspace_id
        )
    
    popular_tags = popular_tags_queryset.annotate(
        count=Count('notes')
    ).order_by('-count')[:10]
    
    return Response({
        'popular_queries': [
            {'query': item['query'], 'count': item['count']} 
            for item in popular_queries
        ],
        'popular_tags': [
            {'name': tag.name, 'count': tag.count} 
            for tag in popular_tags
        ]
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_search(request):
    """Быстрый поиск для глобального поиска"""
    query = request.data.get('query', '')
    workspace_id = request.data.get('workspace_id')
    
    if not query or len(query) < 2:
        return Response([])
    
    search_service = SearchService(request.user, workspace_id)
    
    # Быстрый поиск с ограниченным количеством результатов
    results = search_service.search(
        query=query,
        search_type='all',
        page_size=8  # Только несколько результатов для быстрого просмотра
    )
    
    # Группируем результаты по типам
    grouped_results = {
        'pages': [],
        'tasks': [],
        'databases': []
    }
    
    for result in results['results']:
        content_type = result['content_type']
        if content_type == 'page':
            grouped_results['pages'].append(result)
        elif content_type == 'task':
            grouped_results['tasks'].append(result)
        elif content_type == 'database':
            grouped_results['databases'].append(result)
    
    return Response(grouped_results)
