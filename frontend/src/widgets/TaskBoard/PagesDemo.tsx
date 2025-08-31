import React from 'react';
import PagesList from './PagesList';

/**
 * Демо-компонент для показа работы side-panel
 * Использует моковые данные для демонстрации
 */
const PagesDemo: React.FC = () => {
  const mockPages = [
    {
      id: '1',
      title: 'Добро пожаловать',
      content: 'Это первая страница в нашем приложении. Здесь вы можете создавать и просматривать страницы.',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Как использовать',
      content: 'Кликните на любую страницу в списке слева, чтобы открыть её в side-panel справа.',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      title: 'Возможности',
      content: '• Просмотр страниц в side-panel\n• Анимация slide-over\n• Список страниц остается видимым\n• Адаптивная ширина панели',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const handleCreatePage = () => {
    alert('Функция создания страницы будет добавлена позже');
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full">
        <PagesList 
          pages={mockPages}
          onCreatePage={handleCreatePage}
        />
      </div>
    </div>
  );
};

export default PagesDemo;
