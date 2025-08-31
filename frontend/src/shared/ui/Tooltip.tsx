import React, { useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  /** Содержимое подсказки */
  content: React.ReactNode;
  /** Позиция подсказки */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Задержка перед показом (мс) */
  delay?: number;
  /** Максимальная ширина подсказки */
  maxWidth?: number;
  /** CSS классы */
  className?: string;
  /** Дети (элемент, к которому привязана подсказка) */
  children: React.ReactNode;
  /** Всегда показывать подсказку */
  alwaysShow?: boolean;
  /** Отключить подсказку */
  disabled?: boolean;
}

/**
 * Компонент подсказки
 * Показывает дополнительную информацию при наведении на элемент
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 200,
  maxWidth = 200,
  className = '',
  children,
  alwaysShow = false,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Позиционирование подсказки
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + 8;
        break;
    }

    // Корректировка позиции для предотвращения выхода за границы экрана
    if (left < 8) left = 8;
    if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > window.innerHeight - 8) {
      top = window.innerHeight - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  };

  // Показать подсказку
  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setTimeout(updatePosition, 10); // Небольшая задержка для корректного позиционирования
    }, delay);
  };

  // Скрыть подсказку
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Обработчики событий
  const handleMouseEnter = () => {
    if (!alwaysShow) showTooltip();
  };

  const handleMouseLeave = () => {
    if (!alwaysShow) hideTooltip();
  };

  const handleFocus = () => {
    if (!alwaysShow) showTooltip();
  };

  const handleBlur = () => {
    if (!alwaysShow) hideTooltip();
  };

  // Показать подсказку при alwaysShow
  useEffect(() => {
    if (alwaysShow && !disabled) {
      setIsVisible(true);
      setTimeout(updatePosition, 10);
    }
  }, [alwaysShow, disabled]);

  // Обновление позиции при изменении размера окна
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="inline-block"
    >
      {children}
      
      {/* Подсказка */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none ${className}`}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth: maxWidth
          }}
          role="tooltip"
        >
          {content}
          
          {/* Стрелка */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full -mt-1 left-1/2 -ml-1' :
              position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -ml-1' :
              position === 'left' ? 'left-full -ml-1 top-1/2 -mt-1' :
              'right-full -mr-1 top-1/2 -mt-1'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
