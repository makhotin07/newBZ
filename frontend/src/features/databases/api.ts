import api from '../../shared/api';

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

  async updateDatabaseProperty(databaseId: string, propertyId: string, data: Partial<CreateDatabasePropertyData>): Promise<DatabaseProperty> {
    const response = await api.patch(`/databases/${databaseId}/properties/${propertyId}/`, data);
    return response.data;
  }

  async deleteDatabaseProperty(databaseId: string, propertyId: string): Promise<void> {
    await api.delete(`/databases/${databaseId}/properties/${propertyId}/`);
  }

  // Database Records
  async getDatabaseRecords(databaseId: string, params?: {
    limit?: number;
  }): Promise<DatabaseRecord[]> {
    try {
      const response = await api.get(`/databases/${databaseId}/records/`, { params });
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching database records:', error);
      return [];
    }
  }

  async createDatabaseRecord(databaseId: string, data: CreateDatabaseRecordData): Promise<DatabaseRecord> {
    const response = await api.post(`/databases/${databaseId}/records/`, data);
    return response.data;
  }

  async updateDatabaseRecord(databaseId: string, recordId: string, data: UpdateDatabaseRecordData): Promise<DatabaseRecord> {
    const response = await api.patch(`/databases/${databaseId}/records/${recordId}/`, data);
    return response.data;
  }

  async deleteDatabaseRecord(databaseId: string, recordId: string): Promise<void> {
    await api.delete(`/databases/${databaseId}/records/${recordId}/`);
  }

  // Bulk Operations
  async bulkUpdateRecords(databaseId: string, data: {
    record_ids: string[];
    updates: Record<string, any>;
    operation: 'update' | 'delete';
  }): Promise<any> {
    const response = await api.post(`/databases/${databaseId}/bulk/`, data);
    return response.data;
  }

  // Database Views
  async getDatabaseViews(databaseId: string): Promise<any[]> {
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

  async createDatabaseView(databaseId: string, data: any): Promise<any> {
    const response = await api.post(`/databases/${databaseId}/views/`, data);
    return response.data;
  }

  // Import/Export
  async exportDatabase(databaseId: string, format: 'csv' | 'json' | 'excel'): Promise<Blob> {
    const response = await api.get(`/databases/${databaseId}/export/`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  async importDatabase(databaseId: string, file: File, options?: { 
    has_headers?: boolean; 
    delimiter?: string 
  }): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    
    const response = await api.post(`/databases/${databaseId}/import_data/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Workspace Database Stats
  async getWorkspaceDatabaseStats(workspaceId: string): Promise<any> {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/database-stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace database stats:', error);
      return {
        total_databases: 0,
        total_records: 0,
        total_properties: 0
      };
    }
  }
}

export const databasesApi = new DatabasesApi();
