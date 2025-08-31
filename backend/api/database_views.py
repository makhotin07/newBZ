"""
API контроллеры для управления базами данных (Clean Architecture)
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from backend.apps.databases.models import Database, DatabaseProperty, DatabaseRecord, DatabaseView
from backend.apps.databases.serializers import (
    DatabaseDetailSerializer, DatabasePropertySerializer, 
    DatabaseRecordSerializer, DatabaseViewSerializer
)
from backend.services.databases import (
    DatabaseService, DatabasePropertyService, DatabaseRecordService,
    DatabaseCommentService
)
from backend.apps.databases.models import DatabaseComment, DatabaseRecordRevision
from backend.apps.databases.serializers import DatabaseCommentSerializer, DatabaseRecordRevisionSerializer


class DatabaseViewSet(viewsets.ModelViewSet):
    serializer_class = DatabaseDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.request.query_params.get('workspace_id')
        return DatabaseService.get_user_databases(self.request.user, workspace_id)

    def create(self, request):
        workspace_id = request.data.get('workspace') or request.data.get('workspace_id')
        data = {k: v for k, v in request.data.items() if k not in ['workspace', 'workspace_id']}
        
        database = DatabaseService.create_database(
            workspace_id=workspace_id,
            user=request.user,
            **data
        )
        
        return Response(
            DatabaseDetailSerializer(database).data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, pk=None):
        database = DatabaseService.update_database(
            database_id=pk,
            user=request.user,
            **request.data
        )
        
        return Response(DatabaseDetailSerializer(database).data)

    def destroy(self, request, pk=None):
        DatabaseService.delete_database(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def properties(self, request, pk=None):
        properties = DatabasePropertyService.get_database_properties(pk, request.user)
        return Response(DatabasePropertySerializer(properties, many=True).data)

    @action(detail=True, methods=['post'])
    def create_property(self, request, pk=None):
        property_obj = DatabasePropertyService.create_property(
            database_id=pk,
            user=request.user,
            **request.data
        )
        
        return Response(
            DatabasePropertySerializer(property_obj).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def records(self, request, pk=None):
        filters = request.query_params.dict()
        records = DatabaseRecordService.get_database_records(pk, request.user, filters)
        return Response(DatabaseRecordSerializer(records, many=True).data)

    @action(detail=True, methods=['post'])
    def create_record(self, request, pk=None):
        record = DatabaseRecordService.create_record(
            database_id=pk,
            user=request.user,
            data=request.data
        )
        
        return Response(
            DatabaseRecordSerializer(record).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def views(self, request, pk=None):
        views = DatabaseService.get_database_views(pk, request.user)
        return Response(DatabaseViewSerializer(views, many=True).data)

    @action(detail=True, methods=['post'])
    def create_view(self, request, pk=None):
        view = DatabaseService.create_database_view(
            database_id=pk,
            user=request.user,
            **request.data
        )
        
        return Response(
            DatabaseViewSerializer(view).data,
            status=status.HTTP_201_CREATED
        )


class DatabaseRecordViewSet(viewsets.ModelViewSet):
    serializer_class = DatabaseRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DatabaseRecordService.get_user_records(self.request.user)

    def update(self, request, pk=None):
        record = DatabaseRecordService.update_record(
            record_id=pk,
            user=request.user,
            data=request.data
        )
        
        return Response(DatabaseRecordSerializer(record).data)

    def destroy(self, request, pk=None):
        DatabaseRecordService.delete_record(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Получение истории изменений записи"""
        revisions = DatabaseRecordService.get_record_history(pk, request.user)
        return Response(DatabaseRecordRevisionSerializer(revisions, many=True).data)
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Получение комментариев к записи"""
        comments = DatabaseCommentService.get_record_comments(pk, request.user)
        return Response(DatabaseCommentSerializer(comments, many=True).data)
    
    @action(detail=True, methods=['post'])
    def create_comment(self, request, pk=None):
        """Создание комментария к записи"""
        comment = DatabaseCommentService.create_comment(
            record_id=pk,
            user=request.user,
            content=request.data.get('content'),
            parent_comment_id=request.data.get('parent_comment_id')
        )
        
        return Response(
            DatabaseCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED
        )


class DatabaseCommentViewSet(viewsets.ModelViewSet):
    serializer_class = DatabaseCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DatabaseComment.objects.filter(
            record__database__workspace__members__user=self.request.user
        )
    
    def update(self, request, pk=None):
        """Обновление комментария"""
        comment = DatabaseCommentService.update_comment(
            comment_id=pk,
            user=request.user,
            content=request.data.get('content')
        )
        
        return Response(DatabaseCommentSerializer(comment).data)
    
    def destroy(self, request, pk=None):
        """Удаление комментария"""
        DatabaseCommentService.delete_comment(pk, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
