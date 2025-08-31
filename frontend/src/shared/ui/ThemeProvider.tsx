import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// CSS переменные для тёмной темы
const lightTheme = {
  '--color-bg-primary': '#ffffff',
  '--color-bg-secondary': '#f9fafb',
  '--color-bg-tertiary': '#f3f4f6',
  '--color-bg-elevated': '#ffffff',
  '--color-bg-overlay': 'rgba(0, 0, 0, 0.5)',
  '--color-text-primary': '#111827',
  '--color-text-secondary': '#6b7280',
  '--color-text-tertiary': '#9ca3af',
  '--color-text-inverse': '#ffffff',
  '--color-border-primary': '#e5e7eb',
  '--color-border-secondary': '#f3f4f6',
  '--color-border-focus': '#3b82f6',
  '--color-accent-primary': '#3b82f6',
  '--color-accent-secondary': '#1d4ed8',
  '--color-accent-success': '#10b981',
  '--color-accent-warning': '#f59e0b',
  '--color-accent-error': '#ef4444',
  '--color-accent-info': '#06b6d4',
  '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

const darkTheme = {
  '--color-bg-primary': '#111827',
  '--color-bg-secondary': '#1f2937',
  '--color-bg-tertiary': '#374151',
  '--color-bg-elevated': '#1f2937',
  '--color-bg-overlay': 'rgba(0, 0, 0, 0.7)',
  '--color-text-primary': '#f9fafb',
  '--color-text-secondary': '#d1d5db',
  '--color-text-tertiary': '#9ca3af',
  '--color-text-inverse': '#111827',
  '--color-border-primary': '#374151',
  '--color-border-secondary': '#4b5563',
  '--color-border-focus': '#60a5fa',
  '--color-accent-primary': '#60a5fa',
  '--color-accent-secondary': '#93c5fd',
  '--color-accent-success': '#34d399',
  '--color-accent-warning': '#fbbf24',
  '--color-accent-error': '#f87171',
  '--color-accent-info': '#22d3ee',
  '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
};

/**
 * Провайдер темы для управления тёмной/светлой темой
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Получаем сохранённую тему из localStorage
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved;
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState(false);

  // Применение темы к CSS переменным
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(isDarkMode);
    
    const themeVars = isDarkMode ? darkTheme : lightTheme;
    
    Object.entries(themeVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Добавляем/удаляем класс для тёмной темы
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Установка темы
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Переключение темы
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Слушатель изменения системной темы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Применение темы при инициализации и изменении
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Хук для использования темы
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
