import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';

interface SidePanelProps {
  /** Открыта ли панель */
  isOpen: boolean;
  /** Функция закрытия панели */
  onClose: () => void;
  /** Заголовок панели */
  title?: string;
  /** Дочерние элементы (контент) */
  children: React.ReactNode;
  /** Ширина панели в процентах (по умолчанию 70%) */
  width?: number;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Боковая панель с анимацией slide-over
 * Занимает указанную ширину экрана справа
 */
const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 70,
  className = ''
}) => {
  // Обработка закрытия по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Блокируем скролл body при открытой панели
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <Transition show={isOpen} as="div">
      {/* Overlay */}
      <Transition.Child
        as="div"
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <Transition.Child
        as="div"
        enter="ease-out duration-300"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="ease-in duration-200"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
        className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ${className}`}
        style={{ width: `${width}%` }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Закрыть"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </Transition.Child>
    </Transition>
  );
};

export default SidePanel;
