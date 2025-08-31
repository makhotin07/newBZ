import React, { useState } from 'react';
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import PageDrawer from './PageDrawer';

interface Page {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

interface PagesListProps {
  /** Список страниц */
  pages: Page[];
  /** Функция создания новой страницы */
  onCreatePage?: () => void;
}

/**
 * Список страниц с интеграцией PageDrawer
 * При клике на страницу открывается side-panel
 */
const PagesList: React.FC<PagesListProps> = ({
  pages,
  onCreatePage
}) => {
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handlePageClick = (page: Page) => {
    setSelectedPage(page);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedPage(null);
  };

  return (
    <div className="flex h-full">
      {/* Список страниц */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Страницы</h2>
            {onCreatePage && (
              <button
                onClick={onCreatePage}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Создать страницу"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {pages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Нет страниц</p>
              {onCreatePage && (
                <button
                  onClick={onCreatePage}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Создать первую страницу
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handlePageClick(page)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-start space-x-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {page.title}
                      </h3>
                      {page.content && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {page.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(page.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PageDrawer */}
      <PageDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        page={selectedPage}
      />
    </div>
  );
};

export default PagesList;
