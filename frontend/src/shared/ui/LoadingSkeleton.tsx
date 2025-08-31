import React from 'react';

export interface SkeletonProps {
  /** Тип скелетона */
  variant?: 'text' | 'circular' | 'rectangular' | 'table-row' | 'card' | 'list-item';
  /** Ширина скелетона */
  width?: string | number;
  /** Высота скелетона */
  height?: string | number;
  /** Количество повторений */
  count?: number;
  /** CSS классы */
  className?: string;
  /** Анимация пульсации */
  animate?: boolean;
}

/**
 * Базовый компонент скелетона
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  animate = true
}) => {
  const baseClasses = 'bg-gray-200 rounded';
  const animationClasses = animate ? 'animate-pulse' : '';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full';
      case 'circular':
        return 'h-12 w-12 rounded-full';
      case 'rectangular':
        return 'h-4 w-full';
      case 'table-row':
        return 'h-12 w-full';
      case 'card':
        return 'h-32 w-full';
      case 'list-item':
        return 'h-16 w-full';
      default:
        return 'h-4 w-full';
    }
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${animationClasses} ${className}`}
      style={style}
    />
  );
};

export interface LoadingSkeletonProps {
  /** Тип скелетона */
  variant?: 'text' | 'circular' | 'rectangular' | 'table-row' | 'card' | 'list-item';
  /** Количество строк */
  rows?: number;
  /** Количество колонок (для таблицы) */
  columns?: number;
  /** Ширина скелетона */
  width?: string | number;
  /** Высота скелетона */
  height?: string | number;
  /** CSS классы */
  className?: string;
  /** Анимация пульсации */
  animate?: boolean;
}

/**
 * Компонент для отображения скелетонов загрузки
 * Поддерживает различные варианты и множественные элементы
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  rows = 1,
  columns = 1,
  width,
  height,
  className = '',
  animate = true
}) => {
  if (variant === 'table-row') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-2">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="rectangular"
                width={colIndex === 0 ? '20%' : colIndex === columns - 1 ? '15%' : 'auto'}
                height={height}
                animate={animate}
                className="flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton variant="rectangular" height={height || 32} animate={animate} />
            <Skeleton variant="text" width="80%" animate={animate} />
            <Skeleton variant="text" width="60%" animate={animate} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list-item') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Skeleton variant="circular" width={40} height={40} animate={animate} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" animate={animate} />
              <Skeleton variant="text" width="40%" animate={animate} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          width={width}
          height={height}
          animate={animate}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
