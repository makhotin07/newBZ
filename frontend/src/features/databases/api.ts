import api from '../../shared/api';
import type { 
  Database, 
  DatabaseProperty, 
  DatabaseRecord, 
  DatabaseView,
  DatabaseRecordRevision
} from './types/database';

// Основные API функции для баз данных
export const databasesApi = {
  // Базы данных
  getDatabases: (workspaceId?: string) => 
    api.get<Database[]>('/databases/', { 
      params: workspaceId ? { workspace_id: workspaceId } : {} 
    }),
  
  getDatabase: (id: string) => 
    api.get<Database>(`/databases/${id}/`),
  
  createDatabase: (data: Partial<Database>) => 
    api.post<Database>('/databases/', data),
  
  updateDatabase: (id: string, data: Partial<Database>) => 
    api.patch<Database>(`/databases/${id}/`, data),
  
  deleteDatabase: (id: string) => 
    api.delete(`/databases/${id}/`),

  // Свойства базы данных
  getProperties: (databaseId: string) => 
    api.get<DatabaseProperty[]>(`/databases/${databaseId}/properties/`),
  
  createProperty: (databaseId: string, data: Partial<DatabaseProperty>) => 
    api.post<DatabaseProperty>(`/databases/${databaseId}/create_property/`, data),
  
  updateProperty: (propertyId: string, data: Partial<DatabaseProperty>) => 
    api.patch<DatabaseProperty>(`/properties/${propertyId}/`, data),
  
  deleteProperty: (propertyId: string) => 
    api.delete(`/properties/${propertyId}/`),

  // Записи базы данных
  getRecords: (databaseId: string, filters?: Record<string, any>) => 
    api.get<DatabaseRecord[]>(`/databases/${databaseId}/records/`, { params: filters }),
  
  getRecord: (recordId: string) => 
    api.get<DatabaseRecord>(`/records/${recordId}/`),
  
  createRecord: (databaseId: string, data: Record<string, any>) => 
    api.post<DatabaseRecord>(`/databases/${databaseId}/create_record/`, data),
  
  updateRecord: (recordId: string, data: Record<string, any>) => 
    api.patch<DatabaseRecord>(`/records/${recordId}/`, data),
  
  deleteRecord: (recordId: string) => 
    api.delete(`/records/${recordId}/`),

  // Представления базы данных
  getViews: (databaseId: string) => 
    api.get<DatabaseView[]>(`/databases/${databaseId}/views/`),
  
  createView: (databaseId: string, data: Partial<DatabaseView>) => 
    api.post<DatabaseView>(`/databases/${databaseId}/create_view/`, data),
  
  updateView: (viewId: string, data: Partial<DatabaseView>) => 
    api.patch<DatabaseView>(`/views/${viewId}/`, data),
  
  deleteView: (viewId: string) => 
    api.delete(`/views/${viewId}/`),



  // История изменений записей
  getRecordHistory: (recordId: string) => 
    api.get<DatabaseRecordRevision[]>(`/records/${recordId}/history/`),

  // Поиск связанных записей для relation property
  searchRelationRecords: (databaseId: string, query?: string) => 
    api.get<DatabaseRecord[]>(`/databases/${databaseId}/records/`, { 
      params: { search: query, limit: 10 } 
    }),

  // Валидация формул
  validateFormula: (expression: string, databaseId: string) => 
    api.post<{ valid: boolean; error?: string; dependencies?: string[] }>(`/databases/${databaseId}/validate_formula/`, {
      expression
    }),
};
