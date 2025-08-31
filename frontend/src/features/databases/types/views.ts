/**
 * Типы для представлений базы данных
 */

export type ViewType = 'table' | 'board' | 'calendar' | 'list' | 'gallery' | 'timeline';

export interface DatabaseView {
  id: string;
  name: string;
  type: ViewType;
  database: string;
  config: ViewConfig;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface ViewConfig {
  // Общие настройки
  filters?: ViewFilter[];
  sorts?: ViewSort[];
  groups?: ViewGroup[];
  
  // Специфичные настройки для каждого типа
  board?: BoardViewConfig;
  calendar?: CalendarViewConfig;
  list?: ListViewConfig;
  gallery?: GalleryViewConfig;
  timeline?: TimelineViewConfig;
}

export interface ViewFilter {
  property_id: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface ViewSort {
  property_id: string;
  direction: 'asc' | 'desc';
}

export interface ViewGroup {
  property_id: string;
  direction: 'asc' | 'desc';
}

// Конфигурация для BoardView (Kanban)
export interface BoardViewConfig {
  group_by_property: string; // ID свойства для группировки (например, status)
  show_empty_groups: boolean;
  card_layout: 'compact' | 'detailed';
  show_property_icons: boolean;
}

// Конфигурация для CalendarView
export interface CalendarViewConfig {
  date_property: string; // ID свойства типа date
  show_time: boolean;
  default_view: 'month' | 'week' | 'day';
  working_hours?: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
}

// Конфигурация для TableView
export interface TableViewConfig {
  show_properties: string[]; // ID свойств для отображения
  show_checkboxes: boolean;
  show_actions: boolean;
  default_sort?: {
    property_id: string;
    direction: 'asc' | 'desc';
  };
  default_filters?: ViewFilter[];
}

// Конфигурация для ListView
export interface ListViewConfig {
  show_properties: string[]; // ID свойств для отображения
  row_height: 'compact' | 'normal' | 'large';
  show_checkboxes: boolean;
  show_actions: boolean;
}

// Конфигурация для GalleryView
export interface GalleryViewConfig {
  image_property?: string; // ID свойства с изображением
  title_property: string;  // ID свойства для заголовка
  description_property?: string; // ID свойства для описания
  card_size: 'small' | 'medium' | 'large';
  columns: number;
}

// Конфигурация для TimelineView
export interface TimelineViewConfig {
  start_date_property: string; // ID свойства с датой начала
  end_date_property: string;   // ID свойства с датой окончания
  title_property: string;      // ID свойства для заголовка
  group_by?: string;           // ID свойства для группировки
  show_progress: boolean;
  time_unit: 'hour' | 'day' | 'week' | 'month';
}

// Типы для drag-n-drop
export interface DragItem {
  type: 'record' | 'group';
  id: string;
  source_group?: string;
  target_group?: string;
}

export interface DropResult {
  item: DragItem;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  };
  type: string;
}

// Типы для группировки записей
export interface GroupedRecords {
  [groupKey: string]: {
    name: string;
    records: any[];
    count: number;
    color?: string;
  };
}

// Типы для календарных событий
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  record: any;
  color?: string;
}

// Типы для временной шкалы
export interface TimelineItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  record: any;
  progress?: number;
  group?: string;
  color?: string;
}
