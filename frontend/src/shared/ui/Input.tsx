import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Улучшенный компонент Input 2025 с поддержкой современных возможностей
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isRequired = false,
  fullWidth = true,
  variant = 'default',
  size = 'md',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Базовые классы для input с поддержкой reduced motion
  const baseInputClasses = [
    'block w-full rounded-md shadow-sm transition-colors duration-200',
    'focus:ring-2 focus:ring-offset-0',
    'motion-reduce:transition-none', // Поддержка reduced motion
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth ? 'w-full' : ''
  ].join(' ');
  
  // Варианты стилей
  const variantClasses = {
    default: 'border-gray-300 bg-white',
    filled: 'border-transparent bg-gray-50',
    outlined: 'border-2 border-gray-300 bg-white'
  };
  
  // Размеры
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  // Состояния с улучшенной цветовой схемой
  const stateClasses = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500';
  
  // Размеры с учетом иконок
  const iconClasses = leftIcon || rightIcon ? 'pl-10 pr-10' : '';
  
  const inputClasses = [
    baseInputClasses,
    variantClasses[variant],
    sizeClasses[size],
    stateClasses,
    iconClasses,
    className
  ].filter(Boolean).join(' ');
  
  // Классы для контейнера
  const containerClasses = 'relative';
  
  // Классы для label с улучшенной типографикой
  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';
  
  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {isRequired && <span className="text-red-500 ml-1" aria-label="обязательное поле">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400" aria-hidden="true">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          aria-required={isRequired}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400" aria-hidden="true">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
