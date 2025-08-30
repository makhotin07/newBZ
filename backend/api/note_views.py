"""
Контроллеры для управления заметками (Clean Architecture)
"""
from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.apps.notes.serializers import (
    TagSerializer, PageListSerializer, PageDetailSerializer,
    PageCreateSerializer, BlockSerializer, CommentSerializer,
    PageVersionSerializer
)
from backend.services.note_service import PageService, TagService, CommentService
from backend.apps.notes.models import Comment


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
    
    @action(detail=True, methods=['get', 'post'])
    def blocks(self, request, pk=None):
        """Получение и создание блоков страницы"""
        if request.method == 'GET':
            blocks = PageService.get_page_blocks(
                page_id=pk,
                user=request.user
            )
            serializer = BlockSerializer(blocks, many=True, context={'request': request})
            return Response(serializer.data)
        elif request.method == 'POST':
            try:
                block = PageService.create_block(
                    user=request.user,
                    page_id=pk,
                    **request.data
                )
                serializer = BlockSerializer(block, context={'request': request})
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )


class PageCommentsListView(generics.ListCreateAPIView):
    """View для списка и создания комментариев к странице"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Получение комментариев для конкретной страницы"""
        page_id = self.kwargs['page_id']
        return Comment.objects.filter(page_id=page_id).select_related('author')
    
    def perform_create(self, serializer):
        """Создание комментария с привязкой к странице и автору"""
        serializer.save(
            page_id=self.kwargs['page_id'],
            author=self.request.user
        )


class PageCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View для получения, обновления и удаления комментария"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        """Получение комментария с проверкой принадлежности к странице"""
        page_id = self.kwargs['page_id']
        return Comment.objects.filter(page_id=page_id).select_related('author')


class PageCommentResolveView(generics.UpdateAPIView):
    """View для разрешения комментария"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        """Получение комментария с проверкой принадлежности к странице"""
        page_id = self.kwargs['page_id']
        return Comment.objects.filter(page_id=page_id).select_related('author')
    
    def perform_update(self, serializer):
        """Обновление статуса разрешения комментария"""
        serializer.save(is_resolved=self.request.data.get('resolved', True))


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


class BlockViewSet(viewsets.ModelViewSet):
    """ViewSet для блоков"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BlockSerializer
    
    def get_queryset(self):
        """Получение блоков через сервис"""
        return PageService.get_all_blocks(user=self.request.user)
    
    def perform_create(self, serializer):
        """Создание блока через сервис"""
        block = PageService.create_block(
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = block
    
    def perform_update(self, serializer):
        """Обновление блока через сервис"""
        block = PageService.update_block(
            block_id=serializer.instance.id,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = block
    
    def perform_destroy(self, instance):
        """Удаление блока через сервис"""
        PageService.delete_block(
            block_id=instance.id,
            user=self.request.user
        )

