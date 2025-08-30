import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateWorkspace } from '../../shared/hooks/useWorkspaces';
import EmojiPicker from '../../shared/ui/EmojiPicker';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#6366F1',
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const createWorkspaceMutation = useCreateWorkspace();

  const predefinedColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      await createWorkspaceMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon || undefined,
        color: formData.color,
      });

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        icon: '',
        color: '#6366F1',
      });
      onClose();
    } catch (error) {
      console.error('Не удалось создать рабочее пространство:', error);
    }
  };

  const handleClose = () => {
    if (!createWorkspaceMutation.isPending) {
      setFormData({
        name: '',
        description: '',
        icon: '',
        color: '#6366F1',
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
                  Создать пространство
                  <button
                    onClick={handleClose}
                    disabled={createWorkspaceMutation.isPending}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    {/* Icon and Color */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: formData.color }}
                        >
                          {formData.icon || formData.name.charAt(0) || '?'}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Цвет
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, color }))}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                formData.color === color
                                  ? 'border-gray-400 scale-110'
                                  : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Название пространства *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Моё рабочее пространство"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
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
                        placeholder="Для чего это пространство?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        maxLength={500}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={createWorkspaceMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 disabled:opacity-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.name.trim() || createWorkspaceMutation.isPending}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createWorkspaceMutation.isPending ? 'Создание...' : 'Создать пространство'}
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

export default CreateWorkspaceModal;
