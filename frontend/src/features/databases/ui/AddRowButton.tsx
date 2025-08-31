import React from 'react';

interface AddRowButtonProps {
  onAdd: () => void;
  className?: string;
}

/**
 * Кнопка для добавления новой строки в таблицу
 */
export const AddRowButton: React.FC<AddRowButtonProps> = ({ onAdd, className = '' }) => {
  return (
    <button
      onClick={onAdd}
      className={`
        inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md
        text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200
        ${className}
      `}
      title="Добавить новую строку"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      Добавить строку
    </button>
  );
};
