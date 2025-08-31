import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/sdk';
import { 
  Comment, 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  ResolveCommentRequest,
  CommentsResponse 
} from './types';

// Query keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (pageId: string) => [...commentKeys.lists(), pageId] as const,
  details: () => [...commentKeys.all, 'detail'] as const,
  detail: (pageId: string, commentId: string) => [...commentKeys.details(), pageId, commentId] as const,
};

// API functions
export const commentsApi = {
  getPageComments: async (pageId: string): Promise<CommentsResponse> => {
    const response = await apiClient.getPageComments(pageId);
    return response.data;
  },

  createComment: async (pageId: string, data: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.createPageComment(pageId, data);
    return response.data;
  },

  updateComment: async (pageId: string, commentId: string, data: UpdateCommentRequest): Promise<Comment> => {
    const response = await apiClient.updatePageComment(pageId, commentId, data);
    return response.data;
  },

  deleteComment: async (pageId: string, commentId: string): Promise<void> => {
    await apiClient.deletePageComment(pageId, commentId);
  },

  resolveComment: async (pageId: string, commentId: string, data: ResolveCommentRequest): Promise<Comment> => {
    const response = await apiClient.resolvePageComment(pageId, commentId, data);
    return response.data;
  },
};

// React Query hooks
export const usePageComments = (pageId: string) => {
  return useQuery({
    queryKey: commentKeys.list(pageId),
    queryFn: () => commentsApi.getPageComments(pageId),
    enabled: !!pageId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pageId, data }: { pageId: string; data: CreateCommentRequest }) =>
      commentsApi.createComment(pageId, data),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(pageId) });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pageId, commentId, data }: { pageId: string; commentId: string; data: UpdateCommentRequest }) =>
      commentsApi.updateComment(pageId, commentId, data),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(pageId) });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pageId, commentId }: { pageId: string; commentId: string }) =>
      commentsApi.deleteComment(pageId, commentId),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(pageId) });
    },
  });
};

export const useResolveComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pageId, commentId, data }: { pageId: string; commentId: string; data: ResolveCommentRequest }) =>
      commentsApi.resolveComment(pageId, commentId, data),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(pageId) });
    },
  });
};

// Export types
export type { Comment, CreateCommentRequest, UpdateCommentRequest, ResolveCommentRequest, CommentsResponse };
