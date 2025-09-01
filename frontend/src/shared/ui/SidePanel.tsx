import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  position?: 'left' | 'right';
  className?: string;
}

/**
 * Боковая панель с возможностью изменения размера и поддержкой a11y
 */
const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  children,
  title,
  width = 400,
  minWidth = 300,
  maxWidth = 600,
  position = 'right',
  className = ''
}) => {
  const [currentWidth, setCurrentWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Обработчик клавиши Escape для закрытия панели
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Обработчик изменения размера
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizing) return;

    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;

    let newWidth: number;
    if (position === 'right') {
      newWidth = window.innerWidth - event.clientX;
    } else {
      newWidth = event.clientX - rect.left;
    }

    // Ограничиваем размер
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setCurrentWidth(newWidth);
  }, [isResizing, position, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Эффекты для обработки событий мыши и клавиатуры
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Фокус на панель при открытии
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // Блокировка скролла body при открытой панели
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay для закрытия по клику вне панели */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Панель */}
      <div
        ref={panelRef}
        className={`
          fixed top-0 h-full bg-white shadow-xl z-50
          flex flex-col
          ${position === 'right' ? 'right-0' : 'left-0'}
          ${className}
        `}
        style={{ width: currentWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'side-panel-title' : undefined}
        tabIndex={-1}
      >
        {/* Заголовок панели */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {title && (
            <h2 id="side-panel-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Закрыть панель"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Контент панели */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Ручка для изменения размера */}
        <div
          ref={resizeHandleRef}
          className={`
            absolute top-0 bottom-0 w-1 cursor-col-resize
            hover:bg-blue-500 hover:opacity-50
            ${position === 'right' ? '-left-0.5' : '-right-0.5'}
          `}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-label="Изменить размер панели"
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
          aria-valuenow={currentWidth}
        />
      </div>
    </>
  );
};

export default SidePanel;
