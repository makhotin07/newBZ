import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databasesApi } from '../api';
import type { Database, DatabaseProperty, DatabaseRecord } from '../types/database';

/**
 * Хук для работы с базой данных
 * Предоставляет удобные методы для CRUD операций с кешированием
 */
export const useDatabase = (databaseId: string) => {
  const queryClient = useQueryClient();

  // Запрос данных базы данных
  const {
    data: database,
    isLoading: isLoadingDatabase,
    error: databaseError
  } = useQuery({
    queryKey: ['database', databaseId],
    queryFn: () => databasesApi.getDatabase(databaseId).then(res => res.data),
    enabled: !!databaseId,
  });

  // Запрос свойств базы данных
  const {
    data: properties = [],
    isLoading: isLoadingProperties,
    error: propertiesError
  } = useQuery({
    queryKey: ['database-properties', databaseId],
    queryFn: () => databasesApi.getProperties(databaseId).then(res => res.data),
    enabled: !!databaseId,
  });

  // Запрос записей базы данных
  const {
    data: records = [],
    isLoading: isLoadingRecords,
    error: recordsError
  } = useQuery({
    queryKey: ['database-records', databaseId],
    queryFn: () => databasesApi.getRecords(databaseId).then(res => res.data),
    enabled: !!databaseId,
  });

  // Мутация для обновления записи
  const updateRecordMutation = useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: Record<string, any> }) =>
      databasesApi.updateRecord(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-records', databaseId] });
    },
  });

  // Мутация для создания записи
  const createRecordMutation = useMutation({
    mutationFn: (data: Record<string, any>) => databasesApi.createRecord(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-records', databaseId] });
    },
  });

  // Мутация для создания свойства
  const createPropertyMutation = useMutation({
    mutationFn: (data: Partial<DatabaseProperty>) => databasesApi.createProperty(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-properties', databaseId] });
    },
  });

  // Мутация для удаления записи
  const deleteRecordMutation = useMutation({
    mutationFn: (recordId: string) => databasesApi.deleteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-records', databaseId] });
    },
  });

  // Мутация для удаления свойства
  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: string) => databasesApi.deleteProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-properties', databaseId] });
      queryClient.invalidateQueries({ queryKey: ['database-records', databaseId] });
    },
  });

  // Мутация для обновления свойства
  const updatePropertyMutation = useMutation({
    mutationFn: ({ propertyId, data }: { propertyId: string; data: Partial<DatabaseProperty> }) =>
      databasesApi.updateProperty(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-properties', databaseId] });
    },
  });

  // Мутация для обновления базы данных
  const updateDatabaseMutation = useMutation({
    mutationFn: (data: any) => databasesApi.updateDatabase(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database', databaseId] });
    },
  });

  // Методы для работы с записями
  const updateRecord = (recordId: string, data: Record<string, any>) => {
    return updateRecordMutation.mutateAsync({ recordId, data });
  };

  const createRecord = (data: Record<string, any>) => {
    return createRecordMutation.mutateAsync(data);
  };

  const deleteRecord = (recordId: string) => {
    return deleteRecordMutation.mutateAsync(recordId);
  };

  // Методы для работы со свойствами
  const createProperty = (data: Partial<DatabaseProperty>) => {
    return createPropertyMutation.mutateAsync(data);
  };

  const updateProperty = (propertyId: string, data: Partial<DatabaseProperty>) => {
    return updatePropertyMutation.mutateAsync({ propertyId, data });
  };

  const deleteProperty = (propertyId: string) => {
    return deletePropertyMutation.mutateAsync(propertyId);
  };

  // Методы для работы с базой данных
  const updateDatabase = (data: any) => {
    return updateDatabaseMutation.mutateAsync(data);
  };

  // Состояния загрузки
  const isLoading = isLoadingDatabase || isLoadingProperties || isLoadingRecords;
  const hasError = databaseError || propertiesError || recordsError;

  return {
    // Данные
    database,
    properties,
    records,
    
    // Состояния
    isLoading,
    isLoadingDatabase,
    isLoadingProperties,
    isLoadingRecords,
    hasError,
    databaseError,
    propertiesError,
    recordsError,
    
    // Мутации
    updateRecordMutation,
    createRecordMutation,
    createPropertyMutation,
    deleteRecordMutation,
    deletePropertyMutation,
    updatePropertyMutation,
    updateDatabaseMutation,
    
    // Методы
    updateRecord,
    createRecord,
    deleteRecord,
    createProperty,
    updateProperty,
    deleteProperty,
    updateDatabase,
  };
};
