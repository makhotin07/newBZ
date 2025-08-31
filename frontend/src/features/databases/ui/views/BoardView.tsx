import React, { useMemo, useState } from 'react';
import { 
  UserIcon,
  CalendarIcon,
  FlagIcon,
  TagIcon
} from '@heroicons/react/24/outline';
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Временные заглушки для react-beautiful-dnd
// TODO: заменить на реальную библиотеку drag-n-drop
const DragDropContext = ({ children, onDragEnd }: any) => <div>{children}</div>;
const Droppable = ({ children, droppableId }: any) => <div data-droppable-id={droppableId}>{children}</div>;
const Draggable = ({ children, draggableId, index }: any) => <div data-draggable-id={draggableId} data-index={index}>{children}</div>;
type DropResult = any;
import type { DatabaseProperty, DatabaseRecord } from '../../types/database';
import { BoardViewConfig, GroupedRecords } from '../../types/views';
import { EditableCell } from '../EditableCell';
import { AddRowButton } from '../AddRowButton';
import { DeleteButton } from '../DeleteButton';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

interface BoardViewProps {
  properties: DatabaseProperty[];
  records: DatabaseRecord[];
  config: BoardViewConfig;
  onUpdateRecord: (recordId: string, data: any) => Promise<void>;
  onCreateRecord: (data: any) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Представление Kanban (доска) для базы данных
 * Группирует записи по выбранному свойству с возможностью drag-n-drop
 */
export const BoardView: React.FC<BoardViewProps> = ({
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

  // Группировка записей по свойству
  const groupedRecords = useMemo((): GroupedRecords => {
    const groupProperty = properties.find(p => p.id === config.group_by_property);
    if (!groupProperty) return {};

    const groups: GroupedRecords = {};
    
    // Создаем группы на основе значений свойства
    records.forEach(record => {
      const groupValue = (record as any).properties[config.group_by_property];
      const groupKey = groupValue || 'no-status';
      const groupName = groupValue || 'Без статуса';
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          name: groupName,
          records: [],
          count: 0,
          color: getGroupColor(groupKey)
        };
      }
      
      groups[groupKey].records.push(record);
      groups[groupKey].count++;
    });

    // Сортируем группы по названию
    return Object.fromEntries(
      Object.entries(groups).sort(([, a], [, b]) => a.name.localeCompare(b.name))
    );
  }, [records, properties, config.group_by_property]);

  // Обработчик drag-n-drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Если запись перемещается между группами
    if (source.droppableId !== destination.droppableId) {
      const record = records.find(r => (r as any).id === draggableId);
      if (!record) return;

      const newValue = destination.droppableId === 'no-status' ? null : destination.droppableId;
      
      try {
        await onUpdateRecord((record as any).id, {
          properties: {
            ...(record as any).properties,
            [config.group_by_property]: newValue
          }
        });
      } catch (error) {
        console.error('Ошибка при обновлении записи:', error);
      }
    }
  };

  // Обработчик редактирования ячейки
  const handleStartEdit = (recordId: string, propertyId: string) => {
    setEditingCell({ recordId, propertyId });
  };

  const handleSaveCell = async (recordId: string, propertyId: string, value: any) => {
    const record = records.find(r => (r as any).id === recordId);
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

  // Обработчик быстрых действий
  const handleQuickAction = (action: string, recordId: string) => {
    const record = records.find(r => (r as any).id === recordId);
    if (!record) return;

    switch (action) {
      case 'assign':
        // TODO: Открыть модальное окно для назначения пользователя
        console.log('Назначить пользователя для записи:', recordId);
        break;
      case 'due':
        // TODO: Открыть модальное окно для установки срока
        console.log('Установить срок для записи:', recordId);
        break;
      case 'priority':
        // TODO: Открыть модальное окно для установки приоритета
        console.log('Установить приоритет для записи:', recordId);
        break;
      case 'tags':
        // TODO: Открыть модальное окно для управления тегами
        console.log('Управление тегами для записи:', recordId);
        break;
      default:
        console.log('Неизвестное действие:', action);
    }
  };

  // Обработчик добавления записи в группу
  const handleAddToGroup = async (groupKey: string) => {
    const emptyProperties: Record<string, any> = {};
    properties.forEach(prop => {
      emptyProperties[prop.id] = '';
    });
    
    // Устанавливаем значение группировки
    if (groupKey !== 'no-status') {
      emptyProperties[config.group_by_property] = groupKey;
    }

    try {
      await onCreateRecord({ properties: emptyProperties });
    } catch (error) {
      console.error('Ошибка при создании записи:', error);
    }
  };

  // Получение цвета для группы
  const getGroupColor = (groupKey: string): string => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-gray-100 text-gray-800'
    ];
    
    const index = groupKey.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!config.group_by_property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Не настроено свойство для группировки</p>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(groupedRecords).map(([groupKey, group]) => (
            <div
              key={groupKey}
              className="flex-shrink-0 w-80 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Заголовок группы */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${group.color}`}>
                      {group.name}
                    </span>
                    <span className="text-sm text-gray-500">({group.count})</span>
                  </div>
                  <button
                    onClick={() => handleAddToGroup(groupKey)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Добавить запись"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Карточки записей */}
              <Droppable droppableId={groupKey}>
                {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-2 min-h-[200px] ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {group.records.map((record, index) => (
                      <Draggable key={(record as any).id} draggableId={(record as any).id} index={index}>
                        {(provided: any, snapshot: any) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm cursor-move ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                            }`}
                          >
                            {/* Основные свойства */}
                            {properties.slice(0, 3).map(property => (
                              <div key={property.id} className="mb-2 last:mb-0">
                                <div className="text-xs text-gray-500 mb-1">
                                  {property.name}
                                </div>
                                <EditableCell
                                  value={(record as any).properties[property.id] || ''}
                                  property={property}
                                  isEditing={editingCell?.recordId === (record as any).id && editingCell?.propertyId === property.id}
                                  onStartEdit={() => handleStartEdit((record as any).id, property.id)}
                                  onSave={(value) => handleSaveCell((record as any).id, property.id, value)}
                                  onCancel={handleCancelEdit}
                                />
                              </div>
                            ))}

                            {/* Быстрые действия */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                              <div className="flex items-center space-x-2">
                                {/* Assign */}
                                <button
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                  title="Назначить"
                                  onClick={() => handleQuickAction('assign', (record as any).id)}
                                >
                                  <UserIcon className="w-3 h-3" />
                                </button>
                                
                                {/* Due Date */}
                                <button
                                  className="p-1 text-gray-400 hover:text-orange-600 rounded"
                                  title="Срок выполнения"
                                  onClick={() => handleQuickAction('due', (record as any).id)}
                                >
                                  <CalendarIcon className="w-3 h-3" />
                                </button>
                                
                                {/* Priority */}
                                <button
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                  title="Приоритет"
                                  onClick={() => handleQuickAction('priority', (record as any).id)}
                                >
                                  <FlagIcon className="w-3 h-3" />
                                </button>
                                
                                {/* Tags */}
                                <button
                                  className="p-1 text-gray-400 hover:text-green-600 rounded"
                                  title="Теги"
                                  onClick={() => handleQuickAction('tags', (record as any).id)}
                                >
                                  <TagIcon className="w-3 h-3" />
                                </button>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                                              <div className="text-xs text-gray-400">
                                {new Date((record as any).updated_at).toLocaleDateString('ru-RU')}
                              </div>
                                                              <DeleteButton
                                onDelete={() => onDeleteRecord((record as any).id)}
                                tooltip="Удалить запись"
                                size="sm"
                              />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
