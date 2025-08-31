import React, { useState, useRef, useEffect } from 'react';
import { DatabaseProperty } from '../../types/database';

interface FormulaEditorProps {
  expression: string;
  onChange: (expression: string) => void;
  properties: DatabaseProperty[];
  onValidate?: (valid: boolean, error?: string) => void;
  placeholder?: string;
  className?: string;
}

interface SuggestionItem {
  type: 'property' | 'function';
  name: string;
  description: string;
  insertText: string;
}

/**
 * Редактор формул с автодополнением и подсветкой синтаксиса
 */
export const FormulaEditor: React.FC<FormulaEditorProps> = ({
  expression,
  onChange,
  properties,
  onValidate,
  placeholder = "Введите формулу, например: prop('Price') * prop('Quantity')",
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [error, setError] = useState<string>('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Доступные функции в формулах
  const functions: SuggestionItem[] = [
    {
      type: 'function',
      name: 'prop',
      description: 'Получить значение свойства',
      insertText: "prop('')"
    },
    {
      type: 'function',
      name: 'if',
      description: 'Условный оператор',
      insertText: "if(condition, true_value, false_value)"
    },
    {
      type: 'function',
      name: 'format',
      description: 'Форматировать число',
      insertText: "format(number, 'format')"
    },
    {
      type: 'function',
      name: 'date',
      description: 'Работа с датами',
      insertText: "date('')"
    },
    {
      type: 'function',
      name: 'concat',
      description: 'Объединить строки',
      insertText: "concat(text1, text2)"
    },
    {
      type: 'function',
      name: 'length',
      description: 'Длина строки',
      insertText: "length(text)"
    },
    {
      type: 'function',
      name: 'round',
      description: 'Округлить число',
      insertText: "round(number, digits)"
    },
    {
      type: 'function',
      name: 'abs',
      description: 'Абсолютное значение',
      insertText: "abs(number)"
    },
    {
      type: 'function',
      name: 'max',
      description: 'Максимальное значение',
      insertText: "max(value1, value2)"
    },
    {
      type: 'function',
      name: 'min',
      description: 'Минимальное значение',
      insertText: "min(value1, value2)"
    }
  ];

  // Получение предложений для автодополнения
  const getSuggestions = (input: string, position: number): SuggestionItem[] => {
    const beforeCursor = input.slice(0, position);
    const match = beforeCursor.match(/(\w+)$/);
    
    if (!match) return [];
    
    const query = match[1].toLowerCase();
    const suggestions: SuggestionItem[] = [];

    // Добавляем функции
    functions.forEach(func => {
      if (func.name.toLowerCase().includes(query)) {
        suggestions.push(func);
      }
    });

    // Добавляем свойства
    properties.forEach(prop => {
      if (prop.name.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'property',
          name: prop.name,
          description: `${prop.type} свойство`,
          insertText: `prop('${prop.name}')`
        });
      }
    });

    return suggestions.slice(0, 10);
  };

  // Обработка изменения текста
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(position);
    
    // Получаем предложения для автодополнения
    const newSuggestions = getSuggestions(newValue, position);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedSuggestion(0);
    
    // Валидация (с задержкой)
    setTimeout(() => validateFormula(newValue), 300);
  };

  // Валидация формулы
  const validateFormula = (formula: string) => {
    if (!formula.trim()) {
      setError('');
      onValidate?.(true);
      return;
    }

    try {
      // Простая валидация синтаксиса
      const hasMatchingParentheses = (formula.match(/\(/g) || []).length === (formula.match(/\)/g) || []).length;
      const hasMatchingQuotes = (formula.match(/'/g) || []).length % 2 === 0;
      
      if (!hasMatchingParentheses) {
        throw new Error('Несоответствие скобок');
      }
      
      if (!hasMatchingQuotes) {
        throw new Error('Несоответствие кавычек');
      }

      // Проверка существования свойств
      const propMatches = formula.match(/prop\(['"]([^'"]+)['"]\)/g);
      if (propMatches) {
        for (const match of propMatches) {
          const propName = match.match(/prop\(['"]([^'"]+)['"]\)/)?.[1];
          if (propName && !properties.find(p => p.name === propName)) {
            throw new Error(`Свойство "${propName}" не найдено`);
          }
        }
      }

      setError('');
      onValidate?.(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка в формуле';
      setError(errorMessage);
      onValidate?.(false, errorMessage);
    }
  };

  // Обработка нажатий клавиш
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        insertSuggestion(suggestions[selectedSuggestion]);
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Вставка предложения
  const insertSuggestion = (suggestion: SuggestionItem) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const beforeCursor = expression.slice(0, cursorPosition);
    const afterCursor = expression.slice(cursorPosition);
    
    // Находим начало текущего слова
    const match = beforeCursor.match(/(\w+)$/);
    const wordStart = match ? cursorPosition - match[1].length : cursorPosition;
    
    // Формируем новое значение
    const newValue = 
      expression.slice(0, wordStart) + 
      suggestion.insertText + 
      afterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Устанавливаем курсор после вставки
    setTimeout(() => {
      const newPosition = wordStart + suggestion.insertText.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  // Обработка клика по предложению
  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    insertSuggestion(suggestion);
  };

  // Подсветка синтаксиса (упрощенная)
  const highlightSyntax = (text: string) => {
    return text
      .replace(/\b(prop|if|format|date|concat|length|round|abs|max|min)\b/g, '<span class="text-blue-600 font-semibold">$1</span>')
      .replace(/'([^']*)'/g, '<span class="text-green-600">\'$1\'</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="text-purple-600">$1</span>');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Основной редактор */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={expression}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full p-3 border rounded-lg font-mono text-sm resize-none ${
            error ? 'border-red-300' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          rows={3}
          spellCheck={false}
        />
        
        {/* Подсказки по функциям */}
        <div className="mt-2 text-xs text-gray-500">
          <span className="font-semibold">Примеры:</span>
          <code className="ml-2 px-1 bg-gray-100 rounded">prop('Price') * 1.2</code>
          <code className="ml-2 px-1 bg-gray-100 rounded">if(prop('Status') = 'Done', 'Готово', 'В работе')</code>
        </div>
      </div>

      {/* Автодополнение */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.name}`}
              className={`px-3 py-2 cursor-pointer flex items-center space-x-2 ${
                index === selectedSuggestion ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {suggestion.name}
                  {suggestion.type === 'function' && (
                    <span className="ml-1 text-xs text-blue-600 font-normal">функция</span>
                  )}
                  {suggestion.type === 'property' && (
                    <span className="ml-1 text-xs text-green-600 font-normal">свойство</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{suggestion.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ошибка валидации */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          <span className="font-semibold">Ошибка:</span> {error}
        </div>
      )}
    </div>
  );
};
