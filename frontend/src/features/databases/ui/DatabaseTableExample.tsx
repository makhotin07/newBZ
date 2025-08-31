import React from 'react';
import { DatabaseTable } from './DatabaseTable';

/**
 * Пример использования компонента DatabaseTable
 * Демонстрирует как интегрировать таблицу в страницу
 */
export const DatabaseTableExample: React.FC = () => {
  // В реальном приложении databaseId будет получен из URL или props
  const databaseId = 'example-database-id';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок страницы */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">База данных</h1>
          <p className="mt-2 text-gray-600">
            Управляйте данными в табличном формате с возможностью inline-редактирования
          </p>
        </div>

        {/* Таблица базы данных */}
        <DatabaseTable 
          databaseId={databaseId}
          className="shadow-lg"
        />

        {/* Дополнительная информация */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Возможности таблицы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Inline-редактирование</h3>
                <p className="text-sm text-gray-500">Кликните по ячейке для редактирования</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Добавление данных</h3>
                <p className="text-sm text-gray-500">Создавайте новые строки и колонки</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Автосохранение</h3>
                <p className="text-sm text-gray-500">Изменения сохраняются автоматически</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Разные типы данных</h3>
                <p className="text-sm text-gray-500">Текст, числа, даты, флажки и выбор</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Удаление</h3>
                <p className="text-sm text-gray-500">Удаляйте строки и колонки с подтверждением</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Аналитика</h3>
                <p className="text-sm text-gray-500">Просматривайте статистику и метрики</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
