export interface Database {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  workspace: string;
  workspace_name: string;
  default_view: DatabaseViewType;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  properties_count?: number;
  records_count?: number;
}

export type PropertyType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multi_select' 
  | 'date' 
  | 'person' 
  | 'files' 
  | 'checkbox' 
  | 'url' 
  | 'email' 
  | 'phone'
  | 'formula'
  | 'relation'
  | 'rollup'
  | 'created_time'
  | 'created_by'
  | 'last_edited_time'
  | 'last_edited_by';

export interface DatabaseProperty {
  id: string;
  database: string;
  name: string;
  type: PropertyType;
  config: {
    // Для select/multi_select
    options?: SelectOption[];
    
    // Для формул
    expression?: string;
    return_type?: 'text' | 'number' | 'date' | 'boolean';
    
    // Для связей
    target_database_id?: string;
    display_property?: string;
    
    // Для rollup
    rollup_property?: string;
    rollup_function?: 'count' | 'sum' | 'average' | 'min' | 'max' | 'concatenate';
    
    // Общие настройки
    required?: boolean;
    unique?: boolean;
    default_value?: any;
  };
  position: number;
  is_visible: boolean;
  options?: SelectOption[];
  created_at: string;
  updated_at: string;
}

export interface SelectOption {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface DatabaseRecord {
  id: string;
  database: string;
  data: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type DatabaseViewType = 'table' | 'board' | 'list' | 'calendar' | 'gallery' | 'timeline';

export interface DatabaseView {
  id: string;
  database: string;
  name: string;
  type: DatabaseViewType;
  filters: FilterCondition[];
  sorts: SortCondition[];
  groups: GroupCondition[];
  properties: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FilterCondition {
  property: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal';
  value: any;
}

export interface SortCondition {
  property: string;
  direction: 'asc' | 'desc';
}

export interface GroupCondition {
  property: string;
}

// Новые типы для расширенного функционала



export interface DatabaseRecordRevision {
  id: string;
  record: string;
  author: string;
  author_name: string;
  changes: Record<string, {
    old: any;
    new: any;
  }>;
  change_type: 'create' | 'update' | 'delete';
  created_at: string;
}

export interface RelationRecord {
  id: string;
  title: string;
  database_id: string;
  database_name: string;
  [key: string]: any;
}

export interface FormulaEvaluation {
  value: any;
  error?: string;
  dependencies: string[];
}
