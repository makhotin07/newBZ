import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { databasesApi } from '../../../databases/api';
import { notesApi } from '../../api';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

interface DatabaseBlockInsertProps {
  pageId: string;
  onInsert: (databaseId: string, viewId?: string) => void;
  onCancel: () => void;
}

/**
 * Компонент для вставки блока базы данных в TipTap редактор
 * Позволяет выбрать базу данных и представление для вставки
 */
export const DatabaseBlockInsert: React.FC<DatabaseBlockInsertProps> = ({
  pageId,
  onInsert,
  onCancel
}) => {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedView, setSelectedView] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Запрос баз данных для текущего workspace
  const { data: databases = [], isLoading: isLoadingDatabases } = useQuery({
    queryKey: ['workspace-databases'],
    queryFn: async () => {
      // Получаем workspace из текущей страницы
      const page = await notesApi.getPage(pageId);
      return databasesApi.getDatabases();
    },
    enabled: !!pageId,
  });

  // Запрос представлений для выбранной базы данных
  const { data: views = [], isLoading: isLoadingViews } = useQuery({
    queryKey: ['database-views', selectedDatabase],
    queryFn: () => databasesApi.getViews(selectedDatabase),
    enabled: !!selectedDatabase,
  });

  // Фильтрация баз данных по поисковому запросу
  const filteredDatabases = (databases as any).filter((db: any) =>
    db.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    db.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Обработчик вставки блока
  const handleInsert = () => {
    if (selectedDatabase) {
      onInsert(selectedDatabase, selectedView || undefined);
    }
  };

  // Обработчик изменения базы данных
  const handleDatabaseChange = (databaseId: string) => {
    setSelectedDatabase(databaseId);
    setSelectedView(''); // Сбрасываем выбранное представление
  };

  // Проверка возможности вставки
  const canInsert = selectedDatabase && !isLoadingDatabases;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Вставить базу данных
          </h3>
          
          {/* Поиск баз данных */}
          <div className="mb-4">
            <label htmlFor="database-search" className="block text-sm font-medium text-gray-700 mb-2">
              Поиск баз данных
            </label>
            <input
              type="text"
              id="database-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Введите название или описание..."
            />
          </div>

          {/* Список баз данных */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите базу данных
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
              {isLoadingDatabases ? (
                <div className="flex justify-center items-center p-4">
                  <LoadingSpinner />
                </div>
              ) : filteredDatabases.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? 'Базы данных не найдены' : 'Нет доступных баз данных'}
                </div>
              ) : (
                filteredDatabases.map((database: any) => (
                  <div
                    key={database.id}
                    className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedDatabase === database.id ? 'bg-indigo-50 border-indigo-200' : ''
                    }`}
                    onClick={() => handleDatabaseChange(database.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {database.title}
                        </p>
                        {database.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {database.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {database.records_count} записей • {database.properties_count} свойств
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Выбор представления */}
          {selectedDatabase && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выберите представление (необязательно)
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md">
                {isLoadingViews ? (
                  <div className="flex justify-center items-center p-4">
                    <LoadingSpinner />
                  </div>
                ) : (views as any).length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Нет доступных представлений
                  </div>
                ) : (
                  <>
                    <div
                      className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedView === '' ? 'bg-indigo-50 border-indigo-200' : ''
                      }`}
                      onClick={() => setSelectedView('')}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="text-sm text-gray-900">По умолчанию (таблица)</span>
                      </div>
                    </div>
                    {(views as any).map((view: any) => (
                      <div
                        key={view.id}
                        className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          selectedView === view.id ? 'bg-indigo-50 border-indigo-200' : ''
                        }`}
                        onClick={() => setSelectedView(view.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-sm text-gray-900">{view.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {view.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!canInsert}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                canInsert
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Вставить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
