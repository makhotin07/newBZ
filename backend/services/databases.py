"""
Сервисный слой для управления базами данных
"""
from typing import List, Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db import transaction

from backend.apps.databases.models import Database, DatabaseProperty, DatabaseRecord, DatabaseView
from backend.apps.workspaces.models import Workspace
from backend.core.exceptions import BusinessLogicException, NotFoundException
from backend.apps.databases.models import DatabaseRecordRevision, DatabaseComment
from backend.apps.collaboration.models import CollaborationComment
from backend.core.formula_evaluator import FormulaEvaluator

User = get_user_model()


class DatabaseService:
    """Сервис для управления базами данных"""
    
    @staticmethod
    def get_user_databases(user: User, workspace_id: Optional[str] = None):
        """Получение баз данных пользователя"""
        queryset = Database.objects.filter(
            Q(workspace__owner=user) | Q(workspace__members__user=user)
        ).select_related('workspace', 'created_by').order_by('-updated_at')
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return queryset
    
    @staticmethod
    def get_database_by_id(database_id: str, user: User) -> Database:
        """Получение базы данных по ID с проверкой доступа"""
        database = Database.objects.filter(
            id=database_id
        ).filter(
            Q(workspace__owner=user) | Q(workspace__members__user=user)
        ).select_related('workspace', 'created_by').first()
        
        if not database:
            raise NotFoundException("База данных не найдена")
        
        return database
    
    @staticmethod
    def create_database(user: User, workspace_id: str, **data) -> Database:
        """Создание новой базы данных"""
        # Проверка доступа к workspace (owner или member)
        workspace_exists = Workspace.objects.filter(id=workspace_id).exists()
        
        if workspace_exists:
            owner_check = Workspace.objects.filter(id=workspace_id, owner=user).exists()
            member_check = Workspace.objects.filter(id=workspace_id, members__user=user).exists()
            
            if not (owner_check or member_check):
                raise BusinessLogicException("Нет доступа к рабочему пространству")
        else:
            raise BusinessLogicException("Рабочее пространство не найдено")
        
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
    
    @staticmethod
    def get_database_views(database_id: str, user: User):
        """Получение представлений базы данных"""
        database = DatabaseService.get_database_by_id(database_id, user)
        return database.views.all().order_by('name')
    
    @staticmethod
    def create_database_view(database_id: str, user: User, **data) -> DatabaseView:
        """Создание представления базы данных"""
        database = DatabaseService.get_database_by_id(database_id, user)
        
        view = DatabaseView.objects.create(
            database=database,
            created_by=user,
            **data
        )
        
        return view
    
    @staticmethod
    def update_database_view(view_id: str, user: User, **data) -> DatabaseView:
        """Обновление представления базы данных"""
        view = DatabaseView.objects.filter(
            id=view_id,
            database__workspace__members__user=user
        ).first()
        
        if not view:
            raise NotFoundException("Представление не найдено")
        
        for field, value in data.items():
            if hasattr(view, field):
                setattr(view, field, value)
        
        view.save()
        return view
    
    @staticmethod
    def delete_database_view(view_id: str, user: User) -> bool:
        """Удаление представления базы данных"""
        view = DatabaseView.objects.filter(
            id=view_id,
            database__workspace__members__user=user
        ).first()
        
        if not view:
            raise NotFoundException("Представление не найдено")
        
        view.delete()
        return True


class DatabasePropertyService:
    """Сервис для управления свойствами базы данных"""
    
    @staticmethod
    def get_database_properties(database_id: str, user: User):
        """Получение свойств базы данных"""
        database = DatabaseService.get_database_by_id(database_id, user)
        return database.properties.all().order_by('position')
    
    @staticmethod
    def create_property(database_id: str, user: User, **data) -> DatabaseProperty:
        """Создание свойства базы данных"""
        database = DatabaseService.get_database_by_id(database_id, user)
        
        property_obj = DatabaseProperty.objects.create(
            database=database,
            **data
        )
        
        return property_obj
    
    @staticmethod
    def update_property(property_id: str, user: User, **data) -> DatabaseProperty:
        """Обновление свойства базы данных"""
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
        """Удаление свойства базы данных"""
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
    def get_record_by_id(record_id: str, user: User) -> DatabaseRecord:
        """Получение записи по ID с проверкой доступа"""
        record = DatabaseRecord.objects.filter(
            id=record_id
        ).filter(
            Q(database__workspace__owner=user) | Q(database__workspace__members__user=user)
        ).select_related('database', 'created_by', 'last_edited_by').first()
        
        if not record:
            raise NotFoundException("Запись не найдена")
        
        return record
    
    @staticmethod
    def get_database_records(
        database_id: str, 
        user: User, 
        limit: int = 100,
        search: str = '',
        sort_by: str = 'updated_at',
        sort_order: str = 'desc'
    ):
        """Получение записей базы данных"""
        database = DatabaseService.get_database_by_id(database_id, user)
        
        queryset = database.records.all().select_related('created_by', 'last_edited_by')
        
        # Поиск по содержимому
        if search:
            queryset = queryset.filter(properties__icontains=search)
        
        # Сортировка
        if sort_by in ['created_at', 'updated_at']:
            if sort_order == 'desc':
                queryset = queryset.order_by(f'-{sort_by}')
            else:
                queryset = queryset.order_by(sort_by)
        else:
            queryset = queryset.order_by('-updated_at')
        
        return queryset
    
    @staticmethod
    def create_record(database_id: str, user: User, data: Dict[str, Any]) -> DatabaseRecord:
        """Создание записи с отслеживанием истории изменений"""
        database = DatabaseService.get_database_by_id(database_id, user)
        
        with transaction.atomic():
            # Вычисляем формулы
            computed_data = DatabaseRecordService._compute_formulas(data, database)
            
            record = DatabaseRecord.objects.create(
                database=database,
                properties=computed_data,
                created_by=user,
                last_edited_by=user
            )
            
            # Создаем запись в истории изменений
            DatabaseRecordRevision.objects.create(
                record=record,
                author=user,
                changes=computed_data,
                change_type='create'
            )
            
            return record
    
    @staticmethod
    def update_record(record_id: str, user: User, data: Dict[str, Any]) -> DatabaseRecord:
        """Обновление записи с отслеживанием истории изменений"""
        record = DatabaseRecordService.get_record_by_id(record_id, user)
        
        with transaction.atomic():
            old_data = record.properties.copy()
            
            # Вычисляем формулы для новых данных
            computed_data = DatabaseRecordService._compute_formulas(data, record.database)
            record.properties.update(computed_data)
            record.save()
            
            # Находим изменения
            changes = {}
            for key, new_value in computed_data.items():
                old_value = old_data.get(key)
                if old_value != new_value:
                    changes[key] = {'old': old_value, 'new': new_value}
            
            # Создаем запись в истории изменений если есть изменения
            if changes:
                DatabaseRecordRevision.objects.create(
                    record=record,
                    author=user,
                    changes=changes,
                    change_type='update'
                )
            
            return record
    
    @staticmethod
    def delete_record(record_id: str, user: User) -> bool:
        """Удаление записи с отслеживанием истории изменений"""
        record = DatabaseRecordService.get_record_by_id(record_id, user)
        
        with transaction.atomic():
            # Создаем запись в истории изменений
            DatabaseRecordRevision.objects.create(
                record=record,
                author=user,
                changes=record.properties,
                change_type='delete'
            )
            
            record.delete()
            return True
    
    @staticmethod
    def _compute_formulas(data: Dict[str, Any], database: Database) -> Dict[str, Any]:
        """Вычисляет значения формул в данных записи"""
        properties = list(database.properties.all())
        computed_data = data.copy()
        
        # Вычисляем формулы
        for prop in properties:
            if prop.type == 'formula':
                expression = prop.config.get('expression', '')
                if expression:
                    result = FormulaEvaluator.evaluate(expression, computed_data, properties)
                    computed_data[str(prop.id)] = result
        
        return computed_data
    
    @staticmethod
    def get_record_history(record_id: str, user: User) -> List[DatabaseRecordRevision]:
        """Получение истории изменений записи"""
        record = DatabaseRecordService.get_record_by_id(record_id, user)
        return record.database_record_revisions.all()


class DatabaseCommentService:
    """Сервис для управления комментариями к записям базы данных"""
    
    @staticmethod
    def get_record_comments(record_id: str, user: User) -> List[DatabaseComment]:
        """Получение комментариев к записи"""
        record = DatabaseRecordService.get_record_by_id(record_id, user)
        return record.collaboration_comments.filter(parent_comment__isnull=True).prefetch_related('replies')
    
    @staticmethod
    def create_comment(record_id: str, user: User, content: str, parent_comment_id: str = None) -> DatabaseComment:
        """Создание комментария к записи"""
        record = DatabaseRecordService.get_record_by_id(record_id, user)
        
        parent_comment = None
        if parent_comment_id:
            parent_comment = CollaborationComment.objects.filter(
                id=parent_comment_id,
                database_record=record
            ).first()
            if not parent_comment:
                raise NotFoundException("Родительский комментарий не найден")
        
        comment = CollaborationComment.objects.create(
            database_record=record,
            user=user,
            content=content,
            parent_comment=parent_comment,
            workspace=record.database.workspace
        )
        
        return comment
    
    @staticmethod
    def update_comment(comment_id: str, user: User, content: str) -> CollaborationComment:
        """Обновление комментария"""
        comment = CollaborationComment.objects.filter(
            id=comment_id,
            user=user
        ).first()
        
        if not comment:
            raise NotFoundException("Комментарий не найден")
        
        comment.content = content
        comment.save()
        
        return comment
    
    @staticmethod
    def delete_comment(comment_id: str, user: User) -> bool:
        """Удаление комментария"""
        comment = CollaborationComment.objects.filter(
            id=comment_id,
            user=user
        ).first()
        
        if not comment:
            raise NotFoundException("Комментарий не найден")
        
        comment.delete()
        return True
