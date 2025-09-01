import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  maxLength?: number;
  showCharacterCount?: boolean;
}

/**
 * Современный компонент Textarea 2025 с поддержкой a11y и reduced motion
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  isRequired = false,
  fullWidth = true,
  variant = 'default',
  size = 'md',
  resize = 'vertical',
  maxLength,
  showCharacterCount = false,
  className = '',
  id,
  value,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const currentLength = typeof value === 'string' ? value.length : 0;
  
  // Базовые классы с поддержкой reduced motion
  const baseClasses = [
    'block w-full rounded-md shadow-sm transition-colors duration-200',
    'focus:ring-2 focus:ring-offset-0',
    'motion-reduce:transition-none',
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
  
  // Состояния
  const stateClasses = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500';
  
  // Resize классы
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };
  
  const textareaClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    stateClasses,
    resizeClasses[resize],
    className
  ].filter(Boolean).join(' ');
  
  // Классы для label
  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';
  
  // Классы для счетчика символов
  const counterClasses = [
    'text-xs text-gray-500 mt-1',
    maxLength && currentLength > maxLength * 0.9 ? 'text-yellow-600' : '',
    maxLength && currentLength > maxLength ? 'text-red-600' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className="relative">
      {label && (
        <label htmlFor={textareaId} className={labelClasses}>
          {label}
          {isRequired && <span className="text-red-500 ml-1" aria-label="обязательное поле">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        aria-required={isRequired}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      
      {/* Счетчик символов */}
      {showCharacterCount && maxLength && (
        <div className="flex justify-between items-center mt-1">
          <span className={counterClasses}>
            {currentLength} / {maxLength} символов
          </span>
        </div>
      )}
      
      {/* Ошибка */}
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {/* Helper text */}
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
