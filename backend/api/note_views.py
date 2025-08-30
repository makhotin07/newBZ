"""
Контроллеры для управления заметками (Clean Architecture)
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

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
    
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        """Получение и создание комментариев к странице"""
        if request.method == 'GET':
            comments = CommentService.get_page_comments(
                page_id=pk,
                user=request.user
            )
            serializer = CommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)
        elif request.method == 'POST':
            try:
                comment = CommentService.add_comment(
                    user=request.user,
                    page_id=pk,
                    content=request.data.get('content', '')
                )
                serializer = CommentSerializer(comment, context={'request': request})
                return Response(serializer.data)
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
    
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
                return Response(serializer.data)
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Поиск страниц"""
        query = request.query_params.get('q', '')
        workspace_id = request.query_params.get('workspace')
        
        try:
            results = PageService.search_pages(
                user=request.user,
                query=query,
                workspace_id=int(workspace_id) if workspace_id else None
            )
            serializer = PageListSerializer(results, many=True)
            return Response({
                'pages': serializer.data,
                'count': len(results),
                'query': query
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class PageCommentsListView(APIView):
    """View для получения списка комментариев страницы и создания комментария"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, page_id):
        """Получение списка комментариев страницы"""
        comments = CommentService.get_page_comments(
            page_id=page_id,
            user=request.user
        )
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request, page_id):
        """Создание комментария"""
        try:
            comment = CommentService.add_comment(
                user=request.user,
                page_id=page_id,
                content=request.data.get('content', '')
            )
            serializer = CommentSerializer(comment, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PageCommentDetailView(APIView):
    """View для управления отдельным комментарием"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, page_id):
        """Получение конкретного комментария"""
        comment_id = request.query_params.get('comment_id')
        if not comment_id:
            return Response({'error': 'comment_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        comments = CommentService.get_page_comments(
            page_id=page_id,
            user=request.user
        )
        comment = next((c for c in comments if str(c.id) == comment_id), None)
        if not comment:
            return Response({'error': 'Комментарий не найден'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request, page_id):
        """Полное обновление комментария"""
        comment_id = request.query_params.get('comment_id')
        if not comment_id:
            return Response({'error': 'comment_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            comment = CommentService.update_comment(
                comment_id=int(comment_id),
                user=request.user,
                content=request.data.get('content', '')
            )
            serializer = CommentSerializer(comment, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, page_id):
        """Частичное обновление комментария"""
        comment_id = request.query_params.get('comment_id')
        if not comment_id:
            return Response({'error': 'comment_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            comment = CommentService.update_comment(
                comment_id=int(comment_id),
                user=request.user,
                content=request.data.get('content', '')
            )
            serializer = CommentSerializer(comment, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, page_id):
        """Удаление комментария"""
        comment_id = request.query_params.get('comment_id')
        if not comment_id:
            return Response({'error': 'comment_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            CommentService.delete_comment(
                comment_id=int(comment_id),
                user=request.user
            )
            return Response({'message': 'Комментарий удален'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PageCommentResolveView(APIView):
    """View для разрешения комментария"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, page_id):
        """Разрешение комментария"""
        comment_id = request.query_params.get('comment_id')
        if not comment_id:
            return Response({'error': 'comment_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            resolved = request.data.get('resolved', False)
            comment = CommentService.resolve_comment(
                comment_id=int(comment_id),
                user=request.user,
                resolved=resolved
            )
            serializer = CommentSerializer(comment, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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

