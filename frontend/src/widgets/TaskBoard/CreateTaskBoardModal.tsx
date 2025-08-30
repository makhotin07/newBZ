import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateTaskBoard } from '../../shared/hooks/useTasks';


interface CreateTaskBoardModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskBoardModal: React.FC<CreateTaskBoardModalProps> = ({ workspaceId, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const createTaskBoardMutation = useCreateTaskBoard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    try {
      await createTaskBoardMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        workspace: workspaceId,
      });

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to create task board:', error);
    }
  };

  const handleClose = () => {
    if (!createTaskBoardMutation.isPending) {
      setFormData({
        title: '',
        description: '',
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
                  Создать доску
                  <button
                    onClick={handleClose}
                    disabled={createTaskBoardMutation.isPending}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Название доски *
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Моя доска задач"
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
                        placeholder="Опишите назначение этой доски..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        maxLength={500}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      Новая доска будет создана с колонками по умолчанию: "К выполнению", "В работе", "На проверке" и "Готово".
                      Эти колонки можно изменить после создания.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={createTaskBoardMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 disabled:opacity-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.title.trim() || createTaskBoardMutation.isPending}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createTaskBoardMutation.isPending ? 'Создание...' : 'Создать доску'}
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

export default CreateTaskBoardModal;
