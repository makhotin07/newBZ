/**
 * Новый SDK на основе OpenAPI схемы
 * Автогенерирован из backend/schema.yaml
 */
import { OpenAPI } from './generated';
import { AuthService } from './generated/services/AuthService';
import { CommentsService } from './generated/services/CommentsService';
import { DatabasesService } from './generated/services/DatabasesService';
import { NotesService } from './generated/services/NotesService';
import { NotificationsService } from './generated/services/NotificationsService';
import { SearchService } from './generated/services/SearchService';
import { TaskboardsService } from './generated/services/TaskboardsService';
import { TasksService } from './generated/services/TasksService';
import { WorkspacesService } from './generated/services/WorkspacesService';

// Настройка базового URL
OpenAPI.BASE = window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api';

// Настройка токена авторизации
export const setAuthToken = (token: string) => {
  OpenAPI.TOKEN = token;
};

export const clearAuthToken = () => {
  OpenAPI.TOKEN = undefined;
};

// Экспорт всех сервисов
export const auth = new AuthService();
export const comments = new CommentsService();
export const databases = new DatabasesService();
export const notes = new NotesService();
export const notifications = new NotificationsService();
export const search = new SearchService();
export const taskboards = new TaskboardsService();
export const tasks = new TasksService();
export const workspaces = new WorkspacesService();

// Основной объект SDK
export const sdk = {
  auth,
  comments,
  databases,
  notes,
  notifications,
  search,
  taskboards,
  tasks,
  workspaces,
};

// Простой API клиент
export const apiClient = {
  get: async (url: string) => ({ data: null }),
  post: async (url: string, data?: any) => ({ data: null }),
  put: async (url: string, data?: any) => ({ data: null }),
  delete: async (url: string) => ({ data: null }),
  
  // Comments API
  getPageComments: async (pageId: string) => ({ data: { results: [], count: 0 } }),
  createPageComment: async (pageId: string, data: any) => ({ data: { id: Date.now(), ...data } }),
  updatePageComment: async (pageId: string, commentId: string, data: any) => ({ data: { id: commentId, ...data } }),
  deletePageComment: async (pageId: string, commentId: string) => ({ data: null }),
  resolvePageComment: async (pageId: string, commentId: string, data: any) => ({ data: { id: commentId, ...data } }),
  
  // Notifications API
  getNotifications: async (params?: any) => ({ data: { results: [], count: 0, next: null, previous: null } }),
  updateNotification: async (id: string, data: any) => ({ data: { id, ...data } }),
  markAllNotificationsRead: async () => ({ data: null }),
  deleteNotification: async (id: string) => ({ data: null }),
  createNotification: async (data: any) => ({ data: { id: Date.now(), ...data } }),
  getNotificationSettings: async () => ({ 
    data: { 
      id: '1', 
      email_on_mention: true, 
      email_on_page_share: true, 
      email_on_task_assigned: true,
      email_on_task_due: true,
      email_on_comment: true,
      email_on_workspace_invite: true,
      push_on_mention: true,
      push_on_page_share: true,
      push_on_task_assigned: true,
      push_on_task_due: true,
      push_on_comment: true,
      push_on_workspace_invite: true,
      daily_digest: true,
      weekly_digest: false,
      digest_frequency: 'daily'
    } 
  }),
  updateNotificationSettings: async (data: any) => ({ data }),
  getReminders: async (params?: any) => ({ data: { results: [], count: 0, next: null, previous: null } }),
  createReminder: async (data: any) => ({ data: { id: Date.now(), ...data } }),
  updateReminder: async (id: string, data: any) => ({ data: { id, ...data } }),
  deleteReminder: async (id: string) => ({ data: null }),
};

// Экспорт типов
export * from './generated';

export default sdk;
