import React, { useState } from 'react';
import { useDatabase, useDatabaseView } from '../../hooks';
import { 
  BoardView, 
  CalendarView, 
  ListView, 
  GalleryView, 
  TimelineView,
  ViewSelector 
} from './index';
import type { DatabaseView as DatabaseViewType } from '../../types/views';

interface DatabaseViewsExampleProps {
  databaseId: string;
  className?: string;
}

/**
 * Пример использования всех представлений базы данных
 * Демонстрирует переключение между различными представлениями
 */
export const DatabaseViewsExample: React.FC<DatabaseViewsExampleProps> = ({ 
  databaseId, 
  className = '' 
}) => {
  const [currentView, setCurrentView] = useState<DatabaseViewType | null>(null);
  
  // Хуки для работы с базой данных и представлениями
  const {
    database,
    properties,
    records,
    isLoading: isLoadingDatabase,
    updateRecord,
    createRecord,
    deleteRecord
  } = useDatabase(databaseId);

  const {
    views,
    currentView: currentViewData,
    isLoading: isLoadingViews,
    createView
  } = useDatabaseView({ databaseId, viewId: currentView?.id });

  // Обработчик изменения представления
  const handleViewChange = (view: DatabaseViewType) => {
    setCurrentView(view);
  };

  // Обработчик создания нового представления
  const handleCreateView = () => {
    // Здесь можно открыть модальное окно для создания представления
    console.log('Создание нового представления');
  };

  // Обработчики для представлений
  const handleUpdateRecord = async (recordId: string, data: any) => {
    try {
      await updateRecord(recordId, data);
    } catch (error) {
      console.error('Ошибка при обновлении записи:', error);
    }
  };

  const handleCreateRecord = async (data: any) => {
    try {
      await createRecord(data);
    } catch (error) {
      console.error('Ошибка при создании записи:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await deleteRecord(recordId);
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
    }
  };

  // Проверка загрузки
  if (isLoadingDatabase || isLoadingViews) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка представлений...</p>
        </div>
      </div>
    );
  }

  // Если нет представлений, показываем таблицу по умолчанию
  if (!views.length) {
    return (
      <div className={`${className}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">База данных</h2>
          <p className="text-gray-600 mt-2">
            {(database as any)?.title || 'Загрузка...'}
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Представления не настроены
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Создайте представления для отображения данных в различных форматах:
                  таблица, доска, календарь, список, галерея, временная шкала.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Рендер текущего представления
  const renderCurrentView = () => {
    if (!currentView || !properties.length) return null;

    const commonProps = {
      properties: properties,
      records: records,
      onUpdateRecord: handleUpdateRecord,
      onDeleteRecord: handleDeleteRecord,
      isLoading: isLoadingDatabase,
      className: 'mt-6'
    };

    switch (currentView.type) {
      case 'table':
        // Для таблицы используем DatabaseTable из основного компонента
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Табличное представление
            </h3>
            <p className="text-gray-600">
              Используйте основной компонент DatabaseTable для табличного представления
            </p>
          </div>
        );

      case 'board':
        return (
          <BoardView
            {...commonProps}
            config={currentView.config.board || { group_by_property: properties[0]?.id || '', show_empty_groups: true, card_layout: 'detailed', show_property_icons: true }}
            onCreateRecord={handleCreateRecord}
          />
        );

      case 'calendar':
        return (
          <CalendarView
            {...commonProps}
            config={currentView.config.calendar || { date_property: properties.find((p: any) => p.type === 'date')?.id || '', show_time: false, default_view: 'month' }}
          />
        );

      case 'list':
        return (
          <ListView
            {...commonProps}
            config={currentView.config.list || { show_properties: properties.slice(0, 3).map((p: any) => p.id), row_height: 'normal', show_checkboxes: true, show_actions: true }}
          />
        );

      case 'gallery':
        return (
          <GalleryView
            {...commonProps}
            config={currentView.config.gallery || { 
              title_property: properties.find((p: any) => p.type === 'text')?.id || properties[0]?.id || '', 
              card_size: 'medium', 
              columns: 3 
            }}
          />
        );

      case 'timeline':
        return (
          <TimelineView
            {...commonProps}
            config={currentView.config.timeline || { 
              start_date_property: properties.find((p: any) => p.type === 'date')?.id || '', 
              end_date_property: properties.find((p: any) => p.type === 'date')?.id || '', 
              title_property: properties.find((p: any) => p.type === 'text')?.id || properties[0]?.id || '',
              show_progress: true,
              time_unit: 'week'
            }}
          />
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">Неизвестный тип представления: {currentView.type}</p>
          </div>
        );
    }
  };

  return (
    <div className={`${className}`}>
      {/* Заголовок */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
                      {database?.title || 'База данных'}
        </h2>
        <p className="text-gray-600 mt-2">
          Переключайтесь между различными представлениями данных
        </p>
      </div>

      {/* Селектор представлений */}
      <ViewSelector
        views={views as any}
        currentView={currentView || undefined}
        onViewChange={handleViewChange}
        onCreateView={handleCreateView}
        className="mb-6"
      />

      {/* Информация о текущем представлении */}
      {currentView && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-800">
              Текущее представление: {currentView.name}
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Тип: {currentView.type} • Записей: {records.length} • Свойств: {properties.length}
          </p>
        </div>
      )}

      {/* Отображение текущего представления */}
      {renderCurrentView()}

      {/* Сообщение о выборе представления */}
      {!currentView && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Выберите представление
          </h3>
          <p className="text-gray-500">
            Выберите одно из доступных представлений выше для отображения данных
          </p>
        </div>
      )}
    </div>
  );
};
