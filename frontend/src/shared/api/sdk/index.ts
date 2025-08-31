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

// Экспорт типов
export * from './generated';

export default sdk;
