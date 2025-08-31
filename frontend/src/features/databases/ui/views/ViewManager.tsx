import React, { useState } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  Cog6ToothIcon,
  TableCellsIcon,
  ViewColumnsIcon,
  CalendarIcon,
  ListBulletIcon,
  PhotoIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Modal, EmptyState, Tooltip } from '../../../../shared/ui';
import type { DatabaseView, ViewType } from '../../types/views';

interface ViewManagerProps {
  views: DatabaseView[];
  currentView: DatabaseView | null;
  onViewChange: (view: DatabaseView) => void;
  onCreateView: (viewData: Partial<DatabaseView>) => Promise<void>;
  onUpdateView: (viewId: string, viewData: Partial<DatabaseView>) => Promise<void>;
  onDeleteView: (viewId: string) => Promise<void>;
  className?: string;
}

/**
 * Менеджер представлений базы данных
 * Позволяет создавать, редактировать и переключаться между представлениями
 */
export const ViewManager: React.FC<ViewManagerProps> = ({
  views,
  currentView,
  onViewChange,
  onCreateView,
  onUpdateView,
  onDeleteView,
  className = ''
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingView, setEditingView] = useState<DatabaseView | null>(null);
  const [newViewData, setNewViewData] = useState<Partial<DatabaseView>>({
    name: '',
    type: 'table',
    config: {}
  });

  // Получение иконки для типа представления
  const getViewIcon = (type: ViewType) => {
    switch (type) {
      case 'table':
        return <TableCellsIcon className="w-5 h-5" />;
      case 'board':
        return <ViewColumnsIcon className="w-5 h-5" />;
      case 'calendar':
        return <CalendarIcon className="w-5 h-5" />;
      case 'list':
        return <ListBulletIcon className="w-5 h-5" />;
      case 'gallery':
        return <PhotoIcon className="w-5 h-5" />;
      case 'timeline':
        return <ClockIcon className="w-5 h-5" />;
      default:
        return <TableCellsIcon className="w-5 h-5" />;
    }
  };

  // Получение названия типа представления
  const getViewTypeName = (type: ViewType) => {
    switch (type) {
      case 'table':
        return 'Таблица';
      case 'board':
        return 'Доска';
      case 'calendar':
        return 'Календарь';
      case 'list':
        return 'Список';
      case 'gallery':
        return 'Галерея';
      case 'timeline':
        return 'Временная шкала';
      default:
        return 'Неизвестно';
    }
  };

  // Обработчик создания представления
  const handleCreateView = async () => {
    try {
      await onCreateView(newViewData);
      setNewViewData({ name: '', type: 'table', config: {} });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Ошибка при создании представления:', error);
    }
  };

  // Обработчик редактирования представления
  const handleEditView = async () => {
    if (!editingView) return;
    
    try {
      await onUpdateView(editingView.id, editingView);
      setEditingView(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Ошибка при обновлении представления:', error);
    }
  };

  // Обработчик удаления представления
  const handleDeleteView = async (viewId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это представление?')) return;
    
    try {
      await onDeleteView(viewId);
    } catch (error) {
      console.error('Ошибка при удалении представления:', error);
    }
  };

  // Обработчик начала редактирования
  const handleStartEdit = (view: DatabaseView) => {
    setEditingView({ ...view });
    setShowEditModal(true);
  };

  return (
    <div className={`${className} space-y-4`}>
      {/* Заголовок и кнопка создания */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Представления</h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={<PlusIcon className="w-4 h-4" />}
          size="sm"
        >
          Новое представление
        </Button>
      </div>

      {/* Список представлений */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {views.map(view => (
          <div
            key={view.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              currentView?.id === view.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onViewChange(view)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getViewIcon(view.type)}
                <div>
                  <h4 className="font-medium text-gray-900">{view.name}</h4>
                  <p className="text-sm text-gray-500">{getViewTypeName(view.type)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Tooltip content="Редактировать представление">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(view);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Удалить представление">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteView(view.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Создал {view.created_by_name} • {new Date(view.created_at).toLocaleDateString('ru-RU')}
            </div>
          </div>
        ))}
      </div>

      {/* Пустое состояние */}
      {views.length === 0 && (
        <EmptyState
          icon={<ViewColumnsIcon className="w-12 h-12" />}
          title="Нет представлений"
          description="Создайте первое представление для начала работы с базой данных"
          action={{
            label: 'Создать первое представление',
            onClick: () => setShowCreateModal(true)
          }}
        />
      )}

      {/* Модальное окно создания представления */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создать новое представление"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название
            </label>
            <Input
              value={newViewData.name || ''}
              onChange={(e) => setNewViewData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите название представления"
              isRequired
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип представления
            </label>
            <select
              value={newViewData.type || 'table'}
              onChange={(e) => setNewViewData(prev => ({ ...prev, type: e.target.value as ViewType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="table">Таблица</option>
              <option value="board">Доска (Kanban)</option>
              <option value="calendar">Календарь</option>
              <option value="list">Список</option>
              <option value="gallery">Галерея</option>
              <option value="timeline">Временная шкала</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateView}
              disabled={!newViewData.name}
            >
              Создать
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно редактирования представления */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Редактировать представление"
        size="lg"
      >
        {editingView && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <Input
                value={editingView.name}
                onChange={(e) => setEditingView(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Введите название представления"
                isRequired
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип представления
              </label>
              <select
                value={editingView.type}
                onChange={(e) => setEditingView(prev => prev ? { ...prev, type: e.target.value as ViewType } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="table">Таблица</option>
                <option value="board">Доска (Kanban)</option>
                <option value="calendar">Календарь</option>
                <option value="list">Список</option>
                <option value="gallery">Галерея</option>
                <option value="timeline">Временная шкала</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Отмена
              </Button>
              <Button
                onClick={handleEditView}
                disabled={!editingView.name}
              >
                Сохранить
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ViewManager;
