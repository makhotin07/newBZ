"""
Сервисный слой для управления заметками
"""
from typing import List, Optional
from django.contrib.auth import get_user_model
from django.db.models import Q

from backend.apps.notes.models import Tag, Page, Block, PageVersion, Comment
from backend.apps.workspaces.models import Workspace
from backend.core.exceptions import BusinessLogicException, NotFoundException

User = get_user_model()


class PageService:
    """Сервис для управления страницами"""
    
    @staticmethod
    def get_user_pages(
        user: User,
        workspace_id: Optional[int] = None,
        parent_id: Optional[int] = None,
        show_archived: bool = False,
        show_templates: bool = False
    ) -> List[Page]:
        """Получение страниц пользователя с фильтрацией"""
        user_workspaces = Workspace.objects.filter(
            members__user=user
        ).values_list('id', flat=True)
        
        queryset = Page.objects.filter(
            workspace__in=user_workspaces,
            is_deleted=False
        ).select_related('author', 'last_edited_by', 'workspace').prefetch_related('tags')
        
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        if parent_id:
            if parent_id == 'null':
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
        
        if not show_archived:
            queryset = queryset.filter(is_archived=False)
        
        if not show_templates:
            queryset = queryset.filter(is_template=False)
        
        return list(queryset.order_by('position', '-updated_at'))
    
    @staticmethod
    def get_page_by_id(page_id: str, user: User) -> Page:
        """Получение страницы по ID с проверкой доступа"""
        user_workspaces = Workspace.objects.filter(
            members__user=user
        ).values_list('id', flat=True)
        
        page = Page.objects.filter(
            id=page_id,
            workspace__in=user_workspaces,
            is_deleted=False
        ).select_related('author', 'last_edited_by', 'workspace').prefetch_related('tags').first()
        
        if not page:
            raise NotFoundException("Страница не найдена")
        
        return page
    
    @staticmethod
    def create_page(user: User, **data) -> Page:
        """Создание новой страницы с версией"""
        # Устанавливаем обязательные поля пользователя
        data['author'] = user
        data['last_edited_by'] = user
        
        page = Page.objects.create(**data)
        
        # Создание начальной версии
        PageVersion.objects.create(
            page=page,
            version_number=1,
            title=page.title,
            content=page.content,
            content_text=page.content_text,
            created_by=user
        )
        
        return page
    
    @staticmethod
    def update_page(page_id: str, user: User, **data) -> Page:
        """Обновление страницы с созданием новой версии"""
        page = Page.objects.filter(
            id=page_id,
            workspace__members__user=user
        ).first()
        
        if not page:
            raise NotFoundException("Страница не найдена")
        
        # Обновление страницы
        for field, value in data.items():
            setattr(page, field, value)
        
        # Обновляем поле последнего редактирования
        page.last_edited_by = user
        page.save()
        
        # Создание новой версии
        last_version = page.versions.first()
        new_version_number = (last_version.version_number + 1) if last_version else 1
        
        PageVersion.objects.create(
            page=page,
            version_number=new_version_number,
            title=page.title,
            content=page.content,
            content_text=page.content_text,
            created_by=user
        )
        
        return page
    
    @staticmethod
    def archive_page(page_id: str, user: User) -> Page:
        """Архивирование страницы"""
        page = Page.objects.filter(
            id=page_id,
            workspace__members__user=user
        ).first()
        
        if not page:
            raise NotFoundException("Страница не найдена")
        
        page.is_archived = True
        page.save()
        return page
    
    @staticmethod
    def get_page_blocks(page_id: int, user: User) -> List[Block]:
        """Получение блоков страницы"""
        page = Page.objects.filter(
            id=page_id,
            workspace__members__user=user
        ).first()
        
        if not page:
            return []
        
        return list(Block.objects.filter(page=page).order_by('position'))
    
    @staticmethod
    def create_block(user: User, page_id: int, **data) -> Block:
        """Создание блока страницы"""
        page = Page.objects.filter(
            id=page_id,
            workspace__members__user=user
        ).first()
        
        if not page:
            raise NotFoundException("Страница не найдена")
        
        block = Block.objects.create(
            page=page,
            **data
        )
        return block
    
    @staticmethod
    def update_block(block_id: int, user: User, **data) -> Block:
        """Обновление блока"""
        block = Block.objects.filter(
            id=block_id,
            page__workspace__members__user=user
        ).first()
        
        if not block:
            raise NotFoundException("Блок не найден")
        
        for field, value in data.items():
            setattr(block, field, value)
        
        block.save()
        return block
    
    @staticmethod
    def delete_block(block_id: int, user: User) -> None:
        """Удаление блока"""
        block = Block.objects.filter(
            id=block_id,
            page__workspace__members__user=user
        ).first()
        
        if not block:
            raise NotFoundException("Блок не найден")
        
        block.delete()
    
    @staticmethod
    def get_all_blocks(user: User) -> List[Block]:
        """Получение всех блоков пользователя"""
        user_workspaces = Workspace.objects.filter(
            members__user=user
        ).values_list('id', flat=True)
        
        return list(Block.objects.filter(
            page__workspace__in=user_workspaces
        ).select_related('page'))


class TagService:
    """Сервис для управления тегами"""
    
    @staticmethod
    def get_all_tags() -> List[Tag]:
        """Получение всех тегов"""
        return list(Tag.objects.all().order_by('name'))
    
    @staticmethod
    def create_tag(name: str, color: str = "#000000") -> Tag:
        """Создание нового тега"""
        tag, created = Tag.objects.get_or_create(
            name=name,
            defaults={'color': color}
        )
        return tag


class CommentService:
    """Сервис для управления комментариями"""
    
    @staticmethod
    def get_page_comments(page_id: int, user: User) -> List[Comment]:
        """Получение комментариев к странице"""
        # Проверка доступа к странице
        page = Page.objects.filter(
            id=page_id,
            workspace__members__user=user
        ).first()
        
        if not page:
            return []
        
        return list(Comment.objects.filter(page=page).select_related('author'))
    
    @staticmethod
    def add_comment(user: User, page_id: int, content: str) -> Comment:
        """Добавление комментария к странице"""
        page = Page.objects.filter(
            id=page_id,
            workspace__members__user=user
        ).first()
        
        if not page:
            raise NotFoundException("Страница не найдена")
        
        comment = Comment.objects.create(
            page=page,
            author=user,
            content=content
        )
        return comment
    
    @staticmethod
    def update_comment(comment_id: int, user: User, **data) -> Comment:
        """Обновление комментария"""
        comment = Comment.objects.filter(
            id=comment_id,
            author=user
        ).first()
        
        if not comment:
            raise NotFoundException("Комментарий не найден")
        
        for field, value in data.items():
            if hasattr(comment, field):
                setattr(comment, field, value)
        
        comment.save()
        return comment
    
    @staticmethod
    def delete_comment(comment_id: int, user: User) -> None:
        """Удаление комментария"""
        comment = Comment.objects.filter(
            id=comment_id,
            author=user
        ).first()
        
        if not comment:
            raise NotFoundException("Комментарий не найден")
        
        comment.delete()
    
    @staticmethod
    def resolve_comment(comment_id: int, user: User, resolved: bool) -> Comment:
        """Разрешение комментария"""
        comment = Comment.objects.filter(
            id=comment_id,
            author=user
        ).first()
        
        if not comment:
            raise NotFoundException("Комментарий не найден")
        
        comment.is_resolved = resolved
        comment.save()
        return comment
