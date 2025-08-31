import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databasesApi } from '../api';
import type { Database, DatabaseProperty, DatabaseRecord } from '../types/database';
import { EditableCell } from './EditableCell';
import { AddRowButton } from './AddRowButton';
import { AddColumnButton } from './AddColumnButton';
import { DeleteButton } from './DeleteButton';
import LoadingSpinner from '../../../shared/ui/LoadingSpinner';
import EmptyState from '../../../shared/ui/EmptyState';
import CreatePropertyModal from './CreatePropertyModal';

interface DatabaseTableProps {
  databaseId: string;
  className?: string;
}

/**
 * Компонент таблицы базы данных с возможностью inline-редактирования
 * Отображает свойства как колонки и записи как строки
 */
export const DatabaseTable: React.FC<DatabaseTableProps> = ({ 
  databaseId, 
  className = '' 
}) => {
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState<{
    recordId: string;
    propertyId: string;
  } | null>(null);
  const [showCreatePropertyModal, setShowCreatePropertyModal] = useState(false);

  // Запрос данных базы данных
  const { data: database, isLoading: isLoadingDatabase } = useQuery({
    queryKey: ['database', databaseId],
    queryFn: () => databasesApi.getDatabase(databaseId).then(res => res.data),
  });

  // Запрос свойств базы данных
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['database-properties', databaseId],
    queryFn: () => databasesApi.getProperties(databaseId).then(res => res.data),
    enabled: !!databaseId,
  });

  // Запрос записей базы данных
  const { data: records = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['database-records', databaseId],
    queryFn: () => databasesApi.getRecords(databaseId).then(res => res.data),
    enabled: !!databaseId,
  });

  // Мутация для обновления записи
  const updateRecordMutation = useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: any }) =>
      databasesApi.updateRecord(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-records', databaseId] });
      setEditingCell(null);
    },
  });

  // Мутация для создания записи
  const createRecordMutation = useMutation({
    mutationFn: (data: any) => databasesApi.createRecord(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-records', databaseId] });
    },
  });

  // Мутация для создания свойства
  const createPropertyMutation = useMutation({
    mutationFn: (data: any) => databasesApi.createProperty(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-properties', databaseId] });
    },
  });

  // Мутация для удаления записи
  const deleteRecordMutation = useMutation({
    mutationFn: (recordId: string) => databasesApi.deleteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-records', databaseId] });
    },
  });

  // Мутация для удаления свойства
  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: string) => databasesApi.deleteProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-properties', databaseId] });
      queryClient.invalidateQueries({ queryKey: ['database-records', databaseId] });
    },
  });

  // Обработчик начала редактирования ячейки
  const handleStartEdit = useCallback((recordId: string, propertyId: string) => {
    setEditingCell({ recordId, propertyId });
  }, []);

  // Обработчик сохранения значения ячейки
  const handleSaveCell = useCallback((recordId: string, propertyId: string, value: any) => {
    const record = records.find((r: DatabaseRecord) => r.id === recordId);
    if (!record) return;

    const updatedProperties = {
      ...record.data,
      [propertyId]: value
    };

    updateRecordMutation.mutate({
      recordId,
      data: { properties: updatedProperties }
    });
  }, [records, updateRecordMutation]);

  // Обработчик добавления новой строки
  const handleAddRow = useCallback(() => {
    const emptyProperties: Record<string, any> = {};
    properties.forEach((prop: DatabaseProperty) => {
      emptyProperties[prop.id] = '';
    });

    createRecordMutation.mutate({ properties: emptyProperties });
  }, [properties, createRecordMutation]);

  // Обработчик добавления новой колонки
  const handleAddColumn = useCallback((propertyData: any) => {
    createPropertyMutation.mutate(propertyData);
  }, [createPropertyMutation]);

  // Обработчик удаления строки
  const handleDeleteRow = useCallback((recordId: string) => {
    deleteRecordMutation.mutate(recordId);
  }, [deleteRecordMutation]);

  // Обработчик удаления колонки
  const handleDeleteColumn = useCallback((propertyId: string) => {
    deletePropertyMutation.mutate(propertyId);
  }, [deletePropertyMutation]);

  // Сортировка свойств по позиции
  const sortedProperties = useMemo(() => {
    return [...properties].sort((a: DatabaseProperty, b: DatabaseProperty) => a.position - b.position);
  }, [properties]);

  // Проверка загрузки
  if (isLoadingDatabase || isLoadingProperties || isLoadingRecords) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Проверка ошибок
  if (!database || !properties.length) {
    return (
      <EmptyState
        title="База данных не найдена"
        description="Не удалось загрузить данные или база данных пуста"
      />
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Заголовок таблицы */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{database.title}</h2>
            {database.description && (
              <p className="text-sm text-gray-500 mt-1">{database.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <AddColumnButton onAdd={handleAddColumn} />
            <AddRowButton onAdd={handleAddRow} />
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Заголовки колонок */}
          <thead className="bg-gray-50">
            <tr>
              {sortedProperties.map((property) => (
                <th
                  key={property.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center justify-between">
                    <span>{property.name}</span>
                    <DeleteButton
                      onDelete={() => handleDeleteColumn(property.id)}
                      tooltip="Удалить колонку"
                      className="ml-2"
                    />
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>

          {/* Строки данных */}
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record: DatabaseRecord) => (
              <tr key={record.id} className="hover:bg-gray-50">
                {sortedProperties.map((property) => (
                  <td key={property.id} className="px-6 py-4 whitespace-nowrap">
                    <EditableCell
                      value={record.data[property.id] || ''}
                      property={property}
                      isEditing={editingCell?.recordId === record.id && editingCell?.propertyId === property.id}
                      onStartEdit={() => handleStartEdit(record.id, property.id)}
                      onSave={(value) => handleSaveCell(record.id, property.id, value)}
                      onCancel={() => setEditingCell(null)}
                    />
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <DeleteButton
                    onDelete={() => handleDeleteRow(record.id)}
                    tooltip="Удалить строку"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Сообщение об отсутствии данных */}
        {records.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Нет данных для отображения</p>
            <button
              onClick={handleAddRow}
              className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Добавить первую строку
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
