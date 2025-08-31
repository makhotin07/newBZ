import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

export interface ErrorStateProps {
  /** Заголовок ошибки */
  title?: string;
  /** Описание ошибки */
  message?: string;
  /** Детальная информация об ошибке */
  details?: string;
  /** Функция для повтора действия */
  onRetry?: () => void;
  /** Функция для возврата назад */
  onGoBack?: () => void;
  /** Дополнительные действия */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  }>;
  /** Показать детали ошибки */
  showDetails?: boolean;
  /** CSS классы */
  className?: string;
}

/**
 * Компонент для отображения состояний ошибок
 * Предоставляет информацию об ошибке и варианты действий
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Произошла ошибка',
  message = 'Что-то пошло не так. Попробуйте повторить действие или обратитесь в поддержку.',
  details,
  onRetry,
  onGoBack,
  actions = [],
  showDetails = false,
  className = ''
}) => {
  const [isDetailsVisible, setIsDetailsVisible] = React.useState(showDetails);

  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Иконка ошибки */}
      <div className="text-red-500 mb-4">
        <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
      </div>
      
      {/* Заголовок */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      {/* Сообщение */}
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {message}
      </p>
      
      {/* Действия */}
      <div className="flex items-center justify-center space-x-3 mb-6">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Повторить
          </Button>
        )}
        
        {onGoBack && (
          <Button
            onClick={onGoBack}
            variant="secondary"
          >
            Назад
          </Button>
        )}
        
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            variant={action.variant || 'secondary'}
            size={action.size || 'md'}
          >
            {action.label}
          </Button>
        ))}
      </div>
      
      {/* Детали ошибки */}
      {details && (
        <div className="mt-6">
          <button
            onClick={() => setIsDetailsVisible(!isDetailsVisible)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {isDetailsVisible ? 'Скрыть детали' : 'Показать детали'}
          </button>
          
          {isDetailsVisible && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-left">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                {details}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorState;
