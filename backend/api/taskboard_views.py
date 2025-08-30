"""
API контроллеры для управления досками задач (Clean Architecture)
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.apps.tasks.serializers import (
    TaskBoardSerializer, TaskColumnSerializer, TaskSerializer
)
from backend.services.taskboards import (
    TaskBoardService, TaskColumnService, TaskService
)


class TaskBoardViewSet(viewsets.ModelViewSet):
    """ViewSet для досок задач"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskBoardSerializer
    
    def get_queryset(self):
        """Получение queryset через сервис"""
        workspace_id = self.request.query_params.get('workspace')
        return TaskBoardService.get_user_boards(
            user=self.request.user,
            workspace_id=workspace_id
        )
    
    def get_object(self):
        """Получение объекта по ID с проверкой доступа"""
        pk = self.kwargs.get('pk')
        return TaskBoardService.get_board_by_id(pk, self.request.user)
    
    def perform_create(self, serializer):
        """Создание доски через сервис"""
        workspace_id = self.request.data.get('workspace')
        board = TaskBoardService.create_board(
            user=self.request.user,
            workspace_id=workspace_id,
            **serializer.validated_data
        )
        serializer.instance = board
    
    def perform_update(self, serializer):
        """Обновление доски через сервис"""
        board = TaskBoardService.update_board(
            board_id=serializer.instance.id,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = board
    
    def perform_destroy(self, instance):
        """Удаление доски через сервис"""
        TaskBoardService.delete_board(
            board_id=instance.id,
            user=self.request.user
        )
    
    @action(detail=True, methods=['get', 'post'])
    def columns(self, request, pk=None):
        """Управление колонками доски"""
        if request.method == 'GET':
            columns = TaskColumnService.get_board_columns(
                board_id=pk,
                user=request.user
            )
            serializer = TaskColumnSerializer(columns, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = TaskColumnSerializer(data=request.data)
            if serializer.is_valid():
                column = TaskColumnService.create_column(
                    board_id=pk,
                    user=request.user,
                    **serializer.validated_data
                )
                serializer = TaskColumnSerializer(column)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'post'])
    def tasks(self, request, pk=None):
        """Управление задачами доски"""
        if request.method == 'GET':
            # Получаем фильтры из query params
            filters = {}
            if request.query_params.get('column'):
                filters['column_id'] = request.query_params.get('column')
            if request.query_params.get('assignee'):
                filters['assignee_id'] = request.query_params.get('assignee')
            if request.query_params.get('status'):
                filters['status'] = request.query_params.get('status')
            
            tasks = TaskService.get_board_tasks(
                board_id=pk,
                user=request.user,
                **filters
            )
            serializer = TaskSerializer(tasks, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = TaskSerializer(data=request.data)
            if serializer.is_valid():
                task = TaskService.create_task(
                    user=request.user,
                    board_id=pk,
                    **serializer.validated_data
                )
                serializer = TaskSerializer(task)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskColumnViewSet(viewsets.ModelViewSet):
    """ViewSet для колонок задач"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskColumnSerializer
    
    def get_queryset(self):
        """Получение колонок через сервис"""
        board_id = self.kwargs.get('board_pk')
        if not board_id:
            return []
        
        return TaskColumnService.get_board_columns(
            board_id=board_id,
            user=self.request.user
        )
    
    def perform_create(self, serializer):
        """Создание колонки через сервис"""
        board_id = self.kwargs.get('board_pk')
        column = TaskColumnService.create_column(
            board_id=board_id,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = column
    
    def perform_update(self, serializer):
        """Обновление колонки через сервис"""
        column = TaskColumnService.update_column(
            column_id=serializer.instance.id,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = column
    
    def perform_destroy(self, instance):
        """Удаление колонки через сервис"""
        TaskColumnService.delete_column(
            column_id=instance.id,
            user=self.request.user
        )


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet для задач"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskSerializer
    
    def get_queryset(self):
        """Получение задач через сервис"""
        board_id = self.request.query_params.get('board')
        assigned_to_me = self.request.query_params.get('assigned_to_me', 'false').lower() == 'true'
        task_status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        
        filters = {}
        if board_id:
            filters['board_id'] = board_id
        if assigned_to_me:
            filters['assigned_to_me'] = True
        if task_status:
            filters['status'] = task_status
        if priority:
            filters['priority'] = priority
        
        return TaskService.get_board_tasks(
            user=self.request.user,
            **filters
        )
    
    def perform_create(self, serializer):
        """Создание задачи через сервис"""
        board_id = self.request.data.get('board')
        task = TaskService.create_task(
            user=self.request.user,
            board_id=board_id,
            **serializer.validated_data
        )
        serializer.instance = task
    
    def perform_update(self, serializer):
        """Обновление задачи через сервис"""
        task = TaskService.update_task(
            task_id=serializer.instance.id,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = task
    
    def perform_destroy(self, instance):
        """Удаление задачи через сервис"""
        TaskService.delete_task(
            task_id=instance.id,
            user=self.request.user
        )
    
    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        """Перемещение задачи в другую колонку"""
        column_id = request.data.get('column')
        position = request.data.get('position', 0)
        
        if not column_id:
            return Response(
                {'error': 'Column ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task = TaskService.move_task(
            task_id=pk,
            user=request.user,
            column_id=column_id,
            position=position
        )
        
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        """Управление комментариями к задаче"""
        if request.method == 'GET':
            # Заглушка для комментариев
            return Response([])
        
        elif request.method == 'POST':
            # Заглушка для создания комментария
            return Response({'id': 1, 'content': request.data.get('content')}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Получение активности задачи"""
        # Заглушка для активности
        return Response([
            {
                'id': 1,
                'type': 'task_created',
                'description': 'Задача создана',
                'timestamp': '2024-01-01T00:00:00Z'
            }
        ])

