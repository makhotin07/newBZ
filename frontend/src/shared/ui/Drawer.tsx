import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: number;
  position?: 'left' | 'right';
}

/**
 * Компонент Drawer для отображения контента в боковой панели
 * Поддерживает открытие/закрытие, фокус-ловушку и доступность
 */
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  width = 400,
  position = 'right'
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Фокус-ловушка
  useEffect(() => {
    if (isOpen) {
      // Сохраняем предыдущий активный элемент
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Фокусируемся на drawer
      if (drawerRef.current) {
        drawerRef.current.focus();
      }
    } else {
      // Возвращаем фокус на предыдущий элемент
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Блокируем скролл body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Обработка клика вне drawer
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const drawerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    [position]: 0,
    width: `${width}px`,
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: position === 'right' 
      ? '-4px 0 12px rgba(0, 0, 0, 0.15)' 
      : '4px 0 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : `translateX(${position === 'right' ? '100%' : '-100%'})`,
    transition: 'transform 0.3s ease-in-out',
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
  };

  return createPortal(
    <div style={backdropStyle} onClick={handleBackdropClick}>
      <div
        ref={drawerRef}
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        <div style={headerStyle}>
          {title && (
            <h2 id="drawer-title" style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            style={closeButtonStyle}
            aria-label="Закрыть панель"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
