import { useMutation, useQueryClient } from '@tanstack/react-query';
import { databasesApi } from '../api';

/**
 * Хук для создания свойства базы данных
 */
export const useCreateDatabaseProperty = (databaseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyData: any) => databasesApi.createProperty(databaseId, propertyData),
    onSuccess: () => {
      // Инвалидируем кеш свойств и записей
      queryClient.invalidateQueries({ queryKey: ['database-properties', databaseId] });
      queryClient.invalidateQueries({ queryKey: ['database-records', databaseId] });
      queryClient.invalidateQueries({ queryKey: ['database', databaseId] });
    },
  });
};

/**
 * Хук для обновления свойства базы данных
 */
export const useUpdateDatabaseProperty = (propertyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyData: any) => databasesApi.updateProperty(propertyId, propertyData),
    onSuccess: (_, variables) => {
      // Инвалидируем кеш свойств и записей
      queryClient.invalidateQueries({ queryKey: ['database-properties'] });
      queryClient.invalidateQueries({ queryKey: ['database-records'] });
    },
  });
};

/**
 * Хук для удаления свойства базы данных
 */
export const useDeleteDatabaseProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => databasesApi.deleteProperty(propertyId),
    onSuccess: () => {
      // Инвалидируем кеш свойств и записей
      queryClient.invalidateQueries({ queryKey: ['database-properties'] });
      queryClient.invalidateQueries({ queryKey: ['database-records'] });
    },
  });
};
