import React, { useState } from 'react';
import type { DatabaseProperty, DatabaseRecord } from '../../types/database';
import { ListViewConfig } from '../../types/views';
import { EditableCell } from '../EditableCell';
import { DeleteButton } from '../DeleteButton';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

interface ListViewProps {
  properties: DatabaseProperty[];
  records: DatabaseRecord[];
  config: ListViewConfig;
  onUpdateRecord: (recordId: string, data: any) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Представление списка для базы данных
 * Упрощенный список записей с настраиваемыми свойствами
 */
export const ListView: React.FC<ListViewProps> = ({
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
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  // Фильтруем свойства для отображения
  const displayProperties = properties.filter(prop => 
    config.show_properties.length === 0 || config.show_properties.includes(prop.id)
  );

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

  // Обработчик выбора записи
  const handleRecordSelect = (recordId: string, checked: boolean) => {
    const newSelected = new Set(selectedRecords);
    if (checked) {
      newSelected.add(recordId);
    } else {
      newSelected.delete(recordId);
    }
    setSelectedRecords(newSelected);
  };

  // Обработчик выбора всех записей
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(new Set(records.map(r => r.id)));
    } else {
      setSelectedRecords(new Set());
    }
  };

  // Получение классов для высоты строки
  const getRowHeightClass = () => {
    switch (config.row_height) {
      case 'compact':
        return 'py-2';
      case 'large':
        return 'py-6';
      default:
        return 'py-4';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Заголовок списка */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Список записей ({records.length})
          </h3>
          {config.show_actions && selectedRecords.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Выбрано: {selectedRecords.size}
              </span>
              <button
                onClick={() => {
                  // Массовое удаление выбранных записей
                  selectedRecords.forEach(recordId => onDeleteRecord(recordId));
                  setSelectedRecords(new Set());
                }}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Удалить выбранные
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Таблица списка */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Заголовки колонок */}
          <thead className="bg-gray-50">
            <tr>
              {config.show_checkboxes && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRecords.size === records.length && records.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
              )}
              
              {displayProperties.map((property) => (
                <th
                  key={property.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {property.name}
                </th>
              ))}
              
              {config.show_actions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              )}
            </tr>
          </thead>

          {/* Строки данных */}
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr 
                key={record.id} 
                className={`hover:bg-gray-50 ${
                  selectedRecords.has(record.id) ? 'bg-blue-50' : ''
                }`}
              >
                {config.show_checkboxes && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(record.id)}
                      onChange={(e) => handleRecordSelect(record.id, e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                )}
                
                {displayProperties.map((property) => (
                  <td key={property.id} className={`px-6 whitespace-nowrap ${getRowHeightClass()}`}>
                    <EditableCell
                      value={(record as any).properties[property.id] || ''}
                      property={property}
                      isEditing={editingCell?.recordId === record.id && editingCell?.propertyId === property.id}
                      onStartEdit={() => handleStartEdit(record.id, property.id)}
                      onSave={(value) => handleSaveCell(record.id, property.id, value)}
                      onCancel={handleCancelEdit}
                    />
                  </td>
                ))}
                
                {config.show_actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          // Дублирование записи
                          const newProperties = { ...(record as any).properties };
                          onUpdateRecord(record.id, { properties: newProperties });
                        }}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                        title="Дублировать"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      <DeleteButton
                        onDelete={() => onDeleteRecord(record.id)}
                        tooltip="Удалить запись"
                        size="sm"
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Сообщение об отсутствии данных */}
        {records.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Нет данных для отображения</p>
          </div>
        )}
      </div>
    </div>
  );
};
