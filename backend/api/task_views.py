"""
API контроллеры для управления задачами (Clean Architecture)
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.apps.tasks.serializers import (
    TaskBoardSerializer, TaskSerializer, TaskCommentSerializer, TaskColumnSerializer
)
from backend.apps.tasks.models import TaskBoard, Task, TaskComment
from backend.services.task_service import (
    TaskBoardService, TaskService, TaskCommentService
)


class TaskBoardViewSet(viewsets.ModelViewSet):
    """ViewSet для досок задач"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return TaskBoardSerializer
        return TaskBoardSerializer
    
    def get_queryset(self):
        """Получение queryset через сервис"""
        workspace_id = self.request.query_params.get('workspace')
        return TaskBoardService.get_user_boards(
            user=self.request.user,
            workspace_id=int(workspace_id) if workspace_id else None
        )
    
    def perform_create(self, serializer):
        """Создание доски через сервис"""
        workspace_id = self.request.data.get('workspace')
        board = TaskBoardService.create_board(
            user=self.request.user,
            workspace_id=workspace_id,
            **serializer.validated_data
        )
        serializer.instance = board
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Получение задач доски"""
        board = self.get_object()
        tasks = TaskService.get_user_tasks(
            user=request.user,
            board_id=board.id
        )
        
        # Дополнительная фильтрация
        column_id = request.query_params.get('column')
        if column_id:
            tasks = [t for t in tasks if t.column_id == int(column_id)]
        
        assignee_id = request.query_params.get('assignee')
        if assignee_id:
            tasks = [t for t in tasks if any(a.id == int(assignee_id) for a in t.assignees.all())]
        
        task_status = request.query_params.get('status')
        if task_status:
            tasks = [t for t in tasks if t.status == task_status]
        
        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def columns(self, request, pk=None):
        """Получение колонок доски"""
        board = self.get_object()
        columns = board.columns.all().order_by('position')
        serializer = TaskColumnSerializer(columns, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet для задач"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return TaskSerializer
        return TaskSerializer
    
    def get_queryset(self):
        """Получение queryset через сервис"""
        board_id = self.request.query_params.get('board')
        assigned_to_me = self.request.query_params.get('assigned_to_me', 'false').lower() == 'true'
        task_status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        
        return TaskService.get_user_tasks(
            user=self.request.user,
            board_id=int(board_id) if board_id else None,
            assigned_to_me=assigned_to_me,
            status=task_status,
            priority=priority
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
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Обновление статуса задачи"""
        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {'error': 'Статус не указан'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            task = TaskService.update_task_status(
                task_id=pk,
                user=request.user,
                new_status=new_status
            )
            serializer = self.get_serializer(task)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class TaskCommentViewSet(viewsets.ModelViewSet):
    """ViewSet для комментариев к задачам"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskCommentSerializer
    
    def get_queryset(self):
        """Получение комментариев к задаче"""
        task_id = self.request.query_params.get('task')
        if not task_id:
            return TaskComment.objects.none()
        
        # Проверка доступа к задаче
        task = Task.objects.filter(
            id=task_id,
            board__workspace__members__user=self.request.user
        ).first()
        
        if not task:
            return TaskComment.objects.none()
        
        return TaskComment.objects.filter(task=task).select_related('author')
    
    def perform_create(self, serializer):
        """Создание комментария через сервис"""
        task_id = self.request.data.get('task')
        comment = TaskCommentService.add_comment(
            user=self.request.user,
            task_id=task_id,
            content=serializer.validated_data['content']
        )
        serializer.instance = comment
