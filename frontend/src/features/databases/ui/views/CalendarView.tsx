import React, { useMemo, useState } from 'react';
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// Временные заглушки для react-beautiful-dnd
const DragDropContext = ({ children, onDragEnd }: any) => <div>{children}</div>;
const Droppable = ({ children, droppableId }: any) => <div data-droppable-id={droppableId}>{children}</div>;
const Draggable = ({ children, draggableId, index }: any) => <div data-draggable-id={draggableId} data-index={index}>{children}</div>;
type DropResult = any;
import type { DatabaseProperty, DatabaseRecord } from '../../types/database';
import { CalendarViewConfig, CalendarEvent } from '../../types/views';
import { EditableCell } from '../EditableCell';
import { DeleteButton } from '../DeleteButton';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

interface CalendarViewProps {
  properties: DatabaseProperty[];
  records: DatabaseRecord[];
  config: CalendarViewConfig;
  onUpdateRecord: (recordId: string, data: any) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Представление календаря для базы данных
 * Отображает записи по полю типа date с возможностью drag-n-drop
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
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
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>(config.default_view || 'month');

  // Преобразование записей в события календаря
  const calendarEvents = useMemo((): CalendarEvent[] => {
    const dateProperty = properties.find(p => p.id === config.date_property);
    if (!dateProperty) return [];

    return records
      .map(record => {
        const dateValue = (record as any).properties[config.date_property];
        if (!dateValue) return null;

        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return null;

        // Находим свойство для заголовка
        const titleProperty = properties.find(p => p.type === 'text') || properties[0];
        const title = titleProperty ? (record as any).properties[titleProperty.id] || 'Без названия' : 'Без названия';

        return {
          id: record.id,
          title,
          start: date,
          end: new Date(date.getTime() + 60 * 60 * 1000), // +1 час по умолчанию
          record,
          color: getEventColor(record)
        };
      })
      .filter(Boolean) as CalendarEvent[];
  }, [records, properties, config.date_property]);

  // Генерация календарной сетки
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (viewMode === 'month') {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      const current = new Date(startDate);
      
      while (current <= lastDay || days.length < 42) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      
      return days;
    }
    
    return [];
  }, [currentDate, viewMode]);

  // Получение событий для конкретной даты
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toDateString();
    return calendarEvents.filter(event => event.start.toDateString() === dateStr);
  };

  // Обработчик drag-n-drop для изменения даты
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const event = calendarEvents.find(e => e.id === draggableId);
    if (!event) return;

    // Определяем новую дату на основе destination
    const newDate = new Date(destination.droppableId);
    if (isNaN(newDate.getTime())) return;

    try {
      await onUpdateRecord(event.record.id, {
        properties: {
          ...event.record.properties,
          [config.date_property]: newDate.toISOString()
        }
      });
    } catch (error) {
      console.error('Ошибка при обновлении даты:', error);
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

  // Навигация по календарю
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Получение цвета для события
  const getEventColor = (record: DatabaseRecord): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    
    const index = record.id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!config.date_property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Не настроено свойство для даты</p>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      {/* Заголовок календаря */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
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
              onClick={goToNextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Переключатель режимов */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'day'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === mode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode === 'month' ? 'Месяц' : mode === 'week' ? 'Неделя' : 'День'}
            </button>
          ))}
        </div>
      </div>

      {/* Календарная сетка */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Дни недели */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Календарные дни */}
          <div className="grid grid-cols-7">
            {calendarGrid.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const events = getEventsForDate(date);

              return (
                <Droppable key={date.toISOString()} droppableId={date.toISOString()}>
                                  {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                      !isCurrentMonth ? 'bg-gray-50' : ''
                    } ${isToday ? 'bg-blue-50' : ''} ${
                      snapshot.isDraggingOver ? 'bg-blue-100' : ''
                    }`}
                  >
                      {/* Номер дня */}
                      <div className={`text-sm font-medium mb-2 ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-blue-600' : ''}`}>
                        {date.getDate()}
                      </div>

                      {/* События дня */}
                      <div className="space-y-1">
                        {events.map((event, eventIndex) => (
                          <Draggable key={event.id} draggableId={event.id} index={eventIndex}>
                            {(provided: any, snapshot: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-2 rounded text-xs text-white cursor-move ${
                                  event.color
                                } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                title={event.title}
                              >
                                <div className="truncate font-medium">{event.title}</div>
                                {config.show_time && (
                                  <div className="text-xs opacity-75">
                                    {event.start.toLocaleTimeString('ru-RU', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};
