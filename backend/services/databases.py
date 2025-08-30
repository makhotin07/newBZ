"""
Сервисный слой для управления базами данных
"""
from typing import List, Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.db.models import Q

from backend.apps.databases.models import Database, DatabaseProperty, DatabaseRecord
from backend.apps.workspaces.models import Workspace
from backend.core.exceptions import BusinessLogicException, NotFoundException

User = get_user_model()


class DatabaseService:
    """Сервис для управления базами данных"""
    
    @staticmethod
    def get_user_databases(user: User, workspace_id: Optional[str] = None) -> List[Database]:
        """Получение баз данных пользователя"""
        queryset = Database.objects.filter(
            workspace__members__user=user
        ).select_related('workspace', 'created_by').order_by('-updated_at')
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return list(queryset)
    
    @staticmethod
    def get_database_by_id(database_id: str, user: User) -> Database:
        """Получение базы данных по ID с проверкой доступа"""
        database = Database.objects.filter(
            id=database_id,
            workspace__members__user=user
        ).select_related('workspace', 'created_by').first()
        
        if not database:
            raise NotFoundException("База данных не найдена")
        
        return database
    
    @staticmethod
    def create_database(user: User, workspace_id: str, **data) -> Database:
        """Создание новой базы данных"""
        # Проверка доступа к workspace
        if not Workspace.objects.filter(
            id=workspace_id,
            members__user=user
        ).exists():
            raise BusinessLogicException("Нет доступа к рабочему пространству")
        
        database = Database.objects.create(
            workspace_id=workspace_id,
            created_by=user,
            **data
        )
        
        # Создаем свойство по умолчанию "Title"
        DatabaseProperty.objects.create(
            database=database,
            name='Title',
            type='text',
            position=1,
            config={'required': True}
        )
        
        return database
    
    @staticmethod
    def update_database(database_id: str, user: User, **data) -> Database:
        """Обновление базы данных"""
        database = DatabaseService.get_database_by_id(database_id, user)
        
        for field, value in data.items():
            if hasattr(database, field):
                setattr(database, field, value)
        
        database.save()
        return database
    
    @staticmethod
    def delete_database(database_id: str, user: User) -> bool:
        """Удаление базы данных"""
        database = DatabaseService.get_database_by_id(database_id, user)
        database.delete()
        return True


class DatabasePropertyService:
    """Сервис для управления свойствами базы данных"""
    
    @staticmethod
    def get_database_properties(database_id: str, user: User) -> List[DatabaseProperty]:
        """Получение свойств базы данных"""
        database = DatabaseService.get_database_by_id(database_id, user)
        return list(database.properties.all().order_by('position'))
    
    @staticmethod
    def create_property(database_id: str, user: User, **data) -> DatabaseProperty:
        """Создание нового свойства"""
        database = DatabaseService.get_database_by_id(database_id, user)
        
        property_obj = DatabaseProperty.objects.create(
            database=database,
            **data
        )
        
        return property_obj
    
    @staticmethod
    def update_property(property_id: str, user: User, **data) -> DatabaseProperty:
        """Обновление свойства"""
        property_obj = DatabaseProperty.objects.filter(
            id=property_id,
            database__workspace__members__user=user
        ).first()
        
        if not property_obj:
            raise NotFoundException("Свойство не найдено")
        
        for field, value in data.items():
            if hasattr(property_obj, field):
                setattr(property_obj, field, value)
        
        property_obj.save()
        return property_obj
    
    @staticmethod
    def delete_property(property_id: str, user: User) -> bool:
        """Удаление свойства"""
        property_obj = DatabaseProperty.objects.filter(
            id=property_id,
            database__workspace__members__user=user
        ).first()
        
        if not property_obj:
            raise NotFoundException("Свойство не найдено")
        
        property_obj.delete()
        return True


class DatabaseRecordService:
    """Сервис для управления записями базы данных"""
    
    @staticmethod
    def get_database_records(database_id: str, user: User, limit: int = 100) -> List[DatabaseRecord]:
        """Получение записей базы данных"""
        database = DatabaseService.get_database_by_id(database_id, user)
        return list(database.records.all().order_by('-updated_at')[:limit])
    
    @staticmethod
    def create_record(database_id: str, user: User, properties: Dict[str, Any]) -> DatabaseRecord:
        """Создание новой записи"""
        database = DatabaseService.get_database_by_id(database_id, user)
        
        record = DatabaseRecord.objects.create(
            database=database,
            properties=properties,
            created_by=user,
            last_edited_by=user
        )
        
        return record
    
    @staticmethod
    def update_record(record_id: str, user: User, properties: Dict[str, Any]) -> DatabaseRecord:
        """Обновление записи"""
        record = DatabaseRecord.objects.filter(
            id=record_id,
            database__workspace__members__user=user
        ).first()
        
        if not record:
            raise NotFoundException("Запись не найдена")
        
        record.properties = properties
        record.last_edited_by = user
        record.save()
        
        return record
    
    @staticmethod
    def delete_record(record_id: str, user: User) -> bool:
        """Удаление записи"""
        record = DatabaseRecord.objects.filter(
            id=record_id,
            database__workspace__members__user=user
        ).first()
        
        if not record:
            raise NotFoundException("Запись не найдена")
        
        record.delete()
        return True
