import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { databasesApi, CreateDatabaseData, UpdateDatabaseData, CreateDatabasePropertyData, CreateDatabaseRecordData, UpdateDatabaseRecordData } from '../../features/databases/api';
import toast from 'react-hot-toast';

// Query Keys
export const databaseKeys = {
  all: ['databases'] as const,
  lists: () => [...databaseKeys.all, 'list'] as const,
  list: (filters: any) => [...databaseKeys.lists(), filters] as const,
  details: () => [...databaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...databaseKeys.details(), id] as const,
  properties: (id: string) => [...databaseKeys.detail(id), 'properties'] as const,
  records: (id: string) => [...databaseKeys.detail(id), 'records'] as const,
  record: (id: string) => [...databaseKeys.all, 'record', id] as const,
  views: (id: string) => [...databaseKeys.detail(id), 'views'] as const,
  workspaceDatabases: (workspaceId: string) => [...databaseKeys.lists(), workspaceId] as const,
};

// Databases Hooks
export const useDatabases = (workspaceId?: string) => {
  return useQuery({
    queryKey: workspaceId ? databaseKeys.workspaceDatabases(workspaceId) : databaseKeys.lists(),
    queryFn: () => databasesApi.getDatabases(workspaceId ? { workspace: workspaceId } : undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDatabase = (id: string) => {
  return useQuery({
    queryKey: databaseKeys.detail(id),
    queryFn: () => databasesApi.getDatabase(id),
    enabled: !!id,
  });
};

export const useCreateDatabase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDatabaseData) => databasesApi.createDatabase(data),
    onSuccess: (newDatabase) => {
      // Invalidate databases list
      queryClient.invalidateQueries({ queryKey: databaseKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: databaseKeys.workspaceDatabases(newDatabase.workspace) 
      });
      
      toast.success('Database created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create database');
    },
  });
};

export const useUpdateDatabase = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDatabaseData) => databasesApi.updateDatabase(id, data),
    onSuccess: (updatedDatabase) => {
      // Update the specific database
      queryClient.setQueryData(databaseKeys.detail(id), updatedDatabase);
      
      // Invalidate databases list
      queryClient.invalidateQueries({ queryKey: databaseKeys.lists() });
      
      toast.success('Database updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update database');
    },
  });
};

export const useDeleteDatabase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => databasesApi.deleteDatabase(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: databaseKeys.detail(deletedId) });
      
      // Invalidate databases list
      queryClient.invalidateQueries({ queryKey: databaseKeys.lists() });
      
      toast.success('Database deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete database');
    },
  });
};

// Database Properties Hooks
export const useDatabaseProperties = (databaseId: string) => {
  return useQuery({
    queryKey: databaseKeys.properties(databaseId),
    queryFn: () => databasesApi.getDatabaseProperties(databaseId),
    enabled: !!databaseId,
  });
};

export const useCreateDatabaseProperty = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDatabasePropertyData) => 
      databasesApi.createDatabaseProperty(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.properties(databaseId) });
      queryClient.invalidateQueries({ queryKey: databaseKeys.detail(databaseId) });
      toast.success('Property created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create property');
    },
  });
};

export const useUpdateDatabaseProperty = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, data }: { propertyId: string; data: Partial<CreateDatabasePropertyData> }) =>
      databasesApi.updateDatabaseProperty(databaseId, propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.properties(databaseId) });
      toast.success('Property updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update property');
    },
  });
};

export const useDeleteDatabaseProperty = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => databasesApi.deleteDatabaseProperty(databaseId, propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.properties(databaseId) });
      queryClient.invalidateQueries({ queryKey: databaseKeys.records(databaseId) });
      toast.success('Property deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete property');
    },
  });
};

// Database Records Hooks
export const useWorkspaceDatabases = (workspaceId: string) => {
  return useQuery({
    queryKey: databaseKeys.workspaceDatabases(workspaceId),
    queryFn: () => databasesApi.getDatabases({ workspace: workspaceId }),
    enabled: !!workspaceId,
  });
};

export const useWorkspaceDatabaseStats = (workspaceId: string) => {
  return useQuery({
    queryKey: [...databaseKeys.workspaceDatabases(workspaceId), 'stats'],
    queryFn: () => databasesApi.getWorkspaceDatabaseStats(workspaceId),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDatabaseRecords = (databaseId: string, params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: [...databaseKeys.records(databaseId), params],
    queryFn: () => databasesApi.getDatabaseRecords(databaseId, { limit: params?.page_size }),
    enabled: !!databaseId,
    placeholderData: keepPreviousData,
  });
};

export const useDatabaseRecord = (databaseId: string, recordId: string) => {
  return useQuery({
    queryKey: databaseKeys.record(recordId),
    queryFn: () => databasesApi.getDatabaseRecords(databaseId, { limit: 1 }).then(records => 
      records.find(r => r.id === recordId)
    ),
    enabled: !!recordId,
  });
};

export const useCreateDatabaseRecord = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDatabaseRecordData) => 
      databasesApi.createDatabaseRecord(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.records(databaseId) });
      queryClient.invalidateQueries({ queryKey: databaseKeys.detail(databaseId) });
      toast.success('Record created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create record');
    },
  });
};

export const useUpdateDatabaseRecord = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: UpdateDatabaseRecordData }) =>
      databasesApi.updateDatabaseRecord(databaseId, recordId, data),
    onSuccess: (updatedRecord) => {
      // Update the specific record
      queryClient.setQueryData(databaseKeys.record(updatedRecord.id), updatedRecord);
      
      // Invalidate records list
      queryClient.invalidateQueries({ queryKey: databaseKeys.records(databaseId) });
      
      toast.success('Record updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update record');
    },
  });
};

export const useDeleteDatabaseRecord = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => databasesApi.deleteDatabaseRecord(databaseId, recordId),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: databaseKeys.record(deletedId) });
      
      // Invalidate records list
      queryClient.invalidateQueries({ queryKey: databaseKeys.records(databaseId) });
      
      toast.success('Record deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete record');
    },
  });
};

export const useBulkUpdateRecords = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      record_ids: string[];
      updates: Record<string, any>;
      operation: 'update' | 'delete';
    }) => databasesApi.bulkUpdateRecords(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.records(databaseId) });
      queryClient.invalidateQueries({ queryKey: databaseKeys.detail(databaseId) });
      toast.success('Records updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update records');
    },
  });
};

// Database Views Hooks
export const useDatabaseViews = (databaseId: string) => {
  return useQuery({
    queryKey: databaseKeys.views(databaseId),
    queryFn: () => databasesApi.getDatabaseViews(databaseId),
    enabled: !!databaseId,
  });
};

export const useCreateDatabaseView = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => databasesApi.createDatabaseView(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.views(databaseId) });
      toast.success('View created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create view');
    },
  });
};

// Import/Export Hooks
export const useExportDatabase = () => {
  return useMutation({
    mutationFn: ({ databaseId, format }: { databaseId: string; format: 'csv' | 'json' | 'excel' }) =>
      databasesApi.exportDatabase(databaseId, format),
    onSuccess: (blob, { format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `database.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Database exported successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to export database');
    },
  });
};

export const useImportDatabase = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, options }: { 
      file: File; 
      options?: { has_headers?: boolean; delimiter?: string } 
    }) => databasesApi.importDatabase(databaseId, file, options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.records(databaseId) });
      queryClient.invalidateQueries({ queryKey: databaseKeys.detail(databaseId) });
      toast.success(`Imported ${result.imported_count} records successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to import data');
    },
  });
};
