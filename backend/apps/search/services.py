"""
Сервисный слой для поиска по контенту
"""
import re
from typing import List, Dict, Any, Optional
from django.db.models import Q, Count
from django.db import transaction
from django.contrib.auth import get_user_model
from backend.apps.notes.models import Page, Tag, Comment
from backend.apps.tasks.models import Task, TaskBoard
from backend.apps.databases.models import Database, DatabaseRecord
from backend.apps.workspaces.models import Workspace, WorkspaceMember
from .models import SearchHistory, SavedSearch, SearchIndex

User = get_user_model()


class SearchService:
    """Сервис для поиска по всем типам контента"""
    
    def __init__(self, user: User, workspace_id: Optional[str] = None):
        self.user = user
        self.workspace_id = workspace_id
        self.workspace = None
        
        if workspace_id:
            try:
                self.workspace = Workspace.objects.get(
                    id=workspace_id,
                    members__user=user
                )
            except Workspace.DoesNotExist:
                self.workspace = None
    
    def search(self, query: str, search_type: str = 'all', filters: Dict = None, 
               sort_by: str = 'relevance', sort_order: str = 'desc',
               page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """Основной метод поиска"""
        
        if not query and not filters:
            return self._get_recent_items(search_type, page, page_size)
        
        results = []
        total_count = 0
        
        if search_type == 'all':
            # Поиск по всем типам контента
            for content_type in ['pages', 'tasks', 'databases']:
                type_results = self._search_by_type(
                    query, content_type, filters, sort_by, sort_order
                )
                results.extend(type_results)
        else:
            results = self._search_by_type(
                query, search_type, filters, sort_by, sort_order
            )
        
        # Сортировка и пагинация
        results = self._sort_results(results, sort_by, sort_order)
        total_count = len(results)
        
        # Пагинация
        start = (page - 1) * page_size
        end = start + page_size
        results = results[start:end]
        
        # Сохранение в историю
        self._save_search_history(query, search_type, total_count)
        
        return {
            'results': results,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }
    
    def _search_by_type(self, query: str, content_type: str, filters: Dict = None,
                       sort_by: str = 'relevance', sort_order: str = 'desc') -> List[Dict]:
        """Поиск по конкретному типу контента"""
        
        if content_type == 'pages':
            return self._search_pages(query, filters)
        elif content_type == 'tasks':
            return self._search_tasks(query, filters)
        elif content_type == 'databases':
            return self._search_databases(query, filters)
        else:
            return []
    
    def _search_pages(self, query: str, filters: Dict = None) -> List[Dict]:
        """Поиск по страницам/заметкам"""
        queryset = Page.objects.select_related('workspace', 'author').prefetch_related('tags')
        
        # Ограничение по рабочему пространству
        if self.workspace:
            queryset = queryset.filter(workspace=self.workspace)
        else:
            queryset = queryset.filter(workspace__members__user=self.user)
        
        # Поиск по тексту
        if query:
            q_objects = Q()
            words = query.split()
            for word in words:
                q_objects |= Q(title__icontains=word) | Q(content__icontains=word)
            queryset = queryset.filter(q_objects)
        
        # Применение фильтров
        if filters:
            if 'tags' in filters:
                queryset = queryset.filter(tags__name__in=filters['tags'])
            # Skip category filter as it's not in Page model
            if 'created_after' in filters:
                queryset = queryset.filter(created_at__gte=filters['created_after'])
            if 'created_before' in filters:
                queryset = queryset.filter(created_at__lte=filters['created_before'])
            if 'author' in filters:
                queryset = queryset.filter(author_id=filters['author'])
        
        results = []
        for page in queryset[:100]:  # Ограничиваем количество
            result = {
                'id': str(page.id),
                'title': page.title,
                'content': self._truncate_content(str(page.content_text or '')),
                'content_type': 'page',
                'url': f'/workspace/{page.workspace_id}/page/{page.id}',
                'workspace_id': str(page.workspace_id),
                'created_at': page.created_at,
                'updated_at': page.updated_at,
                'tags': [tag.name for tag in page.tags.all()],
                'metadata': {
                    'author': page.author.full_name or page.author.email,
                    'workspace': page.workspace.name,
                    'is_template': page.is_template,
                }
            }
            
            # Добавление подсветки найденных фрагментов
            if query:
                result['highlight'] = self._highlight_content(str(page.content_text or ''), query)
            
            results.append(result)
        
        return results
    
    def _search_tasks(self, query: str, filters: Dict = None) -> List[Dict]:
        """Поиск по задачам"""
        queryset = Task.objects.select_related('board__workspace', 'created_by', 'assigned_to')
        
        # Ограничение по рабочему пространству
        if self.workspace:
            queryset = queryset.filter(board__workspace=self.workspace)
        else:
            queryset = queryset.filter(board__workspace__members__user=self.user)
        
        # Поиск по тексту
        if query:
            q_objects = Q()
            words = query.split()
            for word in words:
                q_objects |= Q(title__icontains=word) | Q(description__icontains=word)
            queryset = queryset.filter(q_objects)
        
        # Применение фильтров
        if filters:
            if 'status' in filters:
                queryset = queryset.filter(status__name__in=filters['status'])
            if 'priority' in filters:
                queryset = queryset.filter(priority__in=filters['priority'])
            if 'assigned_to' in filters:
                queryset = queryset.filter(assigned_to_id__in=filters['assigned_to'])
            if 'due_date_after' in filters:
                queryset = queryset.filter(due_date__gte=filters['due_date_after'])
            if 'due_date_before' in filters:
                queryset = queryset.filter(due_date__lte=filters['due_date_before'])
        
        results = []
        for task in queryset[:100]:
            result = {
                'id': str(task.id),
                'title': task.title,
                'content': self._truncate_content(task.description or ''),
                'content_type': 'task',
                'url': f'/workspace/{task.board.workspace_id}/tasks/{task.board_id}?task={task.id}',
                'workspace_id': str(task.board.workspace_id),
                'created_at': task.created_at,
                'updated_at': task.updated_at,
                'metadata': {
                    'priority': task.priority,
                    'status': task.status.name if task.status else 'No Status',
                    'assigned_to': task.assigned_to.full_name if task.assigned_to else 'Unassigned',
                    'due_date': task.due_date.isoformat() if task.due_date else None,
                    'board': task.board.name,
                }
            }
            
            if query:
                result['highlight'] = self._highlight_content(task.description or '', query)
            
            results.append(result)
        
        return results
    
    def _search_databases(self, query: str, filters: Dict = None) -> List[Dict]:
        """Поиск по базам данных"""
        results = []
        
        # Поиск по самим базам данных
        db_queryset = Database.objects.select_related('workspace', 'author')
        
        if self.workspace:
            db_queryset = db_queryset.filter(workspace=self.workspace)
        else:
            db_queryset = db_queryset.filter(workspace__members__user=self.user)
        
        if query:
            q_objects = Q(name__icontains=query) | Q(description__icontains=query)
            db_queryset = db_queryset.filter(q_objects)
        
        for database in db_queryset:
            results.append({
                'id': str(database.id),
                'title': database.name,
                'content': self._truncate_content(database.description or ''),
                'content_type': 'database',
                'url': f'/workspace/{database.workspace_id}/database/{database.id}',
                'workspace_id': str(database.workspace_id),
                'created_at': database.created_at,
                'updated_at': database.updated_at,
                                    'metadata': {
                    'author': database.author.full_name or database.author.email,
                    'workspace': database.workspace.name,
                    'fields_count': database.fields.count(),
                    'rows_count': database.rows.count(),
                }
            })
        
        return results
    
    def _get_recent_items(self, content_type: str, page: int, page_size: int) -> Dict[str, Any]:
        """Получение недавних элементов при пустом поиске"""
        results = []
        
        if content_type == 'all' or content_type == 'pages':
            recent_pages = Page.objects.filter(
                workspace__members__user=self.user
            ).select_related('workspace', 'author').order_by('-updated_at')[:10]
            
            for page in recent_pages:
                results.append({
                    'id': str(page.id),
                    'title': page.title,
                    'content': self._truncate_content(str(page.content_text or '')),
                    'content_type': 'page',
                    'url': f'/workspace/{page.workspace_id}/page/{page.id}',
                    'workspace_id': str(page.workspace_id),
                    'created_at': page.created_at,
                    'updated_at': page.updated_at,
                    'metadata': {
                        'workspace': page.workspace.name,
                    }
                })
        
        total_count = len(results)
        start = (page - 1) * page_size
        end = start + page_size
        results = results[start:end]
        
        return {
            'results': results,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }
    
    def _sort_results(self, results: List[Dict], sort_by: str, sort_order: str) -> List[Dict]:
        """Сортировка результатов поиска"""
        reverse = sort_order == 'desc'
        
        if sort_by == 'title':
            results.sort(key=lambda x: x['title'].lower(), reverse=reverse)
        elif sort_by == 'created_at':
            results.sort(key=lambda x: x['created_at'], reverse=reverse)
        elif sort_by == 'updated_at':
            results.sort(key=lambda x: x['updated_at'], reverse=reverse)
        # relevance - оставляем как есть (уже отсортировано по релевантности)
        
        return results
    
    def _truncate_content(self, content: str, max_length: int = 200) -> str:
        """Обрезка контента для превью"""
        if len(content) <= max_length:
            return content
        return content[:max_length].rsplit(' ', 1)[0] + '...'
    
    def _highlight_content(self, content: str, query: str) -> Dict[str, str]:
        """Подсветка найденных фрагментов в контенте"""
        words = query.split()
        highlighted_content = content
        
        for word in words:
            pattern = re.compile(re.escape(word), re.IGNORECASE)
            highlighted_content = pattern.sub(
                f'<mark>{word}</mark>', highlighted_content
            )
        
        # Найти лучший фрагмент с подсветкой
        best_fragment = self._find_best_fragment(highlighted_content, query)
        
        return {
            'fragment': best_fragment,
            'full_content': highlighted_content[:500] + ('...' if len(highlighted_content) > 500 else '')
        }
    
    def _find_best_fragment(self, content: str, query: str, fragment_length: int = 150) -> str:
        """Найти наиболее релевантный фрагмент с поисковым запросом"""
        words = query.lower().split()
        content_lower = content.lower()
        
        best_score = 0
        best_start = 0
        
        # Ищем позицию с максимальным количеством совпадений
        for i in range(len(content) - fragment_length + 1):
            fragment = content_lower[i:i + fragment_length]
            score = sum(fragment.count(word) for word in words)
            
            if score > best_score:
                best_score = score
                best_start = i
        
        # Корректируем начало фрагмента по границам слов
        start = max(0, content.rfind(' ', 0, best_start) + 1)
        end = min(len(content), content.find(' ', best_start + fragment_length))
        if end == -1:
            end = len(content)
        
        fragment = content[start:end]
        if start > 0:
            fragment = '...' + fragment
        if end < len(content):
            fragment = fragment + '...'
        
        return fragment
    
    def _save_search_history(self, query: str, search_type: str, results_count: int):
        """Сохранение поискового запроса в историю"""
        if query:  # Сохраняем только непустые запросы
            SearchHistory.objects.create(
                user=self.user,
                workspace=self.workspace,
                query=query,
                search_type=search_type,
                results_count=results_count
            )
    
    def get_autocomplete_suggestions(self, query: str, limit: int = 10) -> List[Dict]:
        """Получение предложений для автодополнения"""
        suggestions = []
        
        if len(query) < 2:
            return suggestions
        
        # Поиск в истории запросов
        history_queries = SearchHistory.objects.filter(
            user=self.user,
            query__icontains=query
        ).values_list('query', flat=True).distinct()[:5]
        
        for hist_query in history_queries:
            suggestions.append({
                'value': hist_query,
                'label': hist_query,
                'type': 'history'
            })
        
        # Поиск тегов
        if self.workspace:
            tag_queryset = Tag.objects.filter(
                pages__workspace=self.workspace,
                name__icontains=query
            )
        else:
            tag_queryset = Tag.objects.filter(
                pages__workspace__members__user=self.user,
                name__icontains=query
            )
        
        tags = tag_queryset.annotate(
            usage_count=Count('pages')
        ).order_by('-usage_count')[:5]
        
        for tag in tags:
            suggestions.append({
                'value': f'tag:{tag.name}',
                'label': f'#{tag.name}',
                'type': 'tag',
                'count': tag.usage_count
            })
        
        # Поиск названий страниц
        if self.workspace:
            page_queryset = Page.objects.filter(
                workspace=self.workspace,
                title__icontains=query
            )
        else:
            page_queryset = Page.objects.filter(
                workspace__members__user=self.user,
                title__icontains=query
            )
        
        pages = page_queryset.order_by('-updated_at')[:3]
        
        for page in pages:
            suggestions.append({
                'value': page.title,
                'label': page.title,
                'type': 'page'
            })
        
        return suggestions[:limit]
