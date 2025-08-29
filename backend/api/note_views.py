"""
Контроллеры для управления заметками (Clean Architecture)
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.apps.notes.serializers import (
    TagSerializer, PageListSerializer, PageDetailSerializer,
    PageCreateSerializer, BlockSerializer, CommentSerializer,
    PageVersionSerializer
)
from backend.services.note_service import PageService, TagService, CommentService


class PageViewSet(viewsets.ModelViewSet):
    """ViewSet для страниц"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PageCreateSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return PageDetailSerializer
        return PageListSerializer
    
    def get_queryset(self):
        """Получение queryset через сервис"""
        workspace_id = self.request.query_params.get('workspace')
        parent_id = self.request.query_params.get('parent')
        show_archived = self.request.query_params.get('archived', 'false').lower() == 'true'
        show_templates = self.request.query_params.get('templates', 'false').lower() == 'true'
        
        return PageService.get_user_pages(
            user=self.request.user,
            workspace_id=int(workspace_id) if workspace_id else None,
            parent_id=int(parent_id) if parent_id and parent_id != 'null' else None,
            show_archived=show_archived,
            show_templates=show_templates
        )
    
    def get_object(self):
        """Получение объекта страницы с проверкой доступа"""
        page_id = self.kwargs['pk']
        try:
            return PageService.get_page_by_id(
                page_id=page_id,
                user=self.request.user
            )
        except Exception as e:
            from rest_framework.exceptions import NotFound
            raise NotFound("Страница не найдена")
    
    def perform_create(self, serializer):
        """Создание страницы через сервис"""
        page = PageService.create_page(
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = page
    
    def perform_update(self, serializer):
        """Обновление страницы через сервис"""
        page = PageService.update_page(
            page_id=serializer.instance.id,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = page
    
    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        """Архивирование страницы"""
        try:
            page = PageService.archive_page(
                page_id=pk,
                user=request.user
            )
            serializer = self.get_serializer(page)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Получение комментариев к странице"""
        comments = CommentService.get_page_comments(
            page_id=pk,
            user=request.user
        )
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)


class TagViewSet(viewsets.ModelViewSet):
    """ViewSet для тегов"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TagSerializer
    
    def get_queryset(self):
        """Получение queryset через сервис"""
        return TagService.get_all_tags()
    
    def perform_create(self, serializer):
        """Создание тега через сервис"""
        tag = TagService.create_tag(
            name=serializer.validated_data['name'],
            color=serializer.validated_data.get('color', '#000000')
        )
        serializer.instance = tag


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet для комментариев"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        """Получение комментариев к странице"""
        page_id = self.request.query_params.get('page')
        if not page_id:
            return Comment.objects.none()
        
        return CommentService.get_page_comments(
            page_id=int(page_id),
            user=self.request.user
        )
    
    def perform_create(self, serializer):
        """Создание комментария через сервис"""
        page_id = self.request.data.get('page')
        comment = CommentService.add_comment(
            user=self.request.user,
            page_id=page_id,
            content=serializer.validated_data['content']
        )
        serializer.instance = comment
