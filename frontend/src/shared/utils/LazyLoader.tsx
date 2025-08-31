import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSkeleton } from '../ui';

export interface LazyLoaderProps {
  /** Компонент для загрузки */
  component: () => Promise<{ default: ComponentType<any> }>;
  /** Пропсы для компонента */
  props?: Record<string, any>;
  /** Fallback компонент */
  fallback?: React.ReactNode;
  /** Тип скелетона для fallback */
  skeletonType?: 'text' | 'circular' | 'rectangular' | 'table-row' | 'card' | 'list-item';
  /** Количество строк скелетона */
  skeletonRows?: number;
  /** CSS классы */
  className?: string;
}

/**
 * Компонент для lazy loading с поддержкой code-splitting
 */
export const LazyLoader: React.FC<LazyLoaderProps> = ({
  component,
  props = {},
  fallback,
  skeletonType = 'card',
  skeletonRows = 3,
  className = ''
}) => {
  const LazyComponent = lazy(component);

  const defaultFallback = (
    <div className={className}>
      <LoadingSkeleton 
        variant={skeletonType} 
        rows={skeletonRows} 
      />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Фабрика для создания lazy компонентов с предустановленными настройками
 */
export const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options: {
    skeletonType?: LazyLoaderProps['skeletonType'];
    skeletonRows?: number;
    className?: string;
  } = {}
) => {
  const LazyComponent = lazy(importFn);
  
  return React.forwardRef<any, any>((props, ref) => (
    <Suspense 
      fallback={
        <div className={options.className || ''}>
          <LoadingSkeleton 
            variant={options.skeletonType || 'card'} 
            rows={options.skeletonRows || 3} 
          />
        </div>
      }
    >
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

/**
 * Хук для создания lazy компонента с error boundary
 */
export const useLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    importFn()
      .then((module) => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        console.error('Failed to load lazy component:', err);
      });
  }, [importFn]);

  return { Component, loading, error, fallback };
};

/**
 * Error Boundary для lazy компонентов
 */
export class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
    
    // Отправка ошибки в аналитику
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        stack_trace: error.stack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Что-то пошло не так
          </h3>
          <p className="text-gray-500 mb-4">
            Не удалось загрузить компонент. Попробуйте обновить страницу.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Обновить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyLoader;
