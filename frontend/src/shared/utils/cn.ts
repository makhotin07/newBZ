import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Утилита для объединения CSS классов
 * @param inputs - Классы для объединения
 * @returns Объединенная строка классов
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
