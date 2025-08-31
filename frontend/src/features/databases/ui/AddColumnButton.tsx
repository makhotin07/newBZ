import React, { useState } from 'react';
import type { DatabaseProperty } from '../types/database';

interface AddColumnButtonProps {
  onAdd: (propertyData: Partial<DatabaseProperty>) => void;
  className?: string;
}

/**
 * Кнопка для добавления новой колонки в таблицу
 * Открывает модальное окно с формой создания свойства
 */
export const AddColumnButton: React.FC<AddColumnButtonProps> = ({ onAdd, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<DatabaseProperty>>({
    name: '',
    type: 'text',
    position: 1,
    config: {}
  });

  const propertyTypes = [
    { value: 'text', label: 'Текст' },
    { value: 'number', label: 'Число' },
    { value: 'date', label: 'Дата' },
    { value: 'checkbox', label: 'Флажок' },
    { value: 'select', label: 'Выбор' },
    { value: 'multi_select', label: 'Множественный выбор' },
    { value: 'url', label: 'Ссылка' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Телефон' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      alert('Введите название колонки');
      return;
    }

    onAdd(formData);
    setIsModalOpen(false);
    setFormData({ name: '', type: 'text', position: 1, config: {} });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({ name: '', type: 'text', position: 1, config: {} });
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md
          text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200
          ${className}
        `}
        title="Добавить новую колонку"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Добавить колонку
      </button>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Добавить новую колонку
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Название колонки */}
                <div>
                  <label htmlFor="property-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    id="property-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Введите название колонки"
                    required
                  />
                </div>

                {/* Тип данных */}
                <div>
                  <label htmlFor="property-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Тип данных
                  </label>
                  <select
                    id="property-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Позиция */}
                <div>
                  <label htmlFor="property-position" className="block text-sm font-medium text-gray-700 mb-1">
                    Позиция
                  </label>
                  <input
                    type="number"
                    id="property-position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                  />
                </div>

                {/* Кнопки */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Добавить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
