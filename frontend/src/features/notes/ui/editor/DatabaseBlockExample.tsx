import React, { useState } from 'react';
import { RichTextEditor, DatabaseBlockInsert } from './index';
import { notesApi } from '../../api';

interface DatabaseBlockExampleProps {
  pageId: string;
  className?: string;
}

/**
 * Пример использования блока базы данных в TipTap редакторе
 * Демонстрирует вставку и отображение базы данных на странице
 */
export const DatabaseBlockExample: React.FC<DatabaseBlockExampleProps> = ({
  pageId,
  className = ''
}) => {
  const [showDatabaseInsert, setShowDatabaseInsert] = useState(false);
  const [content, setContent] = useState('');

  // Обработчик вставки базы данных
  const handleInsertDatabase = async (databaseId: string, viewId?: string) => {
    try {
      // Создаем блок базы данных через API
      const block = await notesApi.createDatabaseBlock(pageId, databaseId, viewId);
      
      // Обновляем контент страницы
      const updatedContent = content + `
        <div data-type="database" data-database-id="${databaseId}" ${viewId ? `data-view-id="${viewId}"` : ''}>
          <p>База данных: ${databaseId}</p>
          ${viewId ? `<p>Представление: ${viewId}</p>` : ''}
        </div>
      `;
      
      setContent(updatedContent);
      setShowDatabaseInsert(false);
      
      console.log('Блок базы данных создан:', block);
    } catch (error) {
      console.error('Ошибка при создании блока базы данных:', error);
    }
  };

  // Обработчик изменения контента
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Редактор с поддержкой баз данных
        </h2>
        <p className="text-gray-600">
          Используйте команду /database для вставки базы данных на страницу
        </p>
      </div>

      {/* Кнопка вставки базы данных */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowDatabaseInsert(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"/>
          </svg>
          <span>Вставить базу данных</span>
        </button>
      </div>

      {/* TipTap редактор */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <RichTextEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Начните писать или используйте / для команд..."
          showToolbar={true}
          onInsertDatabase={() => setShowDatabaseInsert(true)}
          className="min-h-[400px]"
        />
      </div>

      {/* Инструкции */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Как использовать:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Нажмите кнопку "Вставить базу данных" выше</li>
          <li>• Или введите "/" в редакторе и выберите "База данных"</li>
          <li>• Выберите базу данных и представление</li>
          <li>• База данных будет вставлена как блок на страницу</li>
        </ul>
      </div>

      {/* Модальное окно вставки базы данных */}
      {showDatabaseInsert && (
        <DatabaseBlockInsert
          pageId={pageId}
          onInsert={handleInsertDatabase}
          onCancel={() => setShowDatabaseInsert(false)}
        />
      )}
    </div>
  );
};
