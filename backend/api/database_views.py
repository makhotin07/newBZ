"""
API контроллеры для управления базами данных (Clean Architecture)
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.apps.databases.serializers import (
    DatabaseListSerializer, DatabaseDetailSerializer, DatabasePropertySerializer, DatabaseRecordSerializer
)
from backend.apps.databases.models import Database, DatabaseProperty, DatabaseRecord
from backend.services.database_service import (
    DatabaseService, DatabasePropertyService, DatabaseRecordService
)


class DatabaseViewSet(viewsets.ModelViewSet):
    """ViewSet для баз данных"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DatabaseDetailSerializer
    
    def get_serializer_context(self):
        """Передача контекста в сериализатор"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """Получение queryset через сервис"""
        workspace_id = self.request.query_params.get('workspace')
        return DatabaseService.get_user_databases(
            user=self.request.user,
            workspace_id=int(workspace_id) if workspace_id else None
        )
    
    def perform_create(self, serializer):
        """Создание базы данных через сервис"""
        # Создаем базу данных через сериализатор
        database = serializer.save()
        
        # Обновляем instance для корректного возврата
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
    
    @action(detail=True, methods=['get'])
    def properties(self, request, pk=None):
        """Получение свойств базы данных"""
        properties = DatabasePropertyService.get_database_properties(
            database_id=pk,
            user=request.user
        )
        serializer = DatabasePropertySerializer(properties, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def records(self, request, pk=None):
        """Получение записей базы данных"""
        limit = int(request.query_params.get('limit', 100))
        records = DatabaseRecordService.get_database_records(
            database_id=pk,
            user=request.user,
            limit=limit
        )
        serializer = DatabaseRecordSerializer(records, many=True)
        return Response(serializer.data)


class DatabasePropertyViewSet(viewsets.ModelViewSet):
    """ViewSet для свойств базы данных"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DatabasePropertySerializer
    
    def get_queryset(self):
        """Получение свойств через сервис"""
        database_id = self.request.query_params.get('database')
        if not database_id:
            return []
        
        return DatabasePropertyService.get_database_properties(
            database_id=int(database_id),
            user=self.request.user
        )
    
    def perform_create(self, serializer):
        """Создание свойства через сервис"""
        database_id = self.request.data.get('database')
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


class DatabaseRecordViewSet(viewsets.ModelViewSet):
    """ViewSet для записей базы данных"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DatabaseRecordSerializer
    
    def get_queryset(self):
        """Получение записей через сервис"""
        database_id = self.request.query_params.get('database')
        if not database_id:
            return []
        
        limit = int(self.request.query_params.get('limit', 100))
        return DatabaseRecordService.get_database_records(
            database_id=int(database_id),
            user=self.request.user,
            limit=limit
        )
    
    def perform_create(self, serializer):
        """Создание записи через сервис"""
        database_id = self.request.data.get('database')
        properties = serializer.validated_data.get('properties', {})
        
        record = DatabaseRecordService.create_record(
            database_id=database_id,
            user=self.request.user,
            properties=properties
        )
        serializer.instance = record
    
    def perform_update(self, serializer):
        """Обновление записи через сервис"""
        properties = serializer.validated_data.get('properties', {})
        
        record = DatabaseRecordService.update_record(
            record_id=serializer.instance.id,
            user=self.request.user,
            properties=properties
        )
        serializer.instance = record
    
    def perform_destroy(self, instance):
        """Удаление записи через сервис"""
        DatabaseRecordService.delete_record(
            record_id=instance.id,
            user=self.request.user
        )
