import React from 'react';
import { DatabaseView, ViewType } from '../../types/views';

interface ViewSelectorProps {
  views: DatabaseView[];
  currentView?: DatabaseView;
  onViewChange: (view: DatabaseView) => void;
  onCreateView: () => void;
  className?: string;
}

/**
 * Компонент для выбора представления базы данных
 * Позволяет переключаться между различными представлениями
 */
export const ViewSelector: React.FC<ViewSelectorProps> = ({
  views,
  currentView,
  onViewChange,
  onCreateView,
  className = ''
}) => {
  // Получение иконки для типа представления
  const getViewIcon = (type: ViewType) => {
    switch (type) {
      case 'table':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'board':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'list':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case 'gallery':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'timeline':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
    }
  };

  // Получение названия типа представления
  const getViewTypeName = (type: ViewType) => {
    switch (type) {
      case 'table':
        return 'Таблица';
      case 'board':
        return 'Доска';
      case 'calendar':
        return 'Календарь';
      case 'list':
        return 'Список';
      case 'gallery':
        return 'Галерея';
      case 'timeline':
        return 'Временная шкала';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Переключатель представлений */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
              currentView?.id === view.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title={`${view.name} (${getViewTypeName(view.type)})`}
          >
            {getViewIcon(view.type)}
            <span className="hidden sm:inline">{view.name}</span>
          </button>
        ))}
      </div>

      {/* Кнопка создания нового представления */}
      <button
        onClick={onCreateView}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        title="Создать новое представление"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};
