import React, { useMemo, useState } from 'react';
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Временные заглушки для react-beautiful-dnd
const DragDropContext = ({ children, onDragEnd }: any) => <div>{children}</div>;
const Droppable = ({ children, droppableId }: any) => <div data-droppable-id={droppableId}>{children}</div>;
const Draggable = ({ children, draggableId, index }: any) => <div data-draggable-id={draggableId} data-index={index}>{children}</div>;
type DropResult = any;
import type { DatabaseProperty, DatabaseRecord } from '../../types/database';
import { TimelineViewConfig, TimelineItem } from '../../types/views';
import { EditableCell } from '../EditableCell';
import { DeleteButton } from '../DeleteButton';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

interface TimelineViewProps {
  properties: DatabaseProperty[];
  records: DatabaseRecord[];
  config: TimelineViewConfig;
  onUpdateRecord: (recordId: string, data: any) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Представление временной шкалы для базы данных
 * Отображает задачи по времени с возможностью drag-n-drop
 */
export const TimelineView: React.FC<TimelineViewProps> = ({
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeUnit, setTimeUnit] = useState(config.time_unit || 'week');

  // Преобразование записей в элементы временной шкалы
  const timelineItems = useMemo((): TimelineItem[] => {
    const startDateProperty = properties.find(p => p.id === config.start_date_property);
    const endDateProperty = properties.find(p => p.id === config.end_date_property);
    const titleProperty = properties.find(p => p.id === config.title_property);
    const groupProperty = config.group_by ? properties.find(p => p.id === config.group_by) : null;

    if (!startDateProperty || !endDateProperty || !titleProperty) return [];

    return records
      .map(record => {
        const startDate = (record as any).properties[config.start_date_property];
        const endDate = (record as any).properties[config.end_date_property];
        
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

        const title = titleProperty ? (record as any).properties[titleProperty.id] || 'Без названия' : 'Без названия';
        const group = groupProperty ? (record as any).properties[groupProperty.id] : undefined;

        // Вычисляем прогресс
        const now = new Date();
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

        return {
          id: record.id,
          title,
          start,
          end,
          record,
          progress: config.show_progress ? progress : undefined,
          group,
          color: getTimelineItemColor(record, group)
        };
      })
      .filter(Boolean) as TimelineItem[];
  }, [records, properties, config]);

  // Группировка элементов по времени
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: TimelineItem[] } = {};
    
    timelineItems.forEach(item => {
      let groupKey: string;
      
      switch (timeUnit) {
        case 'hour':
          groupKey = item.start.toISOString().slice(0, 13); // YYYY-MM-DDTHH
          break;
        case 'day':
          groupKey = item.start.toISOString().slice(0, 10); // YYYY-MM-DD
          break;
        case 'week':
          const weekStart = new Date(item.start);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
          groupKey = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          groupKey = item.start.toISOString().slice(0, 7); // YYYY-MM
          break;
        default:
          groupKey = item.start.toISOString().slice(0, 10);
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    // Сортируем группы по времени
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [timelineItems, timeUnit]);

  // Обработчик drag-n-drop для изменения дат
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const item = timelineItems.find(i => i.id === draggableId);
    if (!item) return;

    // Определяем новую дату на основе destination
    const newDate = new Date(destination.droppableId);
    if (isNaN(newDate.getTime())) return;

    // Вычисляем смещение времени
    const timeOffset = newDate.getTime() - item.start.getTime();
    const newStart = new Date(item.start.getTime() + timeOffset);
    const newEnd = new Date(item.end.getTime() + timeOffset);

    try {
      await onUpdateRecord(item.record.id, {
        properties: {
          ...(item.record as any).properties,
          [config.start_date_property]: newStart.toISOString(),
          [config.end_date_property]: newEnd.toISOString()
        }
      });
    } catch (error) {
      console.error('Ошибка при обновлении дат:', error);
    }
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

  // Навигация по временной шкале
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    switch (timeUnit) {
      case 'hour':
        newDate.setHours(newDate.getHours() - 1);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    switch (timeUnit) {
      case 'hour':
        newDate.setHours(newDate.getHours() + 1);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Получение цвета для элемента
  const getTimelineItemColor = (record: DatabaseRecord, group?: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    
    if (group) {
      const index = group.charCodeAt(0) % colors.length;
      return colors[index];
    }
    
    const index = record.id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Форматирование заголовка группы
  const formatGroupTitle = (groupKey: string): string => {
    const date = new Date(groupKey);
    if (isNaN(date.getTime())) return groupKey;

    switch (timeUnit) {
      case 'hour':
        return date.toLocaleString('ru-RU', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit' 
        });
      case 'day':
        return date.toLocaleDateString('ru-RU', { 
          month: 'short', 
          day: 'numeric' 
        });
      case 'week':
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${date.toLocaleDateString('ru-RU', { day: 'numeric' })} - ${weekEnd.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('ru-RU', { 
          month: 'long', 
          year: 'numeric' 
        });
      default:
        return date.toLocaleDateString('ru-RU');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!config.start_date_property || !config.end_date_property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Не настроены свойства для дат начала и окончания</p>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      {/* Заголовок временной шкалы */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Временная шкала
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Сегодня
            </button>
            
            <button
              onClick={goToNext}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Переключатель единиц времени */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {(['hour', 'day', 'week', 'month'] as const).map(unit => (
            <button
              key={unit}
              onClick={() => setTimeUnit(unit)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeUnit === unit
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {unit === 'hour' ? 'Час' : unit === 'day' ? 'День' : unit === 'week' ? 'Неделя' : 'Месяц'}
            </button>
          ))}
        </div>
      </div>

      {/* Временная шкала */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([groupKey, items]) => (
            <div key={groupKey} className="bg-white rounded-lg border border-gray-200 p-4">
              {/* Заголовок группы */}
              <div className="mb-4 pb-2 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {formatGroupTitle(groupKey)}
                </h3>
                <p className="text-sm text-gray-500">
                  {items.length} {items.length === 1 ? 'задача' : items.length < 5 ? 'задачи' : 'задач'}
                </p>
              </div>

              {/* Элементы группы */}
              <Droppable droppableId={groupKey}>
                {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 p-2 rounded-lg' : ''
                    }`}
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided: any, snapshot: any) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg rotate-1' : ''
                            }`}
                          >
                            {/* Заголовок и прогресс */}
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              {config.show_progress && item.progress !== undefined && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${item.color}`}
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {Math.round(item.progress)}%
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Временные рамки */}
                            <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Начало: {item.start.toLocaleDateString('ru-RU')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Окончание: {item.end.toLocaleDateString('ru-RU')}</span>
                              </div>
                            </div>

                            {/* Дополнительные свойства */}
                            {properties
                              .filter(prop => 
                                prop.id !== config.start_date_property && 
                                prop.id !== config.end_date_property && 
                                prop.id !== config.title_property
                              )
                              .slice(0, 2)
                              .map(property => (
                                <div key={property.id} className="mb-2 last:mb-0">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {property.name}
                                  </div>
                                  <EditableCell
                                    value={(item.record as any).properties[property.id] || ''}
                                    property={property}
                                    isEditing={editingCell?.recordId === item.id && editingCell?.propertyId === property.id}
                                    onStartEdit={() => handleStartEdit(item.id, property.id)}
                                    onSave={(value) => handleSaveCell(item.id, property.id, value)}
                                    onCancel={handleCancelEdit}
                                  />
                                </div>
                              ))}

                            {/* Действия */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-400">
                                {new Date(item.record.updated_at).toLocaleDateString('ru-RU')}
                              </div>
                              <DeleteButton
                                onDelete={() => onDeleteRecord(item.record.id)}
                                tooltip="Удалить задачу"
                                size="sm"
                              />
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

      {/* Сообщение об отсутствии данных */}
      {timelineItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">Нет задач для отображения</p>
          <p className="text-sm text-gray-400 mt-1">
            Создайте задачи с датами начала и окончания
          </p>
        </div>
      )}
    </div>
  );
};
