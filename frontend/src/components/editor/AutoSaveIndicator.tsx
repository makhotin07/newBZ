import React from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSaved,
  errorMessage,
  onRetry
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saved':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Сохранено',
          description: lastSaved ? `Последнее сохранение: ${lastSaved.toLocaleTimeString()}` : undefined
        };
      case 'saving':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: 'Сохранение...',
          description: 'Автоматическое сохранение'
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Ошибка сохранения',
          description: errorMessage || 'Не удалось сохранить изменения'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Не сохранено',
          description: 'Внесите изменения для сохранения'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} transition-all duration-200`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
        {config.description && (
          <span className="text-xs text-gray-500">
            {config.description}
          </span>
        )}
      </div>

      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
        >
          Повторить
        </button>
      )}

      {/* Анимация для статуса "saving" */}
      {status === 'saving' && (
        <div className="ml-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
