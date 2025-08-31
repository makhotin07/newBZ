# 🎨 UI-кит и дизайн-токены - Аудит

## 📦 Инвентаризация UI компонентов

### 🏗️ Shared UI компоненты (`frontend/src/shared/ui/`)

#### 1. **SidePanel** (3.0KB, 103 строки)
```typescript
interface SidePanelProps {
  isOpen: boolean;           // Состояние открытия
  onClose: () => void;       // Функция закрытия
  title?: string;            // Заголовок панели
  children: React.ReactNode; // Контент
  width?: number;            // Ширина в процентах (по умолчанию 70%)
  className?: string;        // Дополнительные CSS классы
}
```

**Функциональность:**
- ✅ Slide-over анимация справа
- ✅ Overlay с кликом для закрытия
- ✅ Закрытие по Escape
- ✅ Блокировка скролла body
- ✅ Настраиваемая ширина
- ✅ Заголовок с кнопкой закрытия

**Использование:** Боковые панели для просмотра страниц, комментариев

#### 2. **TagSelector** (8.4KB, 245 строк)
```typescript
interface TagSelectorProps {
  selectedTags: Tag[];       // Выбранные теги
  onChange: (tagIds: string[]) => void; // Обработчик изменений
  className?: string;        // Дополнительные CSS классы
}
```

**Функциональность:**
- ✅ Множественный выбор тегов
- ✅ Поиск по тегам
- ✅ Создание новых тегов
- ✅ Цветовая палитра для тегов
- ✅ Dropdown с автозакрытием
- ✅ Удаление выбранных тегов

**Использование:** Выбор тегов для страниц, задач, баз данных

#### 3. **ConfirmModal** (2.2KB, 55 строк)
```typescript
interface ConfirmModalProps {
  isOpen: boolean;           // Состояние открытия
  title?: string;            // Заголовок (по умолчанию "Подтверждение")
  message?: string;          // Сообщение (по умолчанию "Вы уверены?")
  confirmText?: string;      // Текст кнопки подтверждения
  cancelText?: string;       // Текст кнопки отмены
  onConfirm: () => void;     // Обработчик подтверждения
  onCancel: () => void;      // Обработчик отмены
}
```

**Функциональность:**
- ✅ Модальное окно подтверждения
- ✅ Настраиваемые тексты
- ✅ Анимации появления/исчезновения
- ✅ Overlay с кликом для закрытия
- ✅ Кнопки подтверждения/отмены

**Использование:** Подтверждение удаления, важных действий

#### 4. **EmptyState** (786B, 33 строки)
```typescript
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>; // Иконка
  title: string;             // Заголовок
  description?: string;      // Описание
  action?: React.ReactNode;  // Действие (кнопка, ссылка)
  className?: string;        // Дополнительные CSS классы
}
```

**Функциональность:**
- ✅ Отображение пустого состояния
- ✅ Опциональная иконка
- ✅ Заголовок и описание
- ✅ Опциональное действие
- ✅ Центрированное расположение

**Использование:** Пустые списки, отсутствие данных

#### 5. **LoadingSpinner** (483B, 24 строки)
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'; // Размер спиннера
  className?: string;          // Дополнительные CSS классы
}
```

**Функциональность:**
- ✅ Три размера: sm (16x16), md (32x32), lg (48x48)
- ✅ Анимация вращения
- ✅ Кастомные цвета (border-gray-300, border-t-blue-600)
- ✅ Настраиваемые CSS классы

**Использование:** Индикаторы загрузки, ожидание API

#### 6. **ErrorBoundary** (3.0KB, 79 строк)
```typescript
interface Props {
  children: ReactNode;       // Дочерние компоненты
}

interface State {
  hasError: boolean;         // Наличие ошибки
  error: Error | null;       // Объект ошибки
  errorInfo: ErrorInfo | null; // Информация об ошибке
}
```

**Функциональность:**
- ✅ Перехват JavaScript ошибок
- ✅ Отображение fallback UI
- ✅ Детали ошибки (опционально)
- ✅ Кнопка обновления страницы
- ✅ Логирование ошибок в консоль

**Использование:** Обработка критических ошибок в компонентах

#### 7. **EmojiPicker** (2.4KB, 72 строки)
```typescript
interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void; // Обработчик выбора эмодзи
  onClose: () => void;                    // Функция закрытия
}
```

**Функциональность:**
- ✅ 4 категории эмодзи (80 эмодзи)
- ✅ Поиск по категориям
- ✅ Grid layout (8 колонок)
- ✅ Hover эффекты
- ✅ Автозакрытие по клику вне
- ✅ Кастомные размеры

**Использование:** Выбор иконок для страниц, настроек

### 🎯 Feature-specific UI компоненты

#### Notes модуль
- **RichTextEditor** - TipTap редактор с расширенным функционалом
- **SlashCommands** - Команды для быстрого форматирования
- **BubbleMenu** - Контекстное меню редактора
- **EditorToolbar** - Панель инструментов редактора
- **PageList** - Список страниц с поиском и фильтрацией
- **PagePreview** - Предварительный просмотр страниц
- **SharePageModal** - Модал для шаринга страниц

#### Databases модуль
- **DatabaseTable** - Основная таблица базы данных
- **EditableCell** - Редактируемые ячейки таблицы
- **CreatePropertyModal** - Создание свойств БД
- **CreateRecordModal** - Создание записей БД
- **ViewSelector** - Выбор представления БД
- **ListView/BoardView/GalleryView** - Различные представления

#### Tasks модуль
- **KanbanBoard** - Канбан доска
- **TaskCard** - Карточка задачи
- **CreateTaskModal** - Создание задач
- **CreateTaskBoardModal** - Создание досок

#### Search модуль
- **GlobalSearch** - Глобальный поиск
- **SearchFiltersPanel** - Панель фильтров поиска
- **SearchResultItem** - Элемент результата поиска
- **SavedSearchModal** - Сохраненные поиски

## 🎨 Дизайн-токены и система дизайна

### 🌈 Цветовая палитра

#### Primary Colors (Blue)
```css
primary: {
  50: '#eff6ff',   /* Светло-голубой */
  100: '#dbeafe',  /* Очень светлый */
  200: '#bfdbfe',  /* Светлый */
  300: '#93c5fd',  /* Средне-светлый */
  400: '#60a5fa',  /* Средний */
  500: '#3b82f6',  /* Основной */
  600: '#2563eb',  /* Темный */
  700: '#1d4ed8',  /* Очень темный */
  800: '#1e40af',  /* Самый темный */
  900: '#1e3a8a',  /* Экстра темный */
}
```

#### Gray Scale
```css
gray: {
  50: '#f9fafb',   /* Почти белый */
  100: '#f3f4f6',  /* Очень светлый */
  200: '#e5e7eb',  /* Светлый */
  300: '#d1d5db',  /* Средне-светлый */
  400: '#9ca3af',  /* Средний */
  500: '#6b7280',  /* Основной */
  600: '#4b5563',  /* Темный */
  700: '#374151',  /* Очень темный */
  800: '#1f2937',  /* Самый темный */
  900: '#111827',  /* Экстра темный */
}
```

#### Semantic Colors
```css
/* В index.css */
.btn-primary: bg-blue-600 hover:bg-blue-700
.btn-secondary: bg-gray-100 hover:bg-gray-200
.btn-danger: bg-red-600 hover:bg-red-700
.btn-outline: border-gray-300 hover:border-gray-400
```

### 🔤 Типографика

#### Font Family
```css
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
}
```

#### Font Sizes (Tailwind по умолчанию)
```css
text-xs: 0.75rem    /* 12px */
text-sm: 0.875rem   /* 14px */
text-base: 1rem     /* 16px */
text-lg: 1.125rem   /* 18px */
text-xl: 1.25rem    /* 20px */
text-2xl: 1.5rem    /* 24px */
text-3xl: 1.875rem  /* 30px */
```

#### Font Weights
```css
font-light: 300
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

### 📏 Spacing система

#### Custom Spacing
```css
spacing: {
  '72': '18rem',   /* 288px */
  '84': '21rem',   /* 336px */
  '96': '24rem',   /* 384px */
}
```

#### Standard Tailwind Spacing
```css
p-1: 0.25rem       /* 4px */
p-2: 0.5rem        /* 8px */
p-3: 0.75rem       /* 12px */
p-4: 1rem          /* 16px */
p-6: 1.5rem        /* 24px */
p-8: 2rem          /* 32px */
p-12: 3rem         /* 48px */
```

### 🎭 Анимации и переходы

#### Custom Animations
```css
animation: {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'slide-in': 'slideIn 0.3s ease-out',
}
```

#### Keyframes
```css
@keyframes fadeIn {
  '0%': { opacity: '0' }
  '100%': { opacity: '1' }
}

@keyframes slideIn {
  '0%': { transform: 'translateY(-10px)', opacity: '0' }
  '100%': { transform: 'translateY(0)', opacity: '1' }
}
```

#### Transition Durations
```css
duration-150: 150ms
duration-200: 200ms
duration-300: 300ms
duration-500: 500ms
```

### 🎨 Компонентные классы

#### Button Variants
```css
.btn-primary: bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors
.btn-secondary: bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors
.btn-danger: bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors
.btn-outline: border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors hover:bg-gray-50
```

#### Layout Classes
```css
.sidebar: w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto
.main-content: flex-1 overflow-y-auto
```

#### Animation Classes
```css
.preview-enter: transform translate-x-full
.preview-enter-active: transform translate-x-0 transition-transform duration-300 ease-out
.preview-exit: transform translate-x-0
.preview-exit-active: transform translate-x-full transition-transform duration-300 ease-in
.content-fade-in: fade-in duration-300
.preview-transition: transition-all duration-300 ease-in-out
```

## 🚨 Отсутствующие базовые компоненты

### 🔴 Критически необходимые

#### 1. **Button** - Базовые кнопки
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

#### 2. **Input** - Поля ввода
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
}
```

#### 3. **Modal** - Базовые модальные окна
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}
```

#### 4. **Dropdown** - Выпадающие меню
```typescript
interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}
```

#### 5. **Tabs** - Табы и вкладки
```typescript
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}
```

#### 6. **Table** - Базовые таблицы
```typescript
interface TableProps {
  columns: TableColumn[];
  data: any[];
  sortable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  search?: boolean;
  className?: string;
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}
```

### 🟡 Важные для редизайна

#### 7. **Drawer/SlideOver** - Боковые панели
```typescript
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  title?: string;
  className?: string;
}
```

#### 8. **Tooltip** - Всплывающие подсказки
```typescript
interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}
```

#### 9. **Breadcrumbs** - Навигационные хлебные крошки
```typescript
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
}
```

#### 10. **Badge** - Бейджи и метки
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}
```

### 🟢 Расширенные компоненты

#### 11. **InlineMenu** - Контекстные меню
```typescript
interface InlineMenuProps {
  items: MenuItem[];
  trigger: 'click' | 'hover' | 'context';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}
```

#### 12. **CommentThread** - Система комментариев
```typescript
interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onEditComment: (id: string, content: string) => void;
  onDeleteComment: (id: string) => void;
  className?: string;
}
```

#### 13. **FileUpload** - Загрузка файлов
```typescript
interface FileUploadProps {
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  dragAndDrop?: boolean;
  className?: string;
}
```

#### 14. **Progress** - Индикаторы прогресса
```typescript
interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}
```

#### 15. **Accordion** - Сворачиваемые панели
```typescript
interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}
```

## 📊 Анализ качества UI-кита

### ✅ Сильные стороны
- **Хорошая структура** компонентов по модулям
- **Типизация** всех компонентов через TypeScript
- **Переиспользование** базовых компонентов
- **Консистентность** дизайна через Tailwind
- **Анимации** и переходы для UX

### ⚠️ Области для улучшения
- **Отсутствие базовых компонентов** (Button, Input, Modal)
- **Недостаточная стандартизация** пропсов
- **Отсутствие Storybook** для документации
- **Ограниченные варианты** компонентов
- **Смешение подходов** к стилизации

### 🎯 Приоритеты для редизайна

#### P0 (Критично)
1. **Создать базовые компоненты** (Button, Input, Modal)
2. **Стандартизировать пропсы** всех компонентов
3. **Унифицировать варианты** компонентов

#### P1 (Высокий)
1. **Добавить недостающие компоненты** (Dropdown, Tabs, Table)
2. **Создать систему вариантов** для всех компонентов
3. **Добавить Storybook** для документации

#### P2 (Средний)
1. **Расширить дизайн-токены** (spacing, shadows, radii)
2. **Создать темную тему** (darkMode: 'class')
3. **Добавить анимации** для всех компонентов

#### P3 (Низкий)
1. **Создать иконки-кит** (Heroicons + кастомные)
2. **Добавить микроанимации** для взаимодействий
3. **Создать систему лоадеров** и скелетонов

## 🎨 Рекомендации по дизайн-системе

### 1. Расширить цветовую палитру
```css
/* Добавить семантические цвета */
success: { 50: '#f0fdf4', 500: '#22c55e', 900: '#14532d' }
warning: { 50: '#fffbeb', 500: '#f59e0b', 900: '#78350f' }
danger: { 50: '#fef2f2', 500: '#ef4444', 900: '#7f1d1d' }
info: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' }
```

### 2. Стандартизировать spacing
```css
/* Добавить больше вариантов */
spacing: {
  '18': '4.5rem',    /* 72px */
  '22': '5.5rem',    /* 88px */
  '26': '6.5rem',    /* 104px */
  '30': '7.5rem',    /* 120px */
}
```

### 3. Создать систему теней
```css
/* Кастомные тени */
boxShadow: {
  'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}
```

### 4. Стандартизировать радиусы
```css
/* Кастомные радиусы */
borderRadius: {
  'xs': '0.125rem',  /* 2px */
  'sm': '0.25rem',   /* 4px */
  'md': '0.375rem',  /* 6px */
  'lg': '0.5rem',    /* 8px */
  'xl': '0.75rem',   /* 12px */
  '2xl': '1rem',     /* 16px */
  '3xl': '1.5rem',   /* 24px */
}
```

## 📈 Итоговая оценка UI-кита

### ✅ Сильные стороны
- **Хорошая архитектура** с разделением по модулям
- **Типизация** всех компонентов
- **Консистентность** через Tailwind CSS
- **Переиспользование** базовых компонентов
- **Анимации** и переходы для UX

### ⚠️ Области для улучшения
- **Отсутствие базовых компонентов** (Button, Input, Modal)
- **Недостаточная стандартизация** пропсов и вариантов
- **Ограниченные дизайн-токены** (spacing, shadows, radii)
- **Отсутствие Storybook** для документации
- **Смешение подходов** к стилизации

### 🎯 Приоритеты для редизайна
1. **P0** - Создать базовые компоненты (Button, Input, Modal)
2. **P1** - Стандартизировать все компоненты и добавить недостающие
3. **P2** - Расширить дизайн-токены и создать темную тему
4. **P3** - Добавить Storybook и микроанимации
