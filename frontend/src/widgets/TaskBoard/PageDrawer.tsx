import React from 'react';
import SidePanel from '../../shared/ui/SidePanel';

interface Page {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

interface PageDrawerProps {
  /** Открыта ли панель */
  isOpen: boolean;
  /** Функция закрытия панели */
  onClose: () => void;
  /** Данные страницы */
  page: Page | null;
}

/**
 * Простая панель для отображения страниц
 * Базовый side-panel без сложного функционала
 */
const PageDrawer: React.FC<PageDrawerProps> = ({
  isOpen,
  onClose,
  page
}) => {
  if (!page) return null;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={page.title}
      width={80}
    >
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{page.title}</h1>
        
        {page.content && (
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{page.content}</p>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          Обновлено: {new Date(page.updated_at).toLocaleString()}
        </div>
      </div>
    </SidePanel>
  );
};

export default PageDrawer;
