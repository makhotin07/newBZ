import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateDatabaseRecord } from '../../shared/hooks/useDatabases';
import toast from 'react-hot-toast';

interface DatabaseProperty {
  id: string;
  name: string;
  type: string;
  config?: {
    required?: boolean;
    default?: any;
    options?: string[];
    min?: number;
    max?: number;
  };
}

interface CreateRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  databaseId: string;
  properties: DatabaseProperty[];
}

const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
  isOpen,
  onClose,
  databaseId,
  properties
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const createRecordMutation = useCreateDatabaseRecord(databaseId);

  const translateType = (type: string): string => {
    const map: Record<string, string> = {
      text: 'текст',
      string: 'строка',
      number: 'число',
      boolean: 'булево',
      date: 'дата',
      select: 'выбор',
      multi_select: 'множественный выбор',
      array: 'массив',
    };
    return map[type] || type;
  };

  const translateName = (name: string): string => {
    if (name === 'Title') return 'Заголовок';
    return name;
  };

  useEffect(() => {
    if (isOpen && properties) {
      console.log('CreateRecordModal properties:', properties);
      // Инициализируем форму с дефолтными значениями
      const initialData: Record<string, any> = {};
      properties.forEach((prop: any, index: number) => {
        console.log('Property:', prop);
        if (prop.config?.default !== undefined) {
          initialData[prop.id] = prop.config.default;
        } else if (prop.type === 'boolean') {
          initialData[prop.id] = false;
        } else if (prop.type === 'array') {
          initialData[prop.id] = [];
        }
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, properties]);

  const validateField = (property: any, value: any): string => {
    if (property.config?.required === true && (value === '' || value === null || value === undefined)) {
      return 'Это поле обязательно для заполнения';
    }

    if (property.type === 'number') {
      if (value !== '' && isNaN(Number(value))) {
        return 'Должно быть числом';
      }
      if (property.config?.min !== undefined && Number(value) < property.config.min) {
        return `Минимальное значение: ${property.config.min}`;
      }
      if (property.config?.max !== undefined && Number(value) > property.config.max) {
        return `Максимальное значение: ${property.config.max}`;
      }
    }

    if (property.type === 'string' && property.config?.max !== undefined && value.length > property.config.max) {
      return `Максимальная длина: ${property.config.max} символов`;
    }

    return '';
  };

  const handleFieldChange = (propertyId: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [propertyId]: value }));
    
    // Валидируем поле
    const property = properties.find((p: any, index: number) => p.id === propertyId);
    if (property) {
      const error = validateField(property, value);
      setErrors((prev: any) => ({ ...prev, [propertyId]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидируем все поля
    const newErrors: Record<string, string> = {};
    properties.forEach((prop: any, index: number) => {
      const error = validateField(prop, formData[prop.id]);
      if (error) {
        newErrors[prop.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Отправляем данные
    createRecordMutation.mutate({
      properties: formData
    }, {
      onSuccess: () => {
        toast.success('Запись успешно создана!');
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Ошибка при создании записи');
      }
    });
  };

  const renderField = (property: any) => {
    console.log('renderField property:', property);
    if (!property || typeof property !== 'object') {
      console.warn('Invalid property in renderField:', property);
      return <div className="text-red-500">Ошибка: неверное свойство</div>;
    }
    const value = formData[property.id];
    const error = errors[property.id];

    switch (property.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(property.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={`Введите ${typeof property.name === 'string' ? translateName(property.name).toLowerCase() : 'значение'}`}
          />
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(property.id, e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={`Введите ${typeof property.name === 'string' ? translateName(property.name).toLowerCase() : 'значение'}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(property.id, e.target.value)}
            min={property.config?.min}
            max={property.config?.max}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={`Введите ${typeof property.name === 'string' ? translateName(property.name).toLowerCase() : 'значение'}`}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(property.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Да</span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(property.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(property.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Выберите значение</option>
            {property.config?.options?.map((option: any, index: number) => (
              <option key={index} value={typeof option === 'string' ? option : option.name || option}>
                {typeof option === 'string' ? option : option.name || option}
              </option>
            ))}
          </select>
        );

      case 'array':
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Добавить элемент"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      const newArray = [...(value || []), input.value.trim()];
                      handleFieldChange(property.id, newArray);
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value.map((item: any, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {typeof item === 'string' ? item : item.name || JSON.stringify(item)}
                    <button
                      type="button"
                      onClick={() => {
                        const newArray = value.filter((_, i) => i !== index);
                        handleFieldChange(property.id, newArray);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(property.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={`Введите ${typeof property.name === 'string' ? property.name.toLowerCase() : 'значение'}`}
          />
        );
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Добавить запись
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {properties.map((property: any) => {
                    console.log('Rendering property:', property);
                    if (!property || typeof property !== 'object') {
                      console.warn('Invalid property:', property);
                      return null;
                    }
                    return (
                      <div key={property.id || 'неизвестно'}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {typeof property.name === 'string' ? property.name : 'Без названия'}
                          {property.config?.required === true && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                          <span className="text-xs text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded">
                            {typeof property.type === 'string' ? translateType(property.type) : 'Неизвестный тип'}
                          </span>
                        </label>
                        {renderField(property)}
                        {errors[property.id] && (
                          <p className="mt-1 text-sm text-red-600">{errors[property.id]}</p>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={createRecordMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {createRecordMutation.isPending ? 'Создание...' : 'Создать запись'}
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

export default CreateRecordModal;
