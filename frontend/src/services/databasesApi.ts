import api from './api';

export interface SelectOption {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'checkbox' | 'url' | 'email' | 'phone' | 'file' | 'formula' | 'relation';
  config: any;
  position: number;
  is_visible: boolean;
  options?: SelectOption[];
  created_at: string;
  updated_at: string;
}

export interface Database {
  id: string;
  title: string;
  description: string;
  icon: string;
  workspace: string;
  workspace_name: string;
  default_view: 'table' | 'gallery' | 'list' | 'board' | 'calendar';
  created_by: string;
  created_by_name: string;
  properties_count: number;
  records_count: number;
  properties?: DatabaseProperty[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseRecord {
  id: string;
  properties: Record<string, any>;
  created_by: string;
  created_by_name: string;
  last_edited_by: string;
  last_edited_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseView {
  id: string;
  name: string;
  type: 'table' | 'gallery' | 'list' | 'board' | 'calendar';
  filters: any[];
  sorts: any[];
  groups: any[];
  properties: string[];
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDatabaseData {
  title: string;
  description?: string;
  icon?: string;
  workspace: string;
  default_view?: 'table' | 'gallery' | 'list' | 'board' | 'calendar';
}

export interface UpdateDatabaseData {
  title?: string;
  description?: string;
  icon?: string;
  default_view?: 'table' | 'gallery' | 'list' | 'board' | 'calendar';
}

export interface CreateDatabasePropertyData {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'checkbox' | 'url' | 'email' | 'phone' | 'file' | 'formula' | 'relation';
  config?: any;
  position?: number;
  options?: Array<{ name: string; color: string }>;
}

export interface CreateDatabaseRecordData {
  properties: Record<string, any>;
}

export interface UpdateDatabaseRecordData {
  properties: Record<string, any>;
}

export interface DatabaseFilter {
  property: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'is_true' | 'is_false';
  value?: any;
}

export interface DatabaseSort {
  property: string;
  direction: 'asc' | 'desc';
}

class DatabasesApi {
  // Databases
  async getDatabases(params?: { workspace?: string }): Promise<Database[]> {
    try {
      const response = await api.get('/databases/', { params });
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching databases:', error);
      return [];
    }
  }

  async getDatabase(id: string): Promise<Database> {
    const response = await api.get(`/databases/${id}/`);
    return response.data;
  }

  async createDatabase(data: CreateDatabaseData): Promise<Database> {
    const response = await api.post('/databases/', data);
    return response.data;
  }

  async updateDatabase(id: string, data: UpdateDatabaseData): Promise<Database> {
    const response = await api.patch(`/databases/${id}/`, data);
    return response.data;
  }

  async deleteDatabase(id: string): Promise<void> {
    await api.delete(`/databases/${id}/`);
  }

  // Database Properties
  async getDatabaseProperties(databaseId: string): Promise<DatabaseProperty[]> {
    try {
      const response = await api.get(`/databases/${databaseId}/properties/`);
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching database properties:', error);
      return [];
    }
  }

  async createDatabaseProperty(databaseId: string, data: CreateDatabasePropertyData): Promise<DatabaseProperty> {
    const response = await api.post(`/databases/${databaseId}/properties/`, data);
    return response.data;
  }

  async updateDatabaseProperty(propertyId: string, data: Partial<CreateDatabasePropertyData>): Promise<DatabaseProperty> {
    const response = await api.patch(`/databases/properties/${propertyId}/`, data);
    return response.data;
  }

  async deleteDatabaseProperty(propertyId: string): Promise<void> {
    await api.delete(`/databases/properties/${propertyId}/`);
  }

  // Database Records
  async getDatabaseRecords(databaseId: string, params?: {
    filters?: string;
    sorts?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    results: DatabaseRecord[];
    count: number;
    next?: string;
    previous?: string;
  }> {
    const response = await api.get(`/databases/${databaseId}/records/`, { params });
    return response.data;
  }

  async getDatabaseRecord(recordId: string): Promise<DatabaseRecord> {
    const response = await api.get(`/databases/records/${recordId}/`);
    return response.data;
  }

  async createDatabaseRecord(databaseId: string, data: CreateDatabaseRecordData): Promise<DatabaseRecord> {
    const response = await api.post(`/databases/${databaseId}/create_record/`, data);
    return response.data;
  }

  async updateDatabaseRecord(recordId: string, data: UpdateDatabaseRecordData): Promise<DatabaseRecord> {
    const response = await api.patch(`/databases/records/${recordId}/`, data);
    return response.data;
  }

  async deleteDatabaseRecord(recordId: string): Promise<void> {
    await api.delete(`/databases/records/${recordId}/`);
  }

  async bulkUpdateRecords(databaseId: string, data: {
    record_ids: string[];
    updates: Record<string, any>;
    operation: 'update' | 'delete';
  }): Promise<{ message: string }> {
    const response = await api.post(`/databases/${databaseId}/bulk-update/`, data);
    return response.data;
  }

  // Database Views
  async getDatabaseViews(databaseId: string): Promise<DatabaseView[]> {
    try {
      const response = await api.get(`/databases/${databaseId}/views/`);
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching database views:', error);
      return [];
    }
  }

  async createDatabaseView(databaseId: string, data: {
    name: string;
    type: 'table' | 'gallery' | 'list' | 'board' | 'calendar';
    filters?: DatabaseFilter[];
    sorts?: DatabaseSort[];
    groups?: any[];
    properties?: string[];
  }): Promise<DatabaseView> {
    const response = await api.post(`/databases/${databaseId}/views/`, data);
    return response.data;
  }

  async updateDatabaseView(viewId: string, data: Partial<{
    name: string;
    type: 'table' | 'gallery' | 'list' | 'board' | 'calendar';
    filters: DatabaseFilter[];
    sorts: DatabaseSort[];
    groups: any[];
    properties: string[];
  }>): Promise<DatabaseView> {
    const response = await api.patch(`/databases/views/${viewId}/`, data);
    return response.data;
  }

  async deleteDatabaseView(viewId: string): Promise<void> {
    await api.delete(`/databases/views/${viewId}/`);
  }

  // Workspace database stats
  async getWorkspaceDatabaseStats(workspaceId: string): Promise<{
    total: number;
    active: number;
    archived: number;
  }> {
    // TODO: Implement when backend endpoint is ready
    console.log('getWorkspaceDatabaseStats called for workspace:', workspaceId);
    return { total: 0, active: 0, archived: 0 };
  }

  // Utilities
  async exportDatabase(databaseId: string, format: 'csv' | 'json' | 'excel'): Promise<Blob> {
    const response = await api.get(`/databases/${databaseId}/export/`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async importDatabase(databaseId: string, file: File, options?: {
    has_headers?: boolean;
    delimiter?: string;
  }): Promise<{ message: string; imported_count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.has_headers !== undefined) {
      formData.append('has_headers', String(options.has_headers));
    }
    if (options?.delimiter) {
      formData.append('delimiter', options.delimiter);
    }

    const response = await api.post(`/databases/${databaseId}/import/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const databasesApi = new DatabasesApi();
