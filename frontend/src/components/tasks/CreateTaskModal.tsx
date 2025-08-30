import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, UserIcon, TagIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useCreateTask, useBoardColumns } from '../../shared/hooks/useTasks';
import { useTags } from '../../shared/hooks/useNotes';
import TagSelector from '../../shared/ui/TagSelector';
import { CreateTaskData } from '../../features/tasks/api';
import { ru } from '../../shared/config/locales/ru';

interface CreateTaskModalProps {
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ boardId, columnId, isOpen, onClose }) => {
  const [formData, setFormData] = useState<Partial<CreateTaskData>>({
    title: '',
    description: '',
    column: columnId,
    priority: 'medium',
    assignee_ids: [],
    tag_ids: [],
    due_date: '',
    start_date: '',
    estimated_hours: undefined,
  });

  const { data: columns = [] } = useBoardColumns(boardId);
  const { data: tags = [] } = useTags();
  const createTaskMutation = useCreateTask(boardId);

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) return;

    try {
      // Prepare data, filtering out empty values
      const taskData = {
        ...formData,
        board: boardId, // Добавляем board_id
        title: formData.title!.trim(),
        description: formData.description?.trim() || undefined,
        due_date: formData.due_date || undefined,
        start_date: formData.start_date || undefined,
        estimated_hours: formData.estimated_hours || undefined,
      };
      
      // Remove undefined values
      Object.keys(taskData).forEach(key => {
        if (taskData[key as keyof typeof taskData] === undefined || taskData[key as keyof typeof taskData] === '') {
          delete (taskData as any)[key];
        }
      });
      
      await createTaskMutation.mutateAsync(taskData as CreateTaskData);
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        column: columnId,
        priority: 'medium',
        assignee_ids: [],
        tag_ids: [],
        due_date: '',
        start_date: '',
        estimated_hours: undefined,
      });
      onClose();
    } catch (error) {
      console.error('Не удалось создать задачу:', error);
    }
  };

  const handleClose = () => {
    if (!createTaskMutation.isPending) {
      setFormData({
        title: '',
        description: '',
        column: columnId,
        priority: 'medium',
        assignee_ids: [],
        tag_ids: [],
        due_date: '',
        start_date: '',
        estimated_hours: undefined,
      });
      onClose();
    }
  };

  const selectedTags = tags.filter((tag: any) => formData.tag_ids?.includes(tag.id));

  return (
    <Dialog as="div" className="relative z-50" onClose={handleClose} open={isOpen}>
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-between"
                >
                  Создать новую задачу
                  <button
                    onClick={handleClose}
                    disabled={createTaskMutation.isPending}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Название задачи *
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                        placeholder="Введите название задачи..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                      </label>
                      <textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                        placeholder="Опишите задачу..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Column and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="column" className="block text-sm font-medium text-gray-700 mb-1">
                          Колонка
                        </label>
                        <select
                          id="column"
                          value={formData.column}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, column: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {columns.map((column: any) => (
                            <option key={column.id} value={column.id}>
                              {column.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                          Приоритет
                        </label>
                        <select
                          id="priority"
                          value={formData.priority}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {priorities.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                          <CalendarIcon className="w-4 h-4 inline mr-1" />
                          Дата начала
                        </label>
                        <input
                          id="start_date"
                          type="date"
                          value={formData.start_date || ''}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, start_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                          <CalendarIcon className="w-4 h-4 inline mr-1" />
                          Срок выполнения
                        </label>
                        <input
                          id="due_date"
                          type="date"
                          value={formData.due_date || ''}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, due_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Estimated Hours */}
                    <div>
                      <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Оценка часов
                      </label>
                      <input
                        id="estimated_hours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.estimated_hours || ''}
                                                onChange={(e) => setFormData((prev: any) => ({ 
                          ...prev, 
                          estimated_hours: e.target.value ? parseFloat(e.target.value) : undefined
                        }))}
                        placeholder="0.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <TagIcon className="w-4 h-4 inline mr-1" />
                        Теги
                      </label>
                      <TagSelector
                        selectedTags={selectedTags}
                        onChange={(tagIds) => setFormData((prev: any) => ({ ...prev, tag_ids: tagIds }))}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={createTaskMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 disabled:opacity-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.title?.trim() || createTaskMutation.isPending}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createTaskMutation.isPending ? 'Создание...' : 'Создать задачу'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Dialog>
  );
};

export default CreateTaskModal;
