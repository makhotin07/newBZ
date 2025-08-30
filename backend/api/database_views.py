"""
API контроллеры для управления базами данных (Clean Architecture)
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.apps.databases.serializers import (
    DatabaseDetailSerializer, DatabasePropertySerializer, DatabaseRecordSerializer
)
from backend.services.databases import (
    DatabaseService, DatabasePropertyService, DatabaseRecordService
)


class DatabaseViewSet(viewsets.ModelViewSet):
    """ViewSet для баз данных"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DatabaseDetailSerializer
    
    def get_queryset(self):
        """Получение queryset через сервис"""
        workspace_id = self.request.query_params.get('workspace')
        return DatabaseService.get_user_databases(
            user=self.request.user,
            workspace_id=workspace_id
        )
    
    def get_object(self):
        """Получение объекта по ID с проверкой доступа"""
        pk = self.kwargs.get('pk')
        return DatabaseService.get_database_by_id(pk, self.request.user)
    
    def perform_create(self, serializer):
        """Создание базы данных через сервис"""
        workspace_id = self.request.data.get('workspace')
        database = DatabaseService.create_database(
            user=self.request.user,
            workspace_id=workspace_id,
            **serializer.validated_data
        )
        serializer.instance = database
    
    def perform_update(self, serializer):
        """Обновление базы данных через сервис"""
        database = DatabaseService.update_database(
            database_id=serializer.instance.id,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = database
    
    def perform_destroy(self, instance):
        """Удаление базы данных через сервис"""
        DatabaseService.delete_database(
            database_id=instance.id,
            user=self.request.user
        )
    
    @action(detail=True, methods=['get', 'post'])
    def properties(self, request, pk=None):
        """Управление свойствами базы данных"""
        if request.method == 'GET':
            properties = DatabasePropertyService.get_database_properties(
                database_id=pk,
                user=request.user
            )
            serializer = DatabasePropertySerializer(properties, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = DatabasePropertySerializer(data=request.data)
            if serializer.is_valid():
                property_obj = DatabasePropertyService.create_property(
                    database_id=pk,
                    user=request.user,
                    **serializer.validated_data
                )
                serializer = DatabasePropertySerializer(property_obj)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'post'])
    def records(self, request, pk=None):
        """Управление записями базы данных"""
        if request.method == 'GET':
            limit = int(request.query_params.get('limit', 100))
            records = DatabaseRecordService.get_database_records(
                database_id=pk,
                user=request.user,
                limit=limit
            )
            serializer = DatabaseRecordSerializer(records, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = DatabaseRecordSerializer(data=request.data)
            if serializer.is_valid():
                record = DatabaseRecordService.create_record(
                    database_id=pk,
                    user=request.user,
                    properties=serializer.validated_data.get('properties', {})
                )
                serializer = DatabaseRecordSerializer(record)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def bulk(self, request, pk=None):
        """Массовые операции с записями"""
        # Заглушка для bulk операций
        return Response({'message': 'Bulk operation completed'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get', 'post'])
    def views(self, request, pk=None):
        """Управление представлениями базы данных"""
        if request.method == 'GET':
            # Заглушка для views
            return Response([])
        
        elif request.method == 'POST':
            # Заглушка для создания view
            return Response({'id': 1, 'name': request.data.get('name')}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """Экспорт базы данных"""
        format_type = request.query_params.get('format', 'json')
        # Заглушка для экспорта
        return Response({'message': f'Export in {format_type} format'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def import_data(self, request, pk=None):
        """Импорт данных в базу данных"""
        # Заглушка для импорта
        return Response({'imported_count': 0, 'message': 'Import completed'}, status=status.HTTP_200_OK)


class DatabasePropertyViewSet(viewsets.ModelViewSet):
    """ViewSet для свойств базы данных"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DatabasePropertySerializer
    
    def get_queryset(self):
        """Получение свойств через сервис"""
        database_id = self.kwargs.get('database_pk')
        if not database_id:
            return []
        
        return DatabasePropertyService.get_database_properties(
            database_id=database_id,
            user=self.request.user
        )
    
    def perform_create(self, serializer):
        """Создание свойства через сервис"""
        database_id = self.kwargs.get('database_pk')
        property_obj = DatabasePropertyService.create_property(
            database_id=database_id,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = property_obj
    
    def perform_update(self, serializer):
        """Обновление свойства через сервис"""
        property_obj = DatabasePropertyService.update_property(
            property_id=serializer.instance.id,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = property_obj
    
    def perform_destroy(self, instance):
        """Удаление свойства через сервис"""
        DatabasePropertyService.delete_property(
            property_id=instance.id,
            user=self.request.user
        )


class DatabaseRecordViewSet(viewsets.ModelViewSet):
    """ViewSet для записей базы данных"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DatabaseRecordSerializer
    
    def get_queryset(self):
        """Получение записей через сервис"""
        database_id = self.kwargs.get('database_pk')
        if not database_id:
            return []
        
        limit = int(self.request.query_params.get('limit', 100))
        return DatabaseRecordService.get_database_records(
            database_id=database_id,
            user=self.request.user,
            limit=limit
        )
    
    def perform_create(self, serializer):
        """Создание записи через сервис"""
        database_id = self.kwargs.get('database_pk')
        record = DatabaseRecordService.create_record(
            database_id=database_id,
            user=self.request.user,
            properties=serializer.validated_data.get('properties', {})
        )
        serializer.instance = record
    
    def perform_update(self, serializer):
        """Обновление записи через сервис"""
        record = DatabaseRecordService.update_record(
            record_id=serializer.instance.id,
            user=self.request.user,
            properties=serializer.validated_data.get('properties', {})
        )
        serializer.instance = record
    
    def perform_destroy(self, instance):
        """Удаление записи через сервис"""
        DatabaseRecordService.delete_record(
            record_id=instance.id,
            user=self.request.user
        )
