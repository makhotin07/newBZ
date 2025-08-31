import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from './ThemeProvider';
import { Button } from './Button';

export interface ThemeToggleProps {
  /** Размер кнопки */
  size?: 'sm' | 'md' | 'lg';
  /** Показать текст */
  showLabel?: boolean;
  /** CSS классы */
  className?: string;
  /** Компактный режим (только иконка) */
  compact?: boolean;
}

/**
 * Компонент переключателя темы
 * Поддерживает светлую, тёмную и системную темы
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  showLabel = true,
  className = '',
  compact = false
}) => {
  const { theme, setTheme, isDark, toggleTheme } = useTheme();

  // Получение иконки для текущей темы
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="w-5 h-5" />;
      case 'dark':
        return <MoonIcon className="w-5 h-5" />;
      case 'system':
        return <ComputerDesktopIcon className="w-5 h-5" />;
      default:
        return <SunIcon className="w-5 h-5" />;
    }
  };

  // Получение названия темы
  const getThemeName = () => {
    switch (theme) {
      case 'light':
        return 'Светлая';
      case 'dark':
        return 'Тёмная';
      case 'system':
        return 'Системная';
      default:
        return 'Светлая';
    }
  };

  // Обработчик клика
  const handleClick = () => {
    if (compact) {
      toggleTheme();
    } else {
      // Циклическое переключение: light → dark → system → light
      const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
      const currentIndex = themes.indexOf(theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      setTheme(themes[nextIndex]);
    }
  };

  // Компактный режим (только иконка)
  if (compact) {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={handleClick}
        className={`p-2 ${className}`}
        title={`Текущая тема: ${getThemeName()}. Клик для переключения.`}
      >
        {getThemeIcon()}
      </Button>
    );
  }

  // Полный режим (с текстом)
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={`flex items-center space-x-2 ${className}`}
      title={`Текущая тема: ${getThemeName()}. Клик для смены.`}
    >
      {getThemeIcon()}
      {showLabel && (
        <span className="hidden sm:inline">
          {getThemeName()}
        </span>
      )}
    </Button>
  );
};

export default ThemeToggle;
