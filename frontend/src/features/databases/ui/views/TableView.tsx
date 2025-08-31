import React, { useState, useMemo } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  FunnelIcon, 
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import type { DatabaseProperty, DatabaseRecord } from '../../types/database';
import { TableViewConfig } from '../../types/views';
import { EditableCell } from '../EditableCell';
import { Button } from '../../../../shared/ui/Button';
import { Input } from '../../../../shared/ui/Input';
import { Modal } from '../../../../shared/ui/Modal';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';
import { EmptyState, LoadingSkeleton, Tooltip } from '../../../../shared/ui';

interface TableViewProps {
  properties: DatabaseProperty[];
  records: DatabaseRecord[];
  config: TableViewConfig;
  onUpdateRecord: (recordId: string, data: any) => Promise<void>;
  onCreateRecord: (data: any) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Табличное представление для базы данных
 * Поддерживает inline-редактирование, сортировку, фильтрацию и группировку
 */
export const TableView: React.FC<TableViewProps> = ({
  properties,
  records,
  config,
  onUpdateRecord,
  onCreateRecord,
  onDeleteRecord,
  isLoading = false,
  className = ''
}) => {
  const [editingCell, setEditingCell] = useState<{
    recordId: string;
    propertyId: string;
  } | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    propertyId: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Map<string, any>>(new Map());
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Record<string, any>>({});

  // Фильтруем свойства для отображения
  const displayProperties = useMemo(() => {
    if (config.show_properties.length === 0) {
      return properties;
    }
    return properties.filter(prop => config.show_properties.includes(prop.id));
  }, [properties, config.show_properties]);

  // Применяем фильтры к записям
  const filteredRecords = useMemo(() => {
    let filtered = [...records];
    
    filters.forEach((value, propertyId) => {
      if (value !== '' && value !== null && value !== undefined) {
        filtered = filtered.filter(record => {
          const recordValue = (record as any).properties[propertyId];
          if (typeof value === 'string') {
            return recordValue && recordValue.toString().toLowerCase().includes(value.toLowerCase());
          }
          return recordValue === value;
        });
      }
    });
    
    return filtered;
  }, [records, filters]);

  // Применяем сортировку
  const sortedRecords = useMemo(() => {
    if (!sortConfig) return filteredRecords;
    
    return [...filteredRecords].sort((a, b) => {
      const aValue = (a as any).properties[sortConfig.propertyId];
      const bValue = (b as any).properties[sortConfig.propertyId];
      
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortConfig]);

  // Обработчик сортировки
  const handleSort = (propertyId: string) => {
    setSortConfig(prev => {
      if (prev?.propertyId === propertyId) {
        return {
          propertyId,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { propertyId, direction: 'asc' };
    });
  };

  // Обработчик фильтрации
  const handleFilterChange = (propertyId: string, value: any) => {
    const newFilters = new Map(filters);
    if (value === '' || value === null || value === undefined) {
      newFilters.delete(propertyId);
    } else {
      newFilters.set(propertyId, value);
    }
    setFilters(newFilters);
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

  // Обработчик создания записи
  const handleCreateRecord = async () => {
    try {
      await onCreateRecord(newRecordData);
      setNewRecordData({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Ошибка при создании записи:', error);
    }
  };

  // Обработчик удаления выбранных записей
  const handleDeleteSelected = async () => {
    if (selectedRecords.size === 0) return;
    
    if (window.confirm(`Удалить ${selectedRecords.size} записей?`)) {
      try {
        await Promise.all(
          Array.from(selectedRecords).map(id => onDeleteRecord(id))
        );
        setSelectedRecords(new Set());
      } catch (error) {
        console.error('Ошибка при удалении записей:', error);
      }
    }
  };

  // Получение значения свойства записи
  const getRecordValue = (record: DatabaseRecord, propertyId: string) => {
    return (record as any).properties[propertyId] || '';
  };

  // Получение иконки сортировки
  const getSortIcon = (propertyId: string) => {
    if (sortConfig?.propertyId !== propertyId) {
      return <ChevronUpIcon className="w-4 h-4 text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-blue-600" />
      : <ChevronDownIcon className="w-4 h-4 text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton variant="table-row" rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div className={`${className} space-y-4`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Tooltip content="Показать/скрыть фильтры для поиска по свойствам">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FunnelIcon className="w-4 h-4" />}
            >
              Фильтры {filters.size > 0 && `(${filters.size})`}
            </Button>
          </Tooltip>
          
          {selectedRecords.size > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteSelected}
              leftIcon={<TrashIcon className="w-4 h-4" />}
            >
              Удалить ({selectedRecords.size})
            </Button>
          )}
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Добавить запись
        </Button>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayProperties.map(property => (
              <div key={property.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {property.name}
                </label>
                <Input
                  value={filters.get(property.id) || ''}
                  onChange={(e) => handleFilterChange(property.id, e.target.value)}
                  placeholder={`Фильтр по ${property.name}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Таблица */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Checkbox для выбора всех */}
                {config.show_checkboxes && (
                  <th className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRecords.size === records.length && records.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                
                {/* Заголовки свойств */}
                {displayProperties.map(property => (
                  <th
                    key={property.id}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(property.id)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{property.name}</span>
                      {getSortIcon(property.id)}
                    </div>
                  </th>
                ))}
                
                {/* Действия */}
                {config.show_actions && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {/* Checkbox для выбора записи */}
                  {config.show_checkboxes && (
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRecords.has(record.id)}
                        onChange={(e) => handleRecordSelect(record.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  
                  {/* Ячейки свойств */}
                  {displayProperties.map(property => (
                    <td key={property.id} className="px-3 py-2">
                      {editingCell?.recordId === record.id && editingCell?.propertyId === property.id ? (
                        <EditableCell
                          property={property}
                          value={getRecordValue(record, property.id)}
                          isEditing={true}
                          onStartEdit={() => {}}
                          onSave={(value) => handleSaveCell(record.id, property.id, value)}
                          onCancel={handleCancelEdit}
                        />
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-blue-50 p-1 rounded"
                          onDoubleClick={() => handleStartEdit(record.id, property.id)}
                        >
                          {getRecordValue(record, property.id)}
                        </div>
                      )}
                    </td>
                  ))}
                  
                  {/* Действия */}
                  {config.show_actions && (
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-1">
                        <Tooltip content="Редактировать запись">
                          <button
                            onClick={() => handleStartEdit(record.id, displayProperties[0]?.id || '')}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Удалить запись">
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Пустое состояние */}
        {sortedRecords.length === 0 && (
          <EmptyState
            icon={filters.size > 0 ? <FunnelIcon className="w-12 h-12" /> : <PlusIcon className="w-12 h-12" />}
            title={filters.size > 0 ? 'Нет записей, соответствующих фильтрам' : 'Нет записей в базе данных'}
            action={filters.size === 0 ? {
              label: 'Создать первую запись',
              onClick: () => setShowCreateModal(true),
              variant: 'secondary',
              size: 'sm'
            } : undefined}
          />
        )}
      </div>

      {/* Модальное окно создания записи */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создать новую запись"
        size="lg"
      >
        <div className="space-y-4">
          {displayProperties.map(property => (
            <div key={property.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {property.name}
                {(property as any).required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                value={newRecordData[property.id] || ''}
                onChange={(e) => setNewRecordData(prev => ({
                  ...prev,
                  [property.id]: e.target.value
                }))}
                placeholder={`Введите ${property.name.toLowerCase()}`}
                isRequired={(property as any).required}
              />
            </div>
          ))}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateRecord}
              disabled={Object.keys(newRecordData).length === 0}
            >
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableView;
