import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchApi, SearchRequest, SavedSearch } from '../../features/search/api';

// Search query keys
export const searchKeys = {
  all: ['search'] as const,
  search: (request: SearchRequest) => [...searchKeys.all, 'search', request] as const,
  quickSearch: (query: string, workspaceId?: string) => [...searchKeys.all, 'quick', query, workspaceId] as const,
  autocomplete: (query: string, workspaceId?: string) => [...searchKeys.all, 'autocomplete', query, workspaceId] as const,
  suggestions: (workspaceId?: string) => [...searchKeys.all, 'suggestions', workspaceId] as const,
  history: (workspaceId?: string) => [...searchKeys.all, 'history', workspaceId] as const,
  savedSearches: (workspaceId?: string) => [...searchKeys.all, 'saved', workspaceId] as const,
};

// Main search hook
export const useSearch = (searchRequest: SearchRequest, enabled: boolean = true) => {
  return useQuery({
    queryKey: searchKeys.search(searchRequest),
    queryFn: () => searchApi.search(searchRequest),
    enabled: enabled && (!!searchRequest.query || Object.keys(searchRequest.filters || {}).length > 0),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Quick search hook for global search
export const useQuickSearch = (query: string, workspaceId?: string) => {
  return useQuery({
    queryKey: searchKeys.quickSearch(query, workspaceId),
    queryFn: () => searchApi.quickSearch(query, workspaceId),
    enabled: query.length >= 2,
    staleTime: 1000 * 60, // 1 minute
  });
};

// Autocomplete hook
export const useAutocomplete = (query: string, workspaceId?: string, limit: number = 10) => {
  return useQuery({
    queryKey: searchKeys.autocomplete(query, workspaceId),
    queryFn: () => searchApi.getAutocomplete(query, workspaceId, limit),
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
};

// Search suggestions hook
export const useSearchSuggestions = (workspaceId?: string) => {
  return useQuery({
    queryKey: searchKeys.suggestions(workspaceId),
    queryFn: () => searchApi.getSearchSuggestions(workspaceId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Search history hook
export const useSearchHistory = (workspaceId?: string) => {
  return useQuery({
    queryKey: searchKeys.history(workspaceId),
    queryFn: () => searchApi.getSearchHistory(workspaceId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Clear search history mutation
export const useClearSearchHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId?: string) => searchApi.clearSearchHistory(workspaceId),
    onSuccess: (_, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: searchKeys.history(workspaceId) });
    },
  });
};

// Saved searches hook
export const useSavedSearches = (workspaceId?: string) => {
  return useQuery({
    queryKey: searchKeys.savedSearches(workspaceId),
    queryFn: () => searchApi.getSavedSearches(workspaceId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Create saved search mutation
export const useCreateSavedSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SavedSearch> & { workspace_id?: string }) =>
      searchApi.createSavedSearch(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: searchKeys.savedSearches(variables.workspace_id) 
      });
    },
  });
};

// Update saved search mutation
export const useUpdateSavedSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavedSearch> }) =>
      searchApi.updateSavedSearch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.savedSearches() });
    },
  });
};

// Delete saved search mutation
export const useDeleteSavedSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => searchApi.deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.savedSearches() });
    },
  });
};

// Execute saved search mutation
export const useExecuteSavedSearch = () => {
  return useMutation({
    mutationFn: ({ id, page, pageSize }: { id: string; page?: number; pageSize?: number }) =>
      searchApi.executeSavedSearch(id, page, pageSize),
  });
};
