import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databasesApi } from '../api';
import { DatabaseView, ViewConfig } from '../types/views';

interface UseDatabaseViewProps {
  databaseId: string;
  viewId?: string;
}

/**
 * Хук для работы с представлениями базы данных
 * Загружает фильтры, сортировку и настройки представления
 */
export const useDatabaseView = ({ databaseId, viewId }: UseDatabaseViewProps) => {
  const queryClient = useQueryClient();

  // Запрос представлений базы данных
  const {
    data: views = [],
    isLoading: isLoadingViews,
    error: viewsError
  } = useQuery({
    queryKey: ['database-views', databaseId],
    queryFn: () => databasesApi.getViews(databaseId).then(res => res.data),
    enabled: !!databaseId,
  });

  // Запрос конкретного представления
  const {
    data: currentView,
    isLoading: isLoadingCurrentView,
    error: currentViewError
  } = useQuery({
    queryKey: ['database-view', databaseId, viewId],
    queryFn: () => {
      if (!viewId) return null;
      return (views as any).find((v: any) => v.id === viewId) || null;
    },
    enabled: !!databaseId && !!viewId && views.length > 0,
  });

  // Мутация для создания представления
  const createViewMutation = useMutation({
    mutationFn: (data: Partial<DatabaseView>) => databasesApi.createView(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-views', databaseId] });
    },
  });

  // Мутация для обновления представления
  const updateViewMutation = useMutation({
    mutationFn: ({ viewId, data }: { viewId: string; data: Partial<DatabaseView> }) =>
      databasesApi.updateView(viewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-views', databaseId] });
      queryClient.invalidateQueries({ queryKey: ['database-view', databaseId, viewId] });
    },
  });

  // Мутация для удаления представления
  const deleteViewMutation = useMutation({
    mutationFn: (viewId: string) => databasesApi.deleteView(viewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-views', databaseId] });
    },
  });

  // Методы для работы с представлениями
  const createView = (data: Partial<DatabaseView>) => {
    return createViewMutation.mutateAsync(data);
  };

  const updateView = (viewId: string, data: Partial<DatabaseView>) => {
    return updateViewMutation.mutateAsync({ viewId, data });
  };

  const deleteView = (viewId: string) => {
    return deleteViewMutation.mutateAsync(viewId);
  };

  // Получение конфигурации представления
  const getViewConfig = (): ViewConfig | null => {
    if (!currentView) return null;
    return currentView.config;
  };

  // Получение фильтров представления
  const getViewFilters = () => {
    const config = getViewConfig();
    return config?.filters || [];
  };

  // Получение сортировки представления
  const getViewSorts = () => {
    const config = getViewConfig();
    return config?.sorts || [];
  };

  // Получение группировки представления
  const getViewGroups = () => {
    const config = getViewConfig();
    return config?.groups || [];
  };

  // Применение фильтров к записям
  const applyFilters = (records: any[], filters: any[]) => {
    if (!filters.length) return records;

    return records.filter(record => {
      return filters.every(filter => {
        const value = record.properties[filter.property_id];
        
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'not_equals':
            return value !== filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'not_contains':
            return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greater_than':
            return Number(value) > Number(filter.value);
          case 'less_than':
            return Number(value) < Number(filter.value);
          case 'is_empty':
            return !value || value === '';
          case 'is_not_empty':
            return value && value !== '';
          default:
            return true;
        }
      });
    });
  };

  // Применение сортировки к записям
  const applySorts = (records: any[], sorts: any[]) => {
    if (!sorts.length) return records;

    return [...records].sort((a, b) => {
      for (const sort of sorts) {
        const aValue = a.properties[sort.property_id];
        const bValue = b.properties[sort.property_id];
        
        if (aValue === bValue) continue;
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;
        
        return sort.direction === 'desc' ? -comparison : comparison;
      }
      return 0;
    });
  };

  // Применение группировки к записям
  const applyGroups = (records: any[], groups: any[]) => {
    if (!groups.length) return records;

    const grouped: { [key: string]: any[] } = {};
    
    records.forEach(record => {
      const groupKey = groups.map(group => record.properties[group.property_id]).join('|');
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(record);
    });

    return grouped;
  };

  // Получение отфильтрованных и отсортированных записей
  const getProcessedRecords = (records: any[]) => {
    const config = getViewConfig();
    if (!config) return records;

    let processed = records;

    // Применяем фильтры
    if (config.filters) {
      processed = applyFilters(processed, config.filters);
    }

    // Применяем сортировку
    if (config.sorts) {
      processed = applySorts(processed, config.sorts);
    }

    return processed;
  };

  // Состояния загрузки
  const isLoading = isLoadingViews || isLoadingCurrentView;
  const hasError = viewsError || currentViewError;

  return {
    // Данные
    views,
    currentView,
    
    // Состояния
    isLoading,
    isLoadingViews,
    isLoadingCurrentView,
    hasError,
    viewsError,
    currentViewError,
    
    // Мутации
    createViewMutation,
    updateViewMutation,
    deleteViewMutation,
    
    // Методы
    createView,
    updateView,
    deleteView,
    
    // Конфигурация
    getViewConfig,
    getViewFilters,
    getViewSorts,
    getViewGroups,
    
    // Обработка данных
    applyFilters,
    applySorts,
    applyGroups,
    getProcessedRecords,
  };
};
