import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateDatabase } from '../../hooks/useDatabases';
import EmojiPicker from '../ui/EmojiPicker';

interface CreateDatabaseModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CreateDatabaseModal: React.FC<CreateDatabaseModalProps> = ({ workspaceId, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    default_view: 'table' as 'table' | 'gallery' | 'list' | 'board' | 'calendar',
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const createDatabaseMutation = useCreateDatabase();

  const viewTypes = [
    { value: 'table', label: 'Таблица', description: 'Классическое табличное представление' },
    { value: 'gallery', label: 'Галерея', description: 'Карточный визуальный вид' },
    { value: 'list', label: 'Список', description: 'Простой список с ключевыми свойствами' },
    { value: 'board', label: 'Доска', description: 'Канбан‑представление' },
    { value: 'calendar', label: 'Календарь', description: 'Календарный вид с датами' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    try {
      await createDatabaseMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon || undefined,
        workspace: workspaceId,
        default_view: formData.default_view,
      });

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        icon: '',
        default_view: 'table',
      });
      onClose();
    } catch (error) {
      console.error('Failed to create database:', error);
    }
  };

  const handleClose = () => {
    if (!createDatabaseMutation.isPending) {
      setFormData({
        title: '',
        description: '',
        icon: '',
        default_view: 'table',
      });
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-between"
                >
                  Создать базу
                  <button
                    onClick={handleClose}
                    disabled={createDatabaseMutation.isPending}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-300"
                        >
                          {formData.icon || '📊'}
                        </button>
                        
                        {showEmojiPicker && (
                          <div className="absolute top-full left-0 mt-2 z-20">
                            <EmojiPicker
                              onEmojiSelect={(emoji) => {
                                setFormData(prev => ({ ...prev, icon: emoji }));
                                setShowEmojiPicker(false);
                              }}
                              onClose={() => setShowEmojiPicker(false)}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Нажмите, чтобы добавить иконку
                        </label>
                        <p className="text-xs text-gray-500">
                          Выберите эмодзи для представления базы
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Название базы *
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Моя база"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        autoFocus
                        maxLength={100}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Описание (необязательно)
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Опишите назначение этой базы..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        maxLength={500}
                      />
                    </div>

                    {/* Default View */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Представление по умолчанию
                      </label>
                      <div className="space-y-2">
                        {viewTypes.map((viewType) => (
                          <label
                            key={viewType.value}
                            className={`flex items-start space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${
                              formData.default_view === viewType.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              value={viewType.value}
                              checked={formData.default_view === viewType.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, default_view: e.target.value as any }))}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {viewType.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {viewType.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      Новая база будет создана со свойством "Title" по умолчанию.
                      Вы сможете добавить свойства и настроить базу после создания.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={createDatabaseMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 disabled:opacity-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.title.trim() || createDatabaseMutation.isPending}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createDatabaseMutation.isPending ? 'Создание...' : 'Создать базу'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateDatabaseModal;
