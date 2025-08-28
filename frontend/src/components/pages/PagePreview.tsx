import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  XMarkIcon, 
  PencilIcon, 
  TrashIcon, 
  ShareIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Page } from '../../services/notesApi';
import { usePageContent } from '../../hooks/usePageContent';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PagePreviewProps {
  page: Page | null;
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onEdit?: (pageId: string) => void;
  onDelete?: (pageId: string) => void;
}

const PagePreview: React.FC<PagePreviewProps> = ({
  page,
  isOpen,
  onClose,
  workspaceId,
  onEdit,
  onDelete
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Получаем полный контент страницы
  const { data: fullPage, isLoading: isLoadingContent } = usePageContent(page?.id || null);
  
  // Свайп для закрытия на мобильных
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  if (!page || !isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 overlay-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Preview Panel */}
      <div 
        ref={previewRef}
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-gray-200 shadow-xl z-40 preview-mobile ${
          isOpen ? 'slide-in-right' : 'translate-x-full'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 content-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate preview-focus">
              {page.title}
            </h3>
            {/* Swipe indicator for mobile */}
            <div className="hidden sm:block mt-1 text-xs text-gray-500 preview-hover">
              Свайп влево для закрытия
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors preview-focus preview-hover"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 content-fade-in preview-scrollbar" style={{ animationDelay: '100ms' }}>
          {/* Cover Image */}
          {page.cover_image && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden preview-hover">
              <img 
                src={page.cover_image} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Icon */}
          {page.icon && (
            <div className="text-center preview-hover">
              <span className="text-6xl">{page.icon}</span>
            </div>
          )}

          {/* Meta Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 preview-hover">
              <CalendarIcon className="w-4 h-4" />
              <span>Создано: {formatDate(page.created_at)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 preview-hover">
              <CalendarIcon className="w-4 h-4" />
              <span>Обновлено: {formatDate(page.updated_at)}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 preview-hover">
              <UserIcon className="w-4 h-4" />
              <span>Автор: {page.author_name}</span>
            </div>

            {page.last_edited_by !== page.author && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 preview-hover">
                <UserIcon className="w-4 h-4" />
                <span>Редактировал: {page.last_edited_by_name}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {page.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 preview-hover">
                <TagIcon className="w-4 h-4" />
                <span>Теги:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {page.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 rounded-md text-xs font-medium preview-hover"
                    style={{ 
                      backgroundColor: tag.color + '20', 
                      color: tag.color 
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content Preview */}
          {page.content_text && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 preview-hover">Содержание:</h4>
              {isLoadingContent ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg preview-hover">
                  {fullPage?.content_text ? truncateText(fullPage.content_text) : truncateText(page.content_text)}
                </div>
              )}
            </div>
          )}

          {/* Subpages */}
          {page.children && page.children.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 preview-hover">
                Подстраницы ({page.children.length}):
              </h4>
              <div className="space-y-1">
                {page.children.slice(0, 5).map(child => (
                  <Link
                    key={child.id}
                    to={`/workspace/${workspaceId}/page/${child.id}`}
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate preview-focus preview-hover"
                  >
                    {child.title}
                  </Link>
                ))}
                {page.children.length > 5 && (
                  <span className="text-xs text-gray-500 preview-hover">
                    И еще {page.children.length - 5}...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2 content-fade-in" style={{ animationDelay: '200ms' }}>
          <Link
            to={`/workspace/${workspaceId}/page/${page.id}`}
            className="w-full btn-primary flex items-center justify-center space-x-2 preview-focus preview-hover"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Открыть для редактирования</span>
          </Link>

          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(page.id)}
                className="flex-1 btn-secondary flex items-center justify-center space-x-2 preview-focus preview-hover"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Редактировать</span>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(page.id)}
                className="flex-1 btn-danger flex items-center justify-center space-x-2 preview-focus preview-hover"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Удалить</span>
              </button>
            )}
          </div>

          <button className="w-full btn-outline flex items-center justify-center space-x-2 preview-focus preview-hover">
            <ShareIcon className="w-4 h-4" />
            <span>Поделиться</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default PagePreview;
