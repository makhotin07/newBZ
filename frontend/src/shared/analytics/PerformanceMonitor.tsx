import React, { useEffect, useRef } from 'react';

// Объявление типа для Google Analytics
declare global {
  function gtag(...args: any[]): void;
}

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface PerformanceEvent {
  name: string;
  value: number;
  category: 'performance' | 'user-interaction' | 'error';
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Монитор производительности для отслеживания RUM метрик
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
  };

  private events: PerformanceEvent[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initObservers();
    this.measureTTFB();
  }

  /**
   * Инициализация наблюдателей производительности
   */
  private initObservers() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const entry = entries[0] as PerformanceEntry;
            this.metrics.fcp = entry.startTime;
            this.trackEvent('FCP', entry.startTime, 'performance');
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (e) {
        console.warn('FCP observer failed:', e);
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const entry = entries[entries.length - 1] as PerformanceEntry;
            this.metrics.lcp = entry.startTime;
            this.trackEvent('LCP', entry.startTime, 'performance');
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observer failed:', e);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const entry = entries[0] as any;
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.trackEvent('FID', this.metrics.fid, 'performance');
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID observer failed:', e);
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          for (const entry of entries) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.metrics.cls = clsValue;
          this.trackEvent('CLS', clsValue, 'performance');
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observer failed:', e);
      }
    }
  }

  /**
   * Измерение Time to First Byte
   */
  private measureTTFB() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.trackEvent('TTFB', this.metrics.ttfb, 'performance');
      }
    }
  }

  /**
   * Отслеживание события
   */
  trackEvent(name: string, value: number, category: PerformanceEvent['category'], metadata?: Record<string, any>) {
    const event: PerformanceEvent = {
      name,
      value,
      category,
      timestamp: Date.now(),
      metadata,
    };

    this.events.push(event);
    
    // Отправка в аналитику (можно заменить на реальный сервис)
    this.sendToAnalytics(event);
  }

  /**
   * Отправка в аналитику
   */
  private sendToAnalytics(event: PerformanceEvent) {
    // Здесь можно интегрировать с реальными сервисами аналитики
    // Google Analytics, Mixpanel, Amplitude и т.д.
    console.log('Performance Event:', event);
    
    // Пример отправки в Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event.name, {
        event_category: event.category,
        value: event.value,
        custom_parameter: JSON.stringify(event.metadata),
      });
    }
  }

  /**
   * Получение текущих метрик
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Получение всех событий
   */
  getEvents(): PerformanceEvent[] {
    return [...this.events];
  }

  /**
   * Очистка ресурсов
   */
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// Глобальный экземпляр монитора
let performanceMonitor: PerformanceMonitor | null = null;

/**
 * Хук для использования монитора производительности
 */
export const usePerformanceMonitor = () => {
  const monitorRef = useRef<PerformanceMonitor | null>(null);

  useEffect(() => {
    if (!performanceMonitor) {
      performanceMonitor = new PerformanceMonitor();
    }
    monitorRef.current = performanceMonitor;

    return () => {
      if (monitorRef.current) {
        monitorRef.current.destroy();
      }
    };
  }, []);

  return monitorRef.current;
};

/**
 * Хук для отслеживания производительности компонента
 */
export const usePerformanceTracking = (componentName: string) => {
  const monitor = usePerformanceMonitor();

  useEffect(() => {
    if (monitor) {
      const startTime = performance.now();
      
      return () => {
        const renderTime = performance.now() - startTime;
        monitor.trackEvent(`${componentName}_render`, renderTime, 'performance', {
          component: componentName,
          type: 'render',
        });
      };
    }
  }, [monitor, componentName]);

  return monitor;
};

export default PerformanceMonitor;
