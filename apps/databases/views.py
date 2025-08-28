from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from datetime import datetime

from .models import Database, DatabaseProperty, DatabaseRecord, DatabaseView, SelectOption
from .serializers import (
    DatabaseListSerializer, DatabaseDetailSerializer, DatabasePropertySerializer,
    DatabaseRecordSerializer, DatabaseViewSerializer, SelectOptionSerializer,
    CreateSelectPropertySerializer, BulkUpdateRecordsSerializer
)
from apps.workspaces.models import Workspace


class DatabaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return DatabaseDetailSerializer
        return DatabaseListSerializer
    
    def get_queryset(self):
        # Get databases from user's workspaces
        user_workspaces = Workspace.objects.filter(
            members__user=self.request.user
        ).values_list('id', flat=True)
        
        queryset = Database.objects.filter(
            workspace__in=user_workspaces
        ).select_related('workspace', 'created_by').order_by('-updated_at')
        
        # Filter by workspace if specified
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def records(self, request, pk=None):
        database = self.get_object()
        records = database.records.all().order_by('-updated_at')
        
        # Apply filters
        filters = self.parse_filters(request.query_params.get('filters', ''))
        if filters:
            records = self.apply_filters(records, filters)
        
        # Apply sorting
        sorts = self.parse_sorts(request.query_params.get('sorts', ''))
        if sorts:
            records = self.apply_sorts(records, sorts)
        
        # Pagination
        page = self.paginate_queryset(records)
        if page is not None:
            serializer = DatabaseRecordSerializer(
                page, many=True, 
                context={'request': request, 'database_id': database.id}
            )
            return self.get_paginated_response(serializer.data)
        
        serializer = DatabaseRecordSerializer(
            records, many=True,
            context={'request': request, 'database_id': database.id}
        )
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def bulk_update(self, request, pk=None):
        database = self.get_object()
        serializer = BulkUpdateRecordsSerializer(data=request.data)
        
        if serializer.is_valid():
            record_ids = serializer.validated_data['record_ids']
            updates = serializer.validated_data['updates']
            operation = serializer.validated_data['operation']
            
            records = database.records.filter(id__in=record_ids)
            
            if operation == 'delete':
                count = records.count()
                records.delete()
                return Response({'message': f'Deleted {count} records'})
            
            elif operation == 'update':
                updated_count = 0
                for record in records:
                    for prop_name, value in updates.items():
                        if prop_name in record.properties:
                            record.properties[prop_name] = value
                    record.last_edited_by = request.user
                    record.save()
                    updated_count += 1
                
                return Response({'message': f'Updated {updated_count} records'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def create_record(self, request, pk=None):
        database = self.get_object()
        serializer = DatabaseRecordSerializer(
            data=request.data,
            context={'request': request, 'database_id': database.id}
        )
        
        if serializer.is_valid():
            record = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def parse_filters(self, filters_str):
        """Parse filter string into filter objects"""
        if not filters_str:
            return []
        
        try:
            import json
            return json.loads(filters_str)
        except:
            return []
    
    def apply_filters(self, queryset, filters):
        """Apply filters to queryset"""
        for filter_obj in filters:
            prop_name = filter_obj.get('property')
            operator = filter_obj.get('operator')
            value = filter_obj.get('value')
            
            if operator == 'equals':
                queryset = queryset.filter(properties__contains={prop_name: value})
            elif operator == 'not_equals':
                queryset = queryset.exclude(properties__contains={prop_name: value})
            elif operator == 'contains':
                queryset = queryset.filter(properties__icontains=f'"{prop_name}": "{value}"')
            elif operator == 'is_empty':
                queryset = queryset.filter(
                    Q(properties__isnull=True) |
                    Q(properties__exact={}) |
                    Q(**{f'properties__{prop_name}__isnull': True}) |
                    Q(**{f'properties__{prop_name}__exact': ''})
                )
            elif operator == 'is_not_empty':
                queryset = queryset.exclude(
                    Q(properties__isnull=True) |
                    Q(properties__exact={}) |
                    Q(**{f'properties__{prop_name}__isnull': True}) |
                    Q(**{f'properties__{prop_name}__exact': ''})
                )
        
        return queryset
    
    def parse_sorts(self, sorts_str):
        """Parse sort string into sort objects"""
        if not sorts_str:
            return []
        
        try:
            import json
            return json.loads(sorts_str)
        except:
            return []
    
    def apply_sorts(self, queryset, sorts):
        """Apply sorting to queryset"""
        order_fields = []
        
        for sort_obj in sorts:
            prop_name = sort_obj.get('property')
            direction = sort_obj.get('direction', 'asc')
            
            if prop_name == 'created_at':
                field = 'created_at'
            elif prop_name == 'updated_at':
                field = 'updated_at'
            else:
                # For JSON fields, we'll order by the raw JSON
                # This is a simplified approach - more complex sorting would require raw SQL
                field = 'properties'
            
            if direction == 'desc':
                field = f'-{field}'
            
            order_fields.append(field)
        
        if order_fields:
            return queryset.order_by(*order_fields)
        
        return queryset


class DatabaseRecordViewSet(viewsets.ModelViewSet):
    serializer_class = DatabaseRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Get records from user's workspaces
        user_workspaces = Workspace.objects.filter(
            members__user=self.request.user
        ).values_list('id', flat=True)
        
        return DatabaseRecord.objects.filter(
            database__workspace__in=user_workspaces
        ).select_related('database', 'created_by', 'last_edited_by').order_by('-updated_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if hasattr(self, 'kwargs') and 'database_id' in self.kwargs:
            context['database_id'] = self.kwargs['database_id']
        elif self.request.data.get('database'):
            context['database_id'] = self.request.data['database']
        return context


class DatabasePropertyListView(ListCreateAPIView):
    serializer_class = DatabasePropertySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        database_id = self.kwargs['database_id']
        database = get_object_or_404(Database, id=database_id)
        return database.properties.all().order_by('position')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['database_id'] = self.kwargs['database_id']
        return context
    
    def post(self, request, *args, **kwargs):
        # Handle special case for select/multi-select properties
        if request.data.get('type') in ['select', 'multi_select']:
            serializer = CreateSelectPropertySerializer(data=request.data)
            if serializer.is_valid():
                database_id = self.kwargs['database_id']
                database = get_object_or_404(Database, id=database_id)
                
                # Create property
                property_obj = DatabaseProperty.objects.create(
                    database=database,
                    **{k: v for k, v in serializer.validated_data.items() if k != 'options'}
                )
                
                # Create options
                options_data = serializer.validated_data.get('options', [])
                for i, option_data in enumerate(options_data):
                    SelectOption.objects.create(
                        property=property_obj,
                        name=option_data['name'],
                        color=option_data.get('color', '#6B7280'),
                        position=i
                    )
                
                response_serializer = DatabasePropertySerializer(property_obj)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return super().post(request, *args, **kwargs)


class DatabasePropertyDetailView(RetrieveUpdateDestroyAPIView):
    queryset = DatabaseProperty.objects.all()
    serializer_class = DatabasePropertySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'property_id'
    
    def perform_destroy(self, instance):
        # Remove property from all records
        for record in instance.database.records.all():
            if instance.name in record.properties:
                del record.properties[instance.name]
                record.save()
        
        super().perform_destroy(instance)


class DatabaseViewListView(ListCreateAPIView):
    serializer_class = DatabaseViewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        database_id = self.kwargs['database_id']
        database = get_object_or_404(Database, id=database_id)
        return database.views.all().order_by('name')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['database_id'] = self.kwargs['database_id']
        return context


class DatabaseViewDetailView(RetrieveUpdateDestroyAPIView):
    queryset = DatabaseView.objects.all()
    serializer_class = DatabaseViewSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'view_id'


class DatabaseRecordListView(ListCreateAPIView):
    serializer_class = DatabaseRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        database_id = self.kwargs['database_id']
        database = get_object_or_404(Database, id=database_id)
        return database.records.all().order_by('-updated_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['database_id'] = self.kwargs['database_id']
        return context
    
    def perform_create(self, serializer):
        database_id = self.kwargs['database_id']
        database = get_object_or_404(Database, id=database_id)
        serializer.save(
            database=database,
            created_by=self.request.user,
            last_edited_by=self.request.user
        )
