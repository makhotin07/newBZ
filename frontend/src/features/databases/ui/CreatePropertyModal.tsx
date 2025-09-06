import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCreateDatabaseProperty } from '../hooks/useDatabaseProperty';
import toast from 'react-hot-toast';

interface CreatePropertyModalProps {
  databaseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_TYPES = [
  { value: 'text', label: 'Текст', description: 'Однострочный текст' },
  { value: 'textarea', label: 'Длинный текст', description: 'Многострочный текст' },
  { value: 'number', label: 'Число', description: 'Числовое значение' },
  { value: 'select', label: 'Выбор', description: 'Выпадающий список' },
  { value: 'multi_select', label: 'Множественный выбор', description: 'Несколько значений' },
  { value: 'date', label: 'Дата', description: 'Дата' },
  { value: 'datetime', label: 'Дата и время', description: 'Дата и время' },
  { value: 'checkbox', label: 'Чекбокс', description: 'Да/Нет' },
  { value: 'url', label: 'Ссылка', description: 'URL адрес' },
  { value: 'email', label: 'Email', description: 'Email адрес' },
  { value: 'phone', label: 'Телефон', description: 'Номер телефона' },
  { value: 'formula', label: 'Формула', description: 'Вычисляемое поле' },
  { value: 'relation', label: 'Связь', description: 'Связь с другой базой' },
];

const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({
  databaseId,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'text',
    description: '',
    required: false,
    unique: false,
    options: [] as string[],
    formula: '',
    relation_database: '',
  });

  const [newOption, setNewOption] = useState('');

  const createPropertyMutation = useCreateDatabaseProperty(databaseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Название свойства обязательно');
      return;
    }

    try {
      const propertyData: any = {
        name: formData.name.trim(),
        type: formData.type,
        config: {
          required: formData.required,
          unique: formData.unique,
        },
      };

      // Добавляем описание в config, если оно есть
      if (formData.description.trim()) {
        propertyData.config.description = formData.description.trim();
      }

      // Добавляем специфичные настройки для разных типов
      if (['select', 'multi_select'].includes(formData.type) && formData.options.length > 0) {
        propertyData.config.options = formData.options;
      }

      if (formData.type === 'formula' && formData.formula.trim()) {
        propertyData.config.expression = formData.formula.trim();
      }

      if (formData.type === 'relation' && formData.relation_database.trim()) {
        propertyData.config.relation_database = formData.relation_database.trim();
      }

      await createPropertyMutation.mutateAsync(propertyData);
      
      toast.success('Свойство создано успешно!');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при создании свойства');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'text',
      description: '',
      required: false,
      unique: false,
      options: [],
      formula: '',
      relation_database: '',
    });
    setNewOption('');
    onClose();
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (option: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(o => o !== option)
    }));
  };

  const isOptionsType = ['select', 'multi_select'].includes(formData.type);
  const isFormulaType = formData.type === 'formula';
  const isRelationType = formData.type === 'relation';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
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
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-between"
                >
                  Добавить свойство
                  <button
                    onClick={handleClose}
                    disabled={createPropertyMutation.isPending}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    {/* Название свойства */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название свойства *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Например: Статус, Приоритет, Дата"
                        required
                      />
                    </div>

                    {/* Тип свойства */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Тип свойства
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {PROPERTY_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} - {type.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Описание */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Описание свойства (необязательно)"
                        rows={2}
                      />
                    </div>

                    {/* Опции для select/multi_select */}
                    {isOptionsType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Варианты выбора
                        </label>
                        <div className="space-y-2">
                          {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                                {option}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeOption(option)}
                                className="px-2 py-1 text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newOption}
                              onChange={(e) => setNewOption(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Добавить вариант"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                            />
                            <button
                              type="button"
                              onClick={addOption}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Формула для formula */}
                    {isFormulaType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Формула
                        </label>
                        <input
                          type="text"
                          value={formData.formula}
                          onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Например: prop('field1') * prop('field2')"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Используйте prop(&apos;название_поля&apos;) для ссылки на другие поля
                        </p>
                      </div>
                    )}

                    {/* База данных для relation */}
                    {isRelationType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID связанной базы данных
                        </label>
                        <input
                          type="text"
                          value={formData.relation_database}
                          onChange={(e) => setFormData(prev => ({ ...prev, relation_database: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="UUID связанной базы данных"
                        />
                      </div>
                    )}

                    {/* Настройки */}
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.required}
                          onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Обязательное поле</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.unique}
                          onChange={(e) => setFormData(prev => ({ ...prev, unique: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Уникальное значение</span>
                      </label>
                    </div>
                  </div>

                  {/* Кнопки */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={createPropertyMutation.isPending}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={createPropertyMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createPropertyMutation.isPending ? 'Создание...' : 'Создать свойство'}
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

export default CreatePropertyModal;
