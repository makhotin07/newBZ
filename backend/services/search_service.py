"""
Сервисный слой для поиска
"""
from typing import List, Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from django.core.paginator import Paginator
from django.utils import timezone

from backend.apps.search.models import SearchHistory, SavedSearch
from backend.apps.notes.models import Page
from backend.apps.tasks.models import Task
from backend.apps.workspaces.models import Workspace
from backend.core.exceptions import BusinessLogicException

User = get_user_model()


class SearchService:
    """Сервис для поиска по всему контенту"""
    
    def __init__(self, user: User, workspace_id: Optional[int] = None):
        self.user = user
        self.workspace_id = workspace_id
        self._user_workspaces = None
    
    @property
    def user_workspaces(self) -> List[int]:
        """Получение ID рабочих пространств пользователя"""
        if self._user_workspaces is None:
            self._user_workspaces = list(Workspace.objects.filter(
                members__user=self.user
            ).values_list('id', flat=True))
        return self._user_workspaces
    
    def search(
        self,
        query: str,
        search_type: str = 'all',
        filters: Dict[str, Any] = None,
        sort_by: str = 'relevance',
        sort_order: str = 'desc',
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """Основной поиск по контенту"""
        if not query or len(query.strip()) < 2:
            return {
                'results': [],
                'total': 0,
                'page': page,
                'page_size': page_size,
                'pages': 0
            }
        
        # Сохранение в историю поиска
        self._save_search_history(query)
        
        # Выполнение поиска
        if search_type == 'pages':
            results = self._search_pages(query, filters)
        elif search_type == 'tasks':
            results = self._search_tasks(query, filters)
        else:
            # Поиск по всему
            pages = self._search_pages(query, filters)
            tasks = self._search_tasks(query, filters)
            results = pages + tasks
        
        # Сортировка результатов
        results = self._sort_results(results, sort_by, sort_order)
        
        # Пагинация
        paginator = Paginator(results, page_size)
        page_obj = paginator.get_page(page)
        
        return {
            'results': page_obj.object_list,
            'total': paginator.count,
            'page': page,
            'page_size': page_size,
            'pages': paginator.num_pages
        }
    
    def get_autocomplete_suggestions(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Получение предложений для автодополнения"""
        if not query or len(query.strip()) < 2:
            return []
        
        suggestions = []
        
        # Поиск по страницам
        pages = Page.objects.filter(
            workspace__in=self.user_workspaces,
            is_deleted=False,
            title__icontains=query
        )[:limit]
        
        for page in pages:
            suggestions.append({
                'type': 'page',
                'id': page.id,
                'title': page.title,
                'workspace': page.workspace.name
            })
        
        # Поиск по задачам
        tasks = Task.objects.filter(
            board__workspace__in=self.user_workspaces,
            title__icontains=query
        )[:limit]
        
        for task in tasks:
            suggestions.append({
                'type': 'task',
                'id': task.id,
                'title': task.title,
                'workspace': task.board.workspace.name
            })
        
        return suggestions[:limit]
    
    def _search_pages(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Поиск по страницам"""
        filters = filters or {}
        
        queryset = Page.objects.filter(
            workspace__in=self.user_workspaces,
            is_deleted=False
        )
        
        # Применение фильтров
        if filters.get('workspace_id'):
            queryset = queryset.filter(workspace_id=filters['workspace_id'])
        
        if filters.get('archived') is not None:
            queryset = queryset.filter(is_archived=filters['archived'])
        
        if filters.get('templates') is not None:
            queryset = queryset.filter(is_template=filters['templates'])
        
        # Поиск по тексту
        search_query = Q(title__icontains=query) | Q(content_text__icontains=query)
        queryset = queryset.filter(search_query)
        
        # Подсчет релевантности
        results = []
        for page in queryset:
            relevance = self._calculate_page_relevance(page, query)
            results.append({
                'type': 'page',
                'id': page.id,
                'title': page.title,
                'content': page.content_text[:200] + '...' if len(page.content_text) > 200 else page.content_text,
                'workspace': page.workspace.name,
                'author': page.author.username,
                'updated_at': page.updated_at,
                'relevance': relevance
            })
        
        return results
    
    def _search_tasks(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Поиск по задачам"""
        filters = filters or {}
        
        queryset = Task.objects.filter(
            board__workspace__in=self.user_workspaces
        )
        
        # Применение фильтров
        if filters.get('workspace_id'):
            queryset = queryset.filter(board__workspace_id=filters['workspace_id'])
        
        if filters.get('status'):
            queryset = queryset.filter(status=filters['status'])
        
        if filters.get('priority'):
            queryset = queryset.filter(priority=filters['priority'])
        
        # Поиск по тексту
        search_query = Q(title__icontains=query) | Q(description__icontains=query)
        queryset = queryset.filter(search_query)
        
        # Подсчет релевантности
        results = []
        for task in queryset:
            relevance = self._calculate_task_relevance(task, query)
            results.append({
                'type': 'task',
                'id': task.id,
                'title': task.title,
                'description': task.description[:200] + '...' if task.description and len(task.description) > 200 else task.description,
                'workspace': task.board.workspace.name,
                'status': task.status,
                'priority': task.priority,
                'assignees': [user.username for user in task.assignees.all()],
                'updated_at': task.updated_at,
                'relevance': relevance
            })
        
        return results
    
    def _calculate_page_relevance(self, page: Page, query: str) -> float:
        """Подсчет релевантности страницы"""
        relevance = 0.0
        
        # Поиск в заголовке (высокий вес)
        if query.lower() in page.title.lower():
            relevance += 10.0
        
        # Поиск в содержимом
        if query.lower() in page.content_text.lower():
            relevance += 5.0
        
        # Время обновления (новые страницы получают бонус)
        days_since_update = (timezone.now() - page.updated_at).days
        if days_since_update < 7:
            relevance += 2.0
        elif days_since_update < 30:
            relevance += 1.0
        
        return relevance
    
    def _calculate_task_relevance(self, task: Task, query: str) -> float:
        """Подсчет релевантности задачи"""
        relevance = 0.0
        
        # Поиск в заголовке
        if query.lower() in task.title.lower():
            relevance += 10.0
        
        # Поиск в описании
        if task.description and query.lower() in task.description.lower():
            relevance += 5.0
        
        # Приоритет задачи
        if task.priority == 'high':
            relevance += 3.0
        elif task.priority == 'medium':
            relevance += 2.0
        
        # Время обновления
        days_since_update = (timezone.now() - task.updated_at).days
        if days_since_update < 7:
            relevance += 2.0
        
        return relevance
    
    def _sort_results(self, results: List[Dict[str, Any]], sort_by: str, sort_order: str) -> List[Dict[str, Any]]:
        """Сортировка результатов"""
        reverse = sort_order == 'desc'
        
        if sort_by == 'relevance':
            results.sort(key=lambda x: x.get('relevance', 0), reverse=reverse)
        elif sort_by == 'updated_at':
            results.sort(key=lambda x: x.get('updated_at', timezone.now()), reverse=reverse)
        elif sort_by == 'title':
            results.sort(key=lambda x: x.get('title', '').lower(), reverse=reverse)
        
        return results
    
    def _save_search_history(self, query: str):
        """Сохранение поискового запроса в историю"""
        SearchHistory.objects.create(
            user=self.user,
            query=query,
            workspace_id=self.workspace_id
        )
