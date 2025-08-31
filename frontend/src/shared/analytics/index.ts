/**
 * Экспорт всех компонентов аналитики
 */

export { default as PerformanceMonitor } from './PerformanceMonitor';
export {
  usePerformanceMonitor,
  usePerformanceTracking,
} from './PerformanceMonitor';
export type { PerformanceMetrics, PerformanceEvent } from './PerformanceMonitor';
