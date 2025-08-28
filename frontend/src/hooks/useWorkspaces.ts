import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi, Workspace, WorkspaceMember, CreateWorkspaceData, UpdateWorkspaceData, InviteUserData } from '../services/workspacesApi';
import toast from 'react-hot-toast';

// Query Keys
export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (filters: string) => [...workspaceKeys.lists(), { filters }] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
  members: (id: string) => [...workspaceKeys.detail(id), 'members'] as const,
  settings: (id: string) => [...workspaceKeys.detail(id), 'settings'] as const,
  invitations: () => [...workspaceKeys.all, 'invitations'] as const,
};

// Workspaces Hooks
export const useWorkspaces = () => {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: () => workspacesApi.getWorkspaces(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWorkspace = (id: string) => {
  return useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => workspacesApi.getWorkspace(id),
    enabled: !!id,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceData) => workspacesApi.createWorkspace(data),
    onSuccess: (newWorkspace) => {
      // Invalidate workspaces list
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      
      // Set the new workspace in cache
      queryClient.setQueryData(workspaceKeys.detail(newWorkspace.id), newWorkspace);
      
      toast.success('Workspace created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create workspace');
    },
  });
};

export const useUpdateWorkspace = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkspaceData) => workspacesApi.updateWorkspace(id, data),
    onSuccess: (updatedWorkspace) => {
      // Update the workspace in cache
      queryClient.setQueryData(workspaceKeys.detail(id), updatedWorkspace);
      
      // Invalidate list to update everywhere
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      
      toast.success('Workspace updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update workspace');
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspacesApi.deleteWorkspace(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(deletedId) });
      
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      
      toast.success('Workspace deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete workspace');
    },
  });
};

export const useLeaveWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspacesApi.leaveWorkspace(id),
    onSuccess: (_, workspaceId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      
      toast.success('Left workspace successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to leave workspace');
    },
  });
};

// Members Hooks
export const useWorkspaceMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId),
    queryFn: () => workspacesApi.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useInviteUser = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteUserData) => workspacesApi.inviteUser(workspaceId, data),
    onSuccess: () => {
      // Invalidate members list
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
      
      // Invalidate workspace to update member count
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      
      toast.success('Invitation sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send invitation');
    },
  });
};

export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      workspacesApi.updateMemberRole(workspaceId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
      toast.success('Member role updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update member role');
    },
  });
};

export const useRemoveMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => workspacesApi.removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      toast.success('Member removed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to remove member');
    },
  });
};

// Invitations Hooks
export const usePendingInvitations = () => {
  return useQuery({
    queryKey: workspaceKeys.invitations(),
    queryFn: () => workspacesApi.getPendingInvitations(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => workspacesApi.acceptInvitation(token),
    onSuccess: () => {
      // Invalidate workspaces and invitations
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.invitations() });
      
      toast.success('Invitation accepted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to accept invitation');
    },
  });
};

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => workspacesApi.declineInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.invitations() });
      toast.success('Invitation declined');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to decline invitation');
    },
  });
};

// Settings Hooks
export const useWorkspaceSettings = (workspaceId: string) => {
  return useQuery({
    queryKey: workspaceKeys.settings(workspaceId),
    queryFn: () => workspacesApi.getWorkspaceSettings(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useAnalyticsOverview = (params?: { workspaces?: string[]; from?: string; to?: string }) => {
  return useQuery({
    queryKey: ['analytics', 'overview', params],
    queryFn: () => workspacesApi.getAnalyticsOverview(params),
    staleTime: 60 * 1000,
  });
};

export const useUpdateWorkspaceSettings = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: any) => workspacesApi.updateWorkspaceSettings(workspaceId, settings),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(workspaceKeys.settings(workspaceId), updatedSettings);
      toast.success('Settings updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    },
  });
};

// Search Users Hook
export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => workspacesApi.searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
};
