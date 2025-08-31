import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  /** Иконка для пустого состояния */
  icon?: React.ReactNode;
  /** Заголовок пустого состояния */
  title: string;
  /** Описание пустого состояния */
  description?: string;
  /** Кнопка действия */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
  };
  /** Дополнительные действия */
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
  }>;
  /** Дополнительный контент */
  children?: React.ReactNode;
  /** CSS классы */
  className?: string;
}

/**
 * Компонент для отображения пустых состояний
 * Используется когда нет данных для отображения
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryActions,
  children,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Иконка */}
      {icon && (
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 mx-auto">
            {icon}
          </div>
        </div>
      )}
      
      {/* Заголовок */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      {/* Описание */}
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {/* Основное действие */}
      {action && (
        <div className="mb-4">
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
            size={action.size || 'md'}
          >
            {action.label}
          </Button>
        </div>
      )}
      
      {/* Дополнительные действия */}
      {secondaryActions && secondaryActions.length > 0 && (
        <div className="flex items-center justify-center space-x-3">
          {secondaryActions.map((secondaryAction, index) => (
            <Button
              key={index}
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'secondary'}
              size={secondaryAction.size || 'sm'}
            >
              {secondaryAction.label}
            </Button>
          ))}
        </div>
      )}
      
      {/* Дополнительный контент */}
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
