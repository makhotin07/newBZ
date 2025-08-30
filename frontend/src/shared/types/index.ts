// Базовые типы для API
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
}

export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Базовые типы для форм
export interface FormData {
  [key: string]: any;
}

// Типы для обновления пользователя
export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  timezone?: string;
  theme_preference?: string;
  profile?: {
    phone?: string;
    company?: string;
    job_title?: string;
    website?: string;
    notification_preferences?: {
      email_notifications?: boolean;
      push_notifications?: boolean;
      task_reminders?: boolean;
      workspace_invites?: boolean;
      comment_mentions?: boolean;
    };
  };
}

// Типы для смены пароля
export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

// Базовые типы для пользователей
export interface User {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar?: string;
  username?: string;
  bio?: string;
  timezone?: string;
  theme_preference?: string;
  profile?: {
    phone?: string;
    company?: string;
    job_title?: string;
    website?: string;
    notification_preferences?: {
      email_notifications?: boolean;
      push_notifications?: boolean;
      task_reminders?: boolean;
      workspace_invites?: boolean;
      comment_mentions?: boolean;
    };
  };
}

// Базовые типы для workspace
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_public?: boolean;
  created_by: string;
  created_by_name?: string;
  member_role?: 'owner' | 'admin' | 'member' | 'viewer';
  members_count?: number;
  tasks_count?: number;
  databases_count?: number;
  notes_count?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}



// Базовые типы для задач

export interface TaskColumn {
  id: string;
  title: string;
  color: string;
  position: number;
  tasks_count: number;
}

export interface TaskBoard {
  id: string;
  title: string;
  description: string;
  workspace: string;
  workspace_name?: string;
  created_by: string;
  created_by_name?: string;
  columns_count: number;
  tasks_count: number;
  columns?: TaskColumn[];
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  file: string;
  original_name: string;
  uploaded_by: string;
  uploaded_by_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface TaskActivity {
  id: string;
  activity_type:
    | 'created'
    | 'updated'
    | 'assigned'
    | 'unassigned'
    | 'moved'
    | 'completed'
    | 'reopened'
    | 'commented';
  description: string;
  user: string;
  user_name: string;
  user_avatar?: string;
  metadata: any;
  created_at: string;
}

export interface TaskComment {
  id: string;
  content: string;
  author: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
}

// Базовые типы для заметок

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// Базовые типы для баз данных
export interface Database {
  id: string;
  name: string;
  title?: string; // Добавляю для совместимости
  description?: string;
  workspace: string;
  created_by: string;
  created_by_name?: string; // Добавляю имя создателя
  created_at: string;
  updated_at: string;
  properties: DatabaseProperty[];
  views: DatabaseView[];
  icon?: string; // Добавляю иконку
  default_view?: 'table' | 'list' | 'board' | 'gallery' | 'calendar'; // Добавляю представление по умолчанию
  properties_count?: number; // Добавляю количество свойств
  records_count?: number; // Добавляю количество записей
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: any;
}

export interface DatabaseView {
  id: string;
  name: string;
  type: string;
  filters?: any;
  sort?: any;
}

export interface DatabaseRecord {
  id: string;
  properties: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Базовые типы для уведомлений
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  is_read?: boolean;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  action_url?: string;
  action_text?: string;
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  remind_at: string;
  created_at: string;
  is_completed?: boolean;
  completed_at?: string;
}

export interface CreateReminderRequest {
  title: string;
  message?: string;
  remind_at: string;
}

// Базовые типы для поиска
export interface SearchRequest {
  query?: string;
  search_type?: string;
  workspace_id?: string;
  filters?: SearchFilters;
  page?: number;
  page_size?: number;
}

export interface SearchFilters {
  type?: string;
  workspace?: string;
  date_from?: string;
  date_to?: string;
  tags?: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  created_at: string;
}

// Типы для результатов поиска
export interface SearchResult {
  id: string;
  type: 'page' | 'task' | 'database' | 'note';
  title: string;
  content: string;
  workspace: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface SearchResults {
  results: SearchResult[];
  total_count: number;
  search_time?: number;
  has_next: boolean;
  has_previous: boolean;
  pages?: SearchResult[];
  tasks?: SearchResult[];
  databases?: SearchResult[];
}

// Добавляю недостающие типы для исправления ошибок
export interface Comment {
  id: string;
  content: string;
  author: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
  parent?: string;
  resolved?: boolean;
  is_resolved?: boolean;
  replies?: Comment[];
}

export interface AutocompleteSuggestion {
  type: string;
  value: string;
  label: string;
  count: number;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_public?: boolean;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  is_public?: boolean;
}

export interface WorkspaceInvite {
  id: string;
  email: string;
  role: string;
  workspace: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
}

export interface WorkspaceStats {
  total_members: number;
  total_tasks: number;
  total_databases: number;
  total_notes: number;
  active_projects: number;
}

// Расширяю типы для совместимости с компонентами
export interface Note {
  id: string;
  title: string;
  content: string;
  workspace: string;
  workspace_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_template: boolean;
  tags: Tag[];
  category?: string | null;
  parent?: string;
  position?: number;
  icon?: string;
  children?: Note[];
  cover_image?: string;
  content_text?: string;
  author_name?: string;
  author?: string;
  last_edited_by?: string;
  last_edited_by_name?: string;
  is_archived?: boolean;
  path?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  board: string;
  status: string;
  created_by: string;
  assigned_to?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  order: number;
  labels: string[];
  attachments: string[];
  column?: string;
  assignees?: string[];
  start_date?: string;
  estimated_hours?: number;
  tags?: Tag[];
  board_title?: string;
  column_title?: string;
  is_overdue?: boolean;
  created_by_name?: string;
  position?: number;
  comments_count?: number;
  attachments_count?: number;
}

export interface WorkspaceMember {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  workspace: string;
  role: string;
  joined_at: string;
  user_name?: string;
  user_email?: string;
  user_id?: string;
}

export interface InviteUserData {
  workspaceId: string;
  email: string;
  role: string;
}
