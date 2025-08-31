import React, { useState, useMemo } from 'react';
import { 
  TableView, 
  BoardView, 
  ListView, 
  ViewManager 
} from './index';
import type { DatabaseView, ViewType } from '../../types/views';
import type { DatabaseProperty, DatabaseRecord } from '../../types/database';

interface DatabaseViewsProps {
  databaseId: string;
  properties: DatabaseProperty[];
  records: DatabaseRecord[];
  views: DatabaseView[];
  currentView: DatabaseView | null;
  isLoading?: boolean;
  onUpdateRecord: (recordId: string, data: any) => Promise<void>;
  onCreateRecord: (data: any) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
  onViewChange: (view: DatabaseView) => void;
  onCreateView: (viewData: Partial<DatabaseView>) => Promise<void>;
  onUpdateView: (viewId: string, viewData: Partial<DatabaseView>) => Promise<void>;
  onDeleteView: (viewId: string) => Promise<void>;
  className?: string;
}

/**
 * Основной компонент для отображения базы данных
 * Интегрирует все представления и менеджер представлений
 */
export const DatabaseViews: React.FC<DatabaseViewsProps> = ({
  databaseId,
  properties,
  records,
  views,
  currentView,
  isLoading = false,
  onUpdateRecord,
  onCreateRecord,
  onDeleteRecord,
  onViewChange,
  onCreateView,
  onUpdateView,
  onDeleteView,
  className = ''
}) => {
  const [showViewManager, setShowViewManager] = useState(false);

  // Получение конфигурации для текущего представления
  const viewConfig = useMemo(() => {
    if (!currentView) return null;
    
    switch (currentView.type) {
      case 'table':
        return {
          show_properties: properties.map(p => p.id),
          show_checkboxes: true,
          show_actions: true
        };
      case 'board':
        return {
          group_by_property: properties.find(p => p.type === 'select')?.id || properties[0]?.id,
          show_empty_groups: true,
          card_layout: 'compact' as const,
          show_property_icons: true
        };
      case 'list':
        return {
          show_properties: properties.map(p => p.id),
          row_height: 'normal' as const,
          show_checkboxes: true,
          show_actions: true
        };
      default:
        return {};
    }
  }, [currentView, properties]);

  // Рендер текущего представления
  const renderCurrentView = () => {
    if (!currentView || !viewConfig) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">Выберите представление для отображения</p>
          <button
            onClick={() => setShowViewManager(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Управление представлениями
          </button>
        </div>
      );
    }

    const commonProps = {
      properties,
      records,
      isLoading,
      onUpdateRecord,
      onCreateRecord,
      onDeleteRecord,
      className: 'h-full'
    };

    switch (currentView.type) {
      case 'table':
        return (
          <TableView
            {...commonProps}
            config={viewConfig as any}
          />
        );
      case 'board':
        return (
          <BoardView
            {...commonProps}
            config={viewConfig as any}
          />
        );
      case 'list':
        return (
          <ListView
            {...commonProps}
            config={viewConfig as any}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Представление типа "{currentView.type}" не поддерживается</p>
          </div>
        );
    }
  };

  return (
    <div className={`${className} h-full flex flex-col`}>
      {/* Заголовок и панель управления */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">База данных</h2>
          {currentView && (
            <p className="text-gray-600 mt-1">
              Представление: {currentView.name}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowViewManager(!showViewManager)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {showViewManager ? 'Скрыть' : 'Управление'} представлениями
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex gap-6">
        {/* Панель управления представлениями */}
        {showViewManager && (
          <div className="w-80 flex-shrink-0">
            <ViewManager
              views={views}
              currentView={currentView}
              onViewChange={onViewChange}
              onCreateView={onCreateView}
              onUpdateView={onUpdateView}
              onDeleteView={onDeleteView}
            />
          </div>
        )}
        
        {/* Область представления */}
        <div className="flex-1">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default DatabaseViews;
