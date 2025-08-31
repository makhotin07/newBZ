import React, { useState, useRef, useEffect } from 'react';
import type { DatabaseProperty } from '../types/database';

interface EditableCellProps {
  value: any;
  property: DatabaseProperty;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: any) => void;
  onCancel: () => void;
}

/**
 * Компонент редактируемой ячейки таблицы
 * Поддерживает разные типы данных: текст, число, дата, checkbox, select
 */
export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  property,
  isEditing,
  onStartEdit,
  onSave,
  onCancel
}) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  // Обновляем локальное значение при изменении props
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Фокус на input при начале редактирования
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement && inputRef.current.type === 'text') {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // Обработчик начала редактирования
  const handleStartEdit = () => {
    onStartEdit();
  };

  // Обработчик сохранения
  const handleSave = () => {
    let processedValue = editValue;

    // Обработка разных типов данных
    switch (property.type) {
      case 'number':
        processedValue = editValue === '' ? null : Number(editValue);
        break;
      case 'checkbox':
        processedValue = Boolean(editValue);
        break;
      case 'date':
        processedValue = editValue || null;
        break;
      default:
        processedValue = editValue || '';
    }

    onSave(processedValue);
  };

  // Обработчик отмены
  const handleCancel = () => {
    setEditValue(value);
    onCancel();
  };

  // Обработчик нажатия Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Обработчик клика вне ячейки
  const handleBlur = () => {
    // Небольшая задержка для обработки клика по кнопкам
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  };

  // Если не редактируем, показываем значение
  if (!isEditing) {
    return (
      <div
        className="min-h-[24px] flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
        onClick={handleStartEdit}
      >
        {renderCellValue(value, property)}
      </div>
    );
  }

  // Рендер input для редактирования
  return (
    <div className="px-2 py-1">
      {renderEditInput(property, editValue, setEditValue, inputRef, handleKeyDown, handleBlur)}
    </div>
  );
};

/**
 * Рендер значения ячейки в режиме просмотра
 */
function renderCellValue(value: any, property: DatabaseProperty): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 italic">—</span>;
  }

  switch (property.type) {
    case 'checkbox':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={Boolean(value)}
            readOnly
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>
      );
    
    case 'date':
      return (
        <span className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString('ru-RU')}
        </span>
      );
    
    case 'select':
    case 'multi_select':
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {item}
              </span>
            ))}
          </div>
        );
      }
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {value}
        </span>
      );
    
    case 'number':
      return (
        <span className="text-sm text-gray-900 font-mono">
          {Number(value).toLocaleString('ru-RU')}
        </span>
      );
    
    default:
      return (
        <span className="text-sm text-gray-900 truncate max-w-[200px]">
          {String(value)}
        </span>
      );
  }
}

/**
 * Рендер input для редактирования
 */
function renderEditInput(
  property: DatabaseProperty,
  value: any,
  setValue: (value: any) => void,
  ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  onKeyDown: (e: React.KeyboardEvent) => void,
  onBlur: () => void
): React.ReactNode {
  switch (property.type) {
    case 'checkbox':
      return (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => setValue(e.target.checked)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
      );

    case 'date':
      return (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type="date"
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      );

    case 'select':
      return (
        <select
          ref={ref as React.RefObject<HTMLSelectElement>}
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Выберите значение</option>
          {property.options?.map((option) => (
            <option key={option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      );

    case 'multi_select':
      return (
        <div className="space-y-2">
          {property.options?.map((option) => (
            <label key={option.name} className="flex items-center">
              <input
                type="checkbox"
                checked={Array.isArray(value) ? value.includes(option.name) : false}
                onChange={(e) => {
                  const currentValues = Array.isArray(value) ? [...value] : [];
                  if (e.target.checked) {
                    setValue([...currentValues, option.name]);
                  } else {
                    setValue(currentValues.filter(v => v !== option.name));
                  }
                }}
                className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
              />
              <span className="text-sm text-gray-700">{option.name}</span>
            </label>
          ))}
        </div>
      );

    case 'number':
      return (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type="number"
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      );

    default:
      return (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type="text"
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      );
  }
}
