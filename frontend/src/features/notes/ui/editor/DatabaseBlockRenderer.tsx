import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { databasesApi } from '../../../databases/api';
import { DatabaseTable } from '../../../databases/ui';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

interface DatabaseBlockRendererProps {
  databaseId: string;
  viewId?: string;
  className?: string;
}

/**
 * Компонент для рендеринга блока базы данных в TipTap редакторе
 * Отображает выбранное представление базы данных
 */
export const DatabaseBlockRenderer: React.FC<DatabaseBlockRendererProps> = ({
  databaseId,
  viewId,
  className = ''
}) => {
  // Запрос данных базы данных
  const { data: database, isLoading: isLoadingDatabase } = useQuery({
    queryKey: ['database', databaseId],
    queryFn: () => databasesApi.getDatabase(databaseId),
    enabled: !!databaseId,
  });

  // Запрос представления если указано
  const { data: view } = useQuery({
    queryKey: ['database-view', databaseId, viewId],
    queryFn: () => viewId ? databasesApi.getViews(databaseId).then((res: any) => res.data.find((v: any) => v.id === viewId)) : null,
    enabled: !!databaseId && !!viewId,
  });

  if (isLoadingDatabase) {
    return (
      <div className={`flex justify-center items-center h-32 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!database) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm text-red-700">
            База данных не найдена (ID: {databaseId})
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`database-block-content ${className}`}>
      {/* Заголовок блока */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {(database as any).title}
              </h3>
              {(database as any).description && (
                <p className="text-sm text-gray-600">{(database as any).description}</p>
              )}
              {view && (
                <p className="text-xs text-gray-500">
                  Представление: {view.name} ({view.type})
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <a
              href={`/databases/${databaseId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Открыть
            </a>
          </div>
        </div>
      </div>

      {/* Содержимое базы данных */}
      <div className="database-content">
        <DatabaseTable 
          databaseId={databaseId}
          className="border border-gray-200 rounded-lg"
        />
      </div>
    </div>
  );
};
