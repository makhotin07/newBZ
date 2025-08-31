import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, Page, CreatePageData, UpdatePageData } from '../../features/notes/api';
import toast from 'react-hot-toast';

// Query Keys
export const notesKeys = {
  all: ['notes'] as const,
  pages: () => [...notesKeys.all, 'pages'] as const,
  page: (id: string) => [...notesKeys.pages(), id] as const,
  pageChildren: (id: string) => [...notesKeys.page(id), 'children'] as const,

  pageVersions: (id: string) => [...notesKeys.page(id), 'versions'] as const,
  pageBlocks: (id: string) => [...notesKeys.page(id), 'blocks'] as const,
  tags: () => [...notesKeys.all, 'tags'] as const,
  search: (query: string, params?: any) => [...notesKeys.all, 'search', query, params] as const,
  workspacePages: (workspaceId: string, params?: any) => [...notesKeys.pages(), workspaceId, params] as const,
};

// Pages Hooks
export const usePages = (params?: {
  workspace?: string;
  parent?: string | 'null';
  archived?: boolean;
  templates?: boolean;
}) => {
  return useQuery({
    queryKey: params?.workspace 
      ? notesKeys.workspacePages(params.workspace, params)
      : notesKeys.pages(),
    queryFn: () => notesApi.getPages(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePage = (id: string) => {
  return useQuery({
    queryKey: notesKeys.page(id),
    queryFn: () => notesApi.getPage(id),
    enabled: !!id,
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePageData) => notesApi.createPage(data),
    onSuccess: (newPage: Page) => {
      // Invalidate pages list
      queryClient.invalidateQueries({ queryKey: notesKeys.pages() });
      queryClient.invalidateQueries({ 
        queryKey: notesKeys.workspacePages(newPage.workspace) 
      });
      
      // If it's a child page, invalidate parent's children
      if (newPage.parent) {
        queryClient.invalidateQueries({ 
          queryKey: notesKeys.pageChildren(newPage.parent) 
        });
      }
      
      toast.success('Page created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create page');
    },
  });
};

export const useUpdatePage = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePageData) => notesApi.updatePage(id, data),
    onSuccess: (updatedPage: Page) => {
      // Update the specific page
      queryClient.setQueryData(notesKeys.page(id), updatedPage);
      
      // Invalidate pages list
      queryClient.invalidateQueries({ queryKey: notesKeys.pages() });
      queryClient.invalidateQueries({ 
        queryKey: notesKeys.workspacePages(updatedPage.workspace) 
      });
      
      toast.success('Page updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update page');
    },
  });
};

export const useRecentPages = (workspaceId: string, limit: number = 5) => {
  return useQuery({
    queryKey: [...notesKeys.workspacePages(workspaceId), 'recent', limit],
    queryFn: () => notesApi.getRecentPages(workspaceId, limit),
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSharePage = (pageId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { page_id: string; share_type: 'public' | 'private'; public_access: boolean }) => 
      notesApi.sharePage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.page(pageId) });
      toast.success('Настройки доступа обновлены!');
    },
    onError: (error: any) => {
      toast.error('Ошибка при обновлении настроек доступа');
    },
  });
};

export const useGetPageShares = (pageId: string) => {
  return useQuery({
    queryKey: [...notesKeys.page(pageId), 'shares'],
    queryFn: () => notesApi.getPageShares(pageId),
    enabled: !!pageId,
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.deletePage(id),
    onSuccess: (_: unknown, deletedId: string) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: notesKeys.page(deletedId) });
      
      // Invalidate pages list
      queryClient.invalidateQueries({ queryKey: notesKeys.pages() });
      
      toast.success('Page deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete page');
    },
  });
};

export const useArchivePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.archivePage(id),
    onSuccess: (updatedPage: Page) => {
      queryClient.setQueryData(notesKeys.page(updatedPage.id), updatedPage);
      queryClient.invalidateQueries({ queryKey: notesKeys.pages() });
      
      const action = updatedPage.is_archived ? 'archived' : 'unarchived';
      toast.success(`Page ${action} successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to archive page');
    },
  });
};

export const useDuplicatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.duplicatePage(id),
    onSuccess: (duplicatedPage: Page) => {
      queryClient.invalidateQueries({ queryKey: notesKeys.pages() });
      queryClient.invalidateQueries({ 
        queryKey: notesKeys.workspacePages(duplicatedPage.workspace) 
      });
      
      toast.success('Page duplicated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to duplicate page');
    },
  });
};

// Tags Hooks
export const useTags = () => {
  return useQuery({
    queryKey: notesKeys.tags(),
    queryFn: () => notesApi.getTags(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) => 
      notesApi.createTag(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.tags() });
      toast.success('Tag created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create tag');
    },
  });
};



// Search Hook
export const useSearchPages = (query: string, params?: { workspace?: string }) => {
  return useQuery({
    queryKey: notesKeys.search(query, params),
    queryFn: () => notesApi.searchPages(query, params),
    enabled: query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Page Children Hook
export const usePageChildren = (pageId: string) => {
  return useQuery({
    queryKey: notesKeys.pageChildren(pageId),
    queryFn: () => notesApi.getPageChildren(pageId),
    enabled: !!pageId,
  });
};

// Page Versions Hook  
export const usePageVersions = (pageId: string) => {
  return useQuery({
    queryKey: notesKeys.pageVersions(pageId),
    queryFn: () => notesApi.getPageVersions(pageId),
    enabled: !!pageId,
  });
};
