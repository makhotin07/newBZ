import React from 'react';
import { Drawer } from './Drawer';

interface PagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  pageTitle?: string;
}

/**
 * Компонент для предварительного просмотра страницы в drawer
 * Отображает содержимое страницы в правой панели
 */
export const PagePreview: React.FC<PagePreviewProps> = ({
  isOpen,
  onClose,
  pageId,
  pageTitle = 'Предварительный просмотр'
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={pageTitle}
      width={480}
      position="right"
    >
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 600 }}>
            Страница: {pageId}
          </h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Здесь будет отображаться содержимое страницы
          </p>
        </div>
        
        {/* Placeholder для контента страницы */}
        <div style={{
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            Контент страницы
          </div>
          <div style={{ fontSize: '14px' }}>
            Загрузка содержимого...
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => {
              // TODO: Открыть страницу в полном режиме
              console.log('Открыть страницу:', pageId);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Открыть полностью
          </button>
          
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default PagePreview;
