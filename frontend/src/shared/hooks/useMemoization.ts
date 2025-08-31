import { useMemo, useCallback, useRef } from 'react';

/**
 * Хук для глубокого сравнения объектов
 */
export const useDeepCompareMemo = <T>(
  factory: () => T,
  deps: any[]
): T => {
  const depsRef = useRef<any[]>();
  const depsChanged = !depsRef.current || deps.length !== depsRef.current.length ||
    deps.some((dep, index) => !Object.is(dep, depsRef.current![index]));

  if (depsChanged) {
    depsRef.current = deps;
  }

  return useMemo(factory, depsChanged ? deps : depsRef.current!);
};

/**
 * Хук для мемоизации функции с глубоким сравнением зависимостей
 */
export const useDeepCompareCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T => {
  const depsRef = useRef<any[]>();
  const depsChanged = !depsRef.current || deps.length !== depsRef.current.length ||
    deps.some((dep, index) => !Object.is(dep, depsRef.current![index]));

  if (depsChanged) {
    depsRef.current = deps;
  }

  return useCallback(callback, depsChanged ? deps : depsRef.current!);
};

/**
 * Хук для мемоизации с кастомной функцией сравнения
 */
export const useCustomMemo = <T>(
  factory: () => T,
  deps: any[],
  isEqual: (prev: any[], next: any[]) => boolean
): T => {
  const depsRef = useRef<any[]>();
  const depsChanged = !depsRef.current || !isEqual(depsRef.current!, deps);

  if (depsChanged) {
    depsRef.current = deps;
  }

  return useMemo(factory, depsChanged ? deps : depsRef.current!);
};

/**
 * Хук для мемоизации с кэшированием по ключу
 */
export const useKeyedMemo = <T>(
  factory: (key: string) => T,
  key: string,
  deps: any[]
): T => {
  const cacheRef = useRef<Map<string, { value: T; deps: any[] }>>(new Map());
  
  const cached = cacheRef.current.get(key);
  const depsChanged = !cached || deps.length !== cached.deps.length ||
    deps.some((dep, index) => !Object.is(dep, cached.deps[index]));

  if (depsChanged) {
    const value = factory(key);
    cacheRef.current.set(key, { value, deps });
    return value;
  }

  return cached.value;
};

/**
 * Хук для мемоизации с TTL (time to live)
 */
export const useTTLMemo = <T>(
  factory: () => T,
  deps: any[],
  ttl: number
): T => {
  const cacheRef = useRef<{ value: T; timestamp: number; deps: any[] }>();
  
  const now = Date.now();
  const depsChanged = !cacheRef.current || 
    now - cacheRef.current.timestamp > ttl ||
    deps.length !== cacheRef.current.deps.length ||
    deps.some((dep, index) => !Object.is(dep, cacheRef.current!.deps[index]));

  if (depsChanged) {
    const value = factory();
    cacheRef.current = { value, timestamp: now, deps };
    return value;
  }

  return cacheRef.current!.value;
};

export default {
  useDeepCompareMemo,
  useDeepCompareCallback,
  useCustomMemo,
  useKeyedMemo,
  useTTLMemo,
};
