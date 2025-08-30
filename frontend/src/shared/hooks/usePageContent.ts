import { useQuery } from '@tanstack/react-query';
import { notesApi } from '../../features/notes/api';

export const usePageContent = (pageId: string | null) => {
  return useQuery({
    queryKey: ['page-content', pageId],
    queryFn: () => notesApi.getPage(pageId!),
    enabled: !!pageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
