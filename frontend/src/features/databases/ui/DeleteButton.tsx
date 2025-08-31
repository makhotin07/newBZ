import React, { useState } from 'react';

interface DeleteButtonProps {
  onDelete: () => void;
  tooltip?: string;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Кнопка удаления с подтверждением
 * Используется для удаления строк и колонок в таблице
 */
export const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  onDelete, 
  tooltip = 'Удалить',
  className = '',
  size = 'sm'
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    onDelete();
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className={`
          inline-flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 
          hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
          transition-colors duration-200 ${sizeClasses[size]} ${className}
        `}
        title={tooltip}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {/* Модальное окно подтверждения */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-80 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              {/* Иконка предупреждения */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Заголовок */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Подтверждение удаления
              </h3>

              {/* Описание */}
              <p className="text-sm text-gray-500 mb-6">
                Это действие нельзя отменить. Элемент будет удален навсегда.
              </p>

              {/* Кнопки */}
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
