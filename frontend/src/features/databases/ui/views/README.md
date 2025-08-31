# Представления базы данных

Модуль предоставляет различные способы отображения данных базы данных, аналогичные Notion/Confluence.

## Доступные представления

### 1. BoardView (Kanban)
**Файл:** `BoardView.tsx`

Группирует записи по выбранному свойству (например, статус) в виде колонок с возможностью drag-n-drop.

**Возможности:**
- ✅ Группировка записей по свойству
- ✅ Drag-n-drop между колонками
- ✅ Inline-редактирование ячеек
- ✅ Добавление записей в группы
- ✅ Удаление записей
- ✅ Цветовая кодировка групп

**Конфигурация:**
```typescript
interface BoardViewConfig {
  group_by_property: string;     // ID свойства для группировки
  show_empty_groups: boolean;    // Показывать пустые группы
  card_layout: 'compact' | 'detailed';
  show_property_icons: boolean;
}
```

**Использование:**
```tsx
<BoardView
  properties={properties}
  records={records}
  config={boardConfig}
  onUpdateRecord={handleUpdateRecord}
  onCreateRecord={handleCreateRecord}
  onDeleteRecord={handleDeleteRecord}
/>
```

### 2. CalendarView
**Файл:** `CalendarView.tsx`

Отображает записи по полю типа "date" в календарном формате с возможностью drag-n-drop для изменения дат.

**Возможности:**
- ✅ Календарное отображение по месяцам/неделям/дням
- ✅ Drag-n-drop для изменения дат
- ✅ Навигация по календарю
- ✅ Отображение времени событий
- ✅ Цветовая кодировка событий

**Конфигурация:**
```typescript
interface CalendarViewConfig {
  date_property: string;         // ID свойства типа date
  show_time: boolean;            // Показывать время
  default_view: 'month' | 'week' | 'day';
  working_hours?: {
    start: string;               // "09:00"
    end: string;                 // "18:00"
  };
}
```

**Использование:**
```tsx
<CalendarView
  properties={properties}
  records={records}
  config={calendarConfig}
  onUpdateRecord={handleUpdateRecord}
  onDeleteRecord={handleDeleteRecord}
/>
```

### 3. ListView
**Файл:** `ListView.tsx`

Упрощенный список записей с настраиваемыми свойствами и массовыми операциями.

**Возможности:**
- ✅ Настраиваемые свойства для отображения
- ✅ Различная высота строк
- ✅ Чекбоксы для выбора
- ✅ Массовые операции
- ✅ Дублирование записей

**Конфигурация:**
```typescript
interface ListViewConfig {
  show_properties: string[];     // ID свойств для отображения
  row_height: 'compact' | 'normal' | 'large';
  show_checkboxes: boolean;      // Показывать чекбоксы
  show_actions: boolean;         // Показывать действия
}
```

**Использование:**
```tsx
<ListView
  properties={properties}
  records={records}
  config={listConfig}
  onUpdateRecord={handleUpdateRecord}
  onDeleteRecord={handleDeleteRecord}
/>
```

### 4. GalleryView
**Файл:** `GalleryView.tsx`

Карточки с изображениями и текстом для визуального представления данных.

**Возможности:**
- ✅ Карточки с изображениями
- ✅ Настраиваемые размеры карточек
- ✅ Адаптивная сетка
- ✅ Fallback для отсутствующих изображений
- ✅ Inline-редактирование

**Конфигурация:**
```typescript
interface GalleryViewConfig {
  image_property?: string;       // ID свойства с изображением
  title_property: string;        // ID свойства для заголовка
  description_property?: string; // ID свойства для описания
  card_size: 'small' | 'medium' | 'large';
  columns: number;               // Количество колонок
}
```

**Использование:**
```tsx
<GalleryView
  properties={properties}
  records={records}
  config={galleryConfig}
  onUpdateRecord={handleUpdateRecord}
  onDeleteRecord={handleDeleteRecord}
/>
```

### 5. TimelineView
**Файл:** `TimelineView.tsx`

Временная шкала для задач с датами начала и окончания.

**Возможности:**
- ✅ Группировка по времени (час/день/неделя/месяц)
- ✅ Drag-n-drop для изменения дат
- ✅ Отображение прогресса
- ✅ Навигация по временной шкале
- ✅ Цветовая кодировка по группам

**Конфигурация:**
```typescript
interface TimelineViewConfig {
  start_date_property: string;   // ID свойства с датой начала
  end_date_property: string;     // ID свойства с датой окончания
  title_property: string;        // ID свойства для заголовка
  group_by?: string;             // ID свойства для группировки
  show_progress: boolean;        // Показывать прогресс
  time_unit: 'hour' | 'day' | 'week' | 'month';
}
```

**Использование:**
```tsx
<TimelineView
  properties={properties}
  records={records}
  config={timelineConfig}
  onUpdateRecord={handleUpdateRecord}
  onDeleteRecord={handleDeleteRecord}
/>
```

## Общие возможности

### Drag-n-Drop
Все представления, поддерживающие drag-n-drop, используют библиотеку `react-beautiful-dnd`:

```tsx
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
```

### Inline-редактирование
Все представления поддерживают редактирование ячеек через компонент `EditableCell`.

### Фильтрация и сортировка
Представления интегрируются с хуком `useDatabaseView` для применения фильтров и сортировки:

```tsx
const { getProcessedRecords } = useDatabaseView({ databaseId, viewId });
const processedRecords = getProcessedRecords(records);
```

## Хуки

### useDatabaseView
**Файл:** `hooks/useDatabaseView.ts`

Хук для работы с представлениями базы данных:

```tsx
const {
  views,
  currentView,
  createView,
  updateView,
  deleteView,
  getProcessedRecords
} = useDatabaseView({ databaseId, viewId });
```

**Возможности:**
- Загрузка представлений
- Создание/обновление/удаление представлений
- Применение фильтров и сортировки
- Группировка данных

## Селектор представлений

### ViewSelector
**Файл:** `ViewSelector.tsx`

Компонент для переключения между различными представлениями:

```tsx
<ViewSelector
  views={views}
  currentView={currentView}
  onViewChange={handleViewChange}
  onCreateView={handleCreateView}
/>
```

## Типы данных

### ViewType
```typescript
type ViewType = 'table' | 'board' | 'calendar' | 'list' | 'gallery' | 'timeline';
```

### ViewConfig
```typescript
interface ViewConfig {
  filters?: ViewFilter[];
  sorts?: ViewSort[];
  groups?: ViewGroup[];
  board?: BoardViewConfig;
  calendar?: CalendarViewConfig;
  list?: ListViewConfig;
  gallery?: GalleryViewConfig;
  timeline?: TimelineViewConfig;
}
```

## Пример использования

```tsx
import { DatabaseViewsExample } from '@/features/databases';

function MyPage() {
  return (
    <DatabaseViewsExample 
      databaseId="your-database-id"
      className="custom-styles"
    />
  );
}
```

## Зависимости

- **react-beautiful-dnd** - для drag-n-drop функциональности
- **@tanstack/react-query** - для кеширования и управления состоянием
- **Tailwind CSS** - для стилизации

## Архитектура

```
views/
├── BoardView.tsx          # Kanban доска
├── CalendarView.tsx       # Календарь
├── ListView.tsx           # Список
├── GalleryView.tsx        # Галерея
├── TimelineView.tsx       # Временная шкала
├── ViewSelector.tsx       # Селектор представлений
├── DatabaseViewsExample.tsx # Пример использования
└── index.ts               # Экспорт компонентов
```

## Производительность

- Виртуализация для больших списков (планируется)
- Ленивая загрузка данных
- Мемоизация компонентов
- Оптимизация drag-n-drop операций
- Кеширование React Query
