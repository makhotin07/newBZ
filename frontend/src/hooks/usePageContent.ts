import { useQuery } from '@tanstack/react-query';
import { notesApi, Page } from '../services/notesApi';

export const usePageContent = (pageId: string | null) => {
  return useQuery({
    queryKey: ['page-content', pageId],
    queryFn: () => notesApi.getPage(pageId!),
    enabled: !!pageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
