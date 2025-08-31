import React, { useState } from 'react';
import type { DatabaseProperty, DatabaseRecord } from '../../types/database';
import { GalleryViewConfig } from '../../types/views';
import { EditableCell } from '../EditableCell';
import { DeleteButton } from '../DeleteButton';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

interface GalleryViewProps {
  properties: DatabaseProperty[];
  records: DatabaseRecord[];
  config: GalleryViewConfig;
  onUpdateRecord: (recordId: string, data: any) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Представление галереи для базы данных
 * Отображает записи в виде карточек с изображениями и текстом
 */
export const GalleryView: React.FC<GalleryViewProps> = ({
  properties,
  records,
  config,
  onUpdateRecord,
  onDeleteRecord,
  isLoading = false,
  className = ''
}) => {
  const [editingCell, setEditingCell] = useState<{
    recordId: string;
    propertyId: string;
  } | null>(null);

  // Получение свойств для отображения
  const titleProperty = properties.find(p => p.id === config.title_property);
  const descriptionProperty = properties.find(p => p.id === config.description_property);
  const imageProperty = properties.find(p => p.id === config.image_property);

  // Получение классов для размера карточки
  const getCardSizeClasses = () => {
    switch (config.card_size) {
      case 'small':
        return 'w-48 h-64';
      case 'large':
        return 'w-80 h-96';
      default:
        return 'w-64 h-80';
    }
  };

  // Получение классов для сетки
  const getGridClasses = () => {
    return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${config.columns} gap-6`;
  };

  // Обработчик редактирования ячейки
  const handleStartEdit = (recordId: string, propertyId: string) => {
    setEditingCell({ recordId, propertyId });
  };

  const handleSaveCell = async (recordId: string, propertyId: string, value: any) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    try {
      await onUpdateRecord(recordId, {
        properties: {
          ...(record as any).properties,
          [propertyId]: value
        }
      });
      setEditingCell(null);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  // Рендер изображения
  const renderImage = (record: DatabaseRecord) => {
    if (!imageProperty) return null;

    const imageUrl = (record as any).properties[imageProperty.id];
    if (!imageUrl) {
      return (
        <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-full h-32 bg-gray-100 rounded-t-lg overflow-hidden">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            // Заменяем на placeholder при ошибке загрузки
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="w-full h-32 bg-gray-100 flex items-center justify-center hidden">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Заголовок галереи */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Галерея записей ({records.length})
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Карточки с изображениями и текстом
        </p>
      </div>

      {/* Сетка карточек */}
      <div className={getGridClasses()}>
        {records.map((record) => (
          <div
            key={record.id}
            className={`${getCardSizeClasses()} bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}
          >
            {/* Изображение */}
            {renderImage(record)}

            {/* Содержимое карточки */}
            <div className="p-4">
              {/* Заголовок */}
              {titleProperty && (
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">
                    {titleProperty.name}
                  </div>
                  <EditableCell
                    value={(record as any).properties[titleProperty.id] || ''}
                    property={titleProperty}
                    isEditing={editingCell?.recordId === record.id && editingCell?.propertyId === titleProperty.id}
                    onStartEdit={() => handleStartEdit(record.id, titleProperty.id)}
                    onSave={(value) => handleSaveCell(record.id, titleProperty.id, value)}
                    onCancel={handleCancelEdit}
                  />
                </div>
              )}

              {/* Описание */}
              {descriptionProperty && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">
                    {descriptionProperty.name}
                  </div>
                  <EditableCell
                    value={(record as any).properties[descriptionProperty.id] || ''}
                    property={descriptionProperty}
                    isEditing={editingCell?.recordId === record.id && editingCell?.propertyId === descriptionProperty.id}
                    onStartEdit={() => handleStartEdit(record.id, descriptionProperty.id)}
                    onSave={(value) => handleSaveCell(record.id, descriptionProperty.id, value)}
                    onCancel={handleCancelEdit}
                  />
                </div>
              )}

              {/* Дополнительные свойства (первые 2) */}
              {properties
                .filter(prop => 
                  prop.id !== config.title_property && 
                  prop.id !== config.description_property && 
                  prop.id !== config.image_property
                )
                .slice(0, 2)
                .map(property => (
                  <div key={property.id} className="mb-2 last:mb-0">
                    <div className="text-xs text-gray-500 mb-1">
                      {property.name}
                    </div>
                    <EditableCell
                      value={(record as any).properties[property.id] || ''}
                      property={property}
                      isEditing={editingCell?.recordId === record.id && editingCell?.propertyId === property.id}
                      onStartEdit={() => handleStartEdit(record.id, property.id)}
                      onSave={(value) => handleSaveCell(record.id, property.id, value)}
                      onCancel={handleCancelEdit}
                    />
                  </div>
                ))}

              {/* Действия */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  {new Date(record.updated_at).toLocaleDateString('ru-RU')}
                </div>
                <DeleteButton
                  onDelete={() => onDeleteRecord(record.id)}
                  tooltip="Удалить запись"
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Сообщение об отсутствии данных */}
      {records.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">Нет данных для отображения</p>
          <p className="text-sm text-gray-400 mt-1">
            Создайте записи, чтобы увидеть их в галерее
          </p>
        </div>
      )}
    </div>
  );
};
