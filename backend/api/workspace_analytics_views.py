"""
Контроллеры для аналитики рабочих пространств (Clean Architecture)
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta

from backend.apps.workspaces.models import Workspace, WorkspaceMember
from backend.apps.notes.models import Page, PageView
from backend.apps.tasks.models import Task, TaskBoard
from backend.apps.databases.models import Database, DatabaseRecord
from backend.apps.notifications.models import Notification


class WorkspaceAnalyticsViewSet(viewsets.ViewSet):
    """ViewSet для аналитики рабочих пространств"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_workspace(self, workspace_id):
        """Получение workspace с проверкой доступа"""
        try:
            workspace = Workspace.objects.get(
                id=workspace_id,
                members__user=self.request.user
            )
            return workspace
        except Workspace.DoesNotExist:
            return None
    
    @action(detail=False, methods=['get'], url_path='overview')
    def overview(self, request):
        """Общий обзор аналитики workspace"""
        workspace_id = request.query_params.get('workspace_id')
        if not workspace_id:
            return Response(
                {'error': 'workspace_id обязателен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workspace = self.get_workspace(workspace_id)
        if not workspace:
            return Response(
                {'error': 'Workspace не найден или нет доступа'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Получаем статистику за последние 30 дней
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Статистика по страницам
        pages_stats = self._get_pages_stats(workspace, thirty_days_ago)
        
        # Статистика по задачам
        tasks_stats = self._get_tasks_stats(workspace, thirty_days_ago)
        
        # Статистика по базам данных
        databases_stats = self._get_databases_stats(workspace, thirty_days_ago)
        
        # Статистика по участникам
        members_stats = self._get_members_stats(workspace)
        
        # Статистика по активности
        activity_stats = self._get_activity_stats(workspace, thirty_days_ago)
        
        return Response({
            'workspace_id': workspace.id,
            'workspace_name': workspace.name,
            'period': 'last_30_days',
            'pages': pages_stats,
            'tasks': tasks_stats,
            'databases': databases_stats,
            'members': members_stats,
            'activity': activity_stats
        })
    
    def _get_pages_stats(self, workspace, since_date):
        """Статистика по страницам"""
        pages = Page.objects.filter(workspace=workspace)
        total_pages = pages.count()
        
        # Страницы за период
        new_pages = pages.filter(created_at__gte=since_date).count()
        
        # Просмотры страниц
        page_views = PageView.objects.filter(
            page__workspace=workspace,
            viewed_at__gte=since_date
        ).count()
        
        # Популярные страницы
        popular_pages = pages.annotate(
            view_count=Count('views')
        ).order_by('-view_count')[:5]
        
        return {
            'total': total_pages,
            'new_this_period': new_pages,
            'views_this_period': page_views,
            'popular_pages': [
                {
                    'id': str(page.id),
                    'title': page.title,
                    'view_count': page.view_count
                } for page in popular_pages
            ]
        }
    
    def _get_tasks_stats(self, workspace, since_date):
        """Статистика по задачам"""
        tasks = Task.objects.filter(board__workspace=workspace)
        total_tasks = tasks.count()
        
        # Задачи за период
        new_tasks = tasks.filter(created_at__gte=since_date).count()
        
        # Статистика по статусам
        status_stats = tasks.values('status').annotate(
            count=Count('id')
        )
        
        # Статистика по приоритетам
        priority_stats = tasks.values('priority').annotate(
            count=Count('id')
        )
        
        return {
            'total': total_tasks,
            'new_this_period': new_tasks,
            'by_status': list(status_stats),
            'by_priority': list(priority_stats)
        }
    
    def _get_databases_stats(self, workspace, since_date):
        """Статистика по базам данных"""
        databases = Database.objects.filter(workspace=workspace)
        total_databases = databases.count()
        
        # Базы данных за период
        new_databases = databases.filter(created_at__gte=since_date).count()
        
        # Общее количество записей
        total_records = DatabaseRecord.objects.filter(
            database__workspace=workspace
        ).count()
        
        # Записи за период
        new_records = DatabaseRecord.objects.filter(
            database__workspace=workspace,
            created_at__gte=since_date
        ).count()
        
        return {
            'total_databases': total_databases,
            'new_databases_this_period': new_databases,
            'total_records': total_records,
            'new_records_this_period': new_records
        }
    
    def _get_members_stats(self, workspace):
        """Статистика по участникам"""
        members = WorkspaceMember.objects.filter(workspace=workspace)
        total_members = members.count()
        
        # Статистика по ролям
        role_stats = members.values('role').annotate(
            count=Count('id')
        )
        
        # Новые участники за последние 7 дней
        week_ago = timezone.now() - timedelta(days=7)
        new_members = members.filter(joined_at__gte=week_ago).count()
        
        return {
            'total': total_members,
            'new_this_week': new_members,
            'by_role': list(role_stats)
        }
    
    def _get_activity_stats(self, workspace, since_date):
        """Статистика по активности"""
        # Активность по дням за последние 30 дней
        activity_by_day = []
        for i in range(30):
            date = timezone.now() - timedelta(days=i)
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)
            
            # Страницы
            pages_created = Page.objects.filter(
                workspace=workspace,
                created_at__gte=start_of_day,
                created_at__lt=end_of_day
            ).count()
            
            # Задачи
            tasks_created = Task.objects.filter(
                board__workspace=workspace,
                created_at__gte=start_of_day,
                created_at__lt=end_of_day
            ).count()
            
            # Просмотры
            page_views = PageView.objects.filter(
                page__workspace=workspace,
                viewed_at__gte=start_of_day,
                viewed_at__lt=end_of_day
            ).count()
            
            activity_by_day.append({
                'date': start_of_day.date().isoformat(),
                'pages_created': pages_created,
                'tasks_created': tasks_created,
                'page_views': page_views,
                'total_activity': pages_created + tasks_created + page_views
            })
        
        return {
            'daily_breakdown': activity_by_day,
            'total_activity_period': sum(day['total_activity'] for day in activity_by_day)
        }
