import { useState, useEffect } from 'react';

/**
 * Hook для отложенного выполнения (debounce)
 * @param value - значение для отслеживания
 * @param delay - задержка в миллисекундах
 * @returns отложенное значение
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
