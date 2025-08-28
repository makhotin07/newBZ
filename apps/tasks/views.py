from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import TaskBoard, TaskColumn, Task, TaskComment, TaskAttachment, TaskActivity
from .serializers import (
    TaskBoardListSerializer, TaskBoardDetailSerializer, TaskColumnSerializer,
    TaskListSerializer, TaskDetailSerializer, TaskCommentSerializer,
    TaskAttachmentSerializer, TaskActivitySerializer
)
from apps.workspaces.models import Workspace


class TaskBoardViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return TaskBoardDetailSerializer
        return TaskBoardListSerializer
    
    def get_queryset(self):
        # Get boards from user's workspaces
        user_workspaces = Workspace.objects.filter(
            members__user=self.request.user
        ).values_list('id', flat=True)
        
        queryset = TaskBoard.objects.filter(
            workspace__in=user_workspaces
        ).select_related('workspace', 'created_by').order_by('-updated_at')
        
        # Filter by workspace if specified
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        board = self.get_object()
        tasks = board.tasks.all().select_related('created_by', 'column').prefetch_related('assignees', 'tags')
        
        # Filter by column if specified
        column_id = request.query_params.get('column')
        if column_id:
            tasks = tasks.filter(column_id=column_id)
        
        # Filter by assignee
        assignee_id = request.query_params.get('assignee')
        if assignee_id:
            tasks = tasks.filter(assignees__id=assignee_id)
        
        # Filter by status
        task_status = request.query_params.get('status')
        if task_status:
            tasks = tasks.filter(status=task_status)
        
        serializer = TaskListSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        print(self.action)
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return TaskDetailSerializer
        return TaskListSerializer
    
    def get_queryset(self):
        # Get tasks from user's workspaces
        user_workspaces = Workspace.objects.filter(
            members__user=self.request.user
        ).values_list('id', flat=True)
        
        queryset = Task.objects.filter(
            board__workspace__in=user_workspaces
        ).select_related('board', 'column', 'created_by').prefetch_related('assignees', 'tags')
        
        # Filter by board
        board_id = self.request.query_params.get('board')
        if board_id:
            queryset = queryset.filter(board_id=board_id)
        
        # Filter by assigned user
        assigned_to_me = self.request.query_params.get('assigned_to_me', 'false').lower() == 'true'
        if assigned_to_me:
            queryset = queryset.filter(assignees=self.request.user)
        
        # Filter by status
        task_status = self.request.query_params.get('status')
        if task_status:
            queryset = queryset.filter(status=task_status)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by due date
        overdue = self.request.query_params.get('overdue', 'false').lower() == 'true'
        if overdue:
            from django.utils import timezone
            queryset = queryset.filter(
                due_date__lt=timezone.now(),
                status__in=['todo', 'in_progress', 'review']
            )
        
        return queryset.order_by('position', '-created_at')
    
    def create(self, request, *args, **kwargs):
        # Get board_id from request data
        board_id = request.data.get('board_id')
        if not board_id:
            return Response(
                {'error': 'board_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has access to the board
        try:
            board = TaskBoard.objects.get(
                id=board_id,
                workspace__members__user=request.user
            )
        except TaskBoard.DoesNotExist:
            return Response(
                {'error': 'Board not found or access denied'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Set the board for the task
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get column if specified
        column_id = request.data.get('column')
        if column_id:
            try:
                column = TaskColumn.objects.get(id=column_id, board=board)
            except TaskColumn.DoesNotExist:
                return Response(
                    {'error': 'Invalid column'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Use first column if not specified
            column = board.columns.first()
            if not column:
                return Response(
                    {'error': 'No columns found in board'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer.save(board=board, column=column, created_by=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        task = self.get_object()
        column_id = request.data.get('column_id')
        position = request.data.get('position', 0)
        
        if not column_id:
            return Response(
                {'error': 'column_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_column = TaskColumn.objects.get(id=column_id, board=task.board)
        except TaskColumn.DoesNotExist:
            return Response(
                {'error': 'Invalid column'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_column = task.column
        task.column = new_column
        task.position = position
        task.save()
        
        # Update status based on column (you can customize this logic)
        status_mapping = {
            'To Do': 'todo',
            'In Progress': 'in_progress', 
            'Review': 'review',
            'Done': 'done'
        }
        new_status = status_mapping.get(new_column.title.strip(), task.status)
        if new_status != task.status:
            task.status = new_status
            task.save()
        
        # Log activity
        TaskActivity.objects.create(
            task=task,
            user=request.user,
            activity_type='moved',
            description=f'Moved task from "{old_column.title}" to "{new_column.title}"'
        )
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class TaskColumnListView(ListCreateAPIView):
    serializer_class = TaskColumnSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        board_id = self.kwargs['board_id']
        board = get_object_or_404(TaskBoard, id=board_id)
        return board.columns.all().order_by('position')
    
    def perform_create(self, serializer):
        board_id = self.kwargs['board_id']
        board = get_object_or_404(TaskBoard, id=board_id)
        serializer.save(board=board)


class TaskColumnDetailView(RetrieveUpdateDestroyAPIView):
    queryset = TaskColumn.objects.all()
    serializer_class = TaskColumnSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'column_id'
    
    def perform_destroy(self, instance):
        # Move tasks to first column before deleting
        first_column = instance.board.columns.exclude(id=instance.id).first()
        if first_column:
            instance.tasks.update(column=first_column)
        super().perform_destroy(instance)


class TaskCommentListView(ListCreateAPIView):
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs['task_id']
        task = get_object_or_404(Task, id=task_id)
        return task.comments.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        task_id = self.kwargs['task_id']
        task = get_object_or_404(Task, id=task_id)
        serializer.save(task=task)


class TaskActivityListView(ListCreateAPIView):
    serializer_class = TaskActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs['task_id']
        task = get_object_or_404(Task, id=task_id)
        return task.activities.all().order_by('-created_at')
    
    def get(self, request, *args, **kwargs):
        # Only allow GET, not POST for this view
        return super().get(request, *args, **kwargs)
