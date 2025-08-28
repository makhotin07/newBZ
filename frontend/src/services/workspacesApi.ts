import api from './api';

export interface WorkspaceMember {
  id: string;
  user: string;
  user_id: number;
  user_email: string;
  user_name: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string;
}

export interface WorkspaceSettings {
  allow_member_invites: boolean;
  allow_public_pages: boolean;
  default_page_permissions: 'private' | 'workspace' | 'public';
  enable_comments: boolean;
  enable_page_history: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  owner: string;
  owner_id: number;
  is_personal: boolean;
  members_count: number;
  member_role?: 'owner' | 'admin' | 'editor' | 'viewer';
  settings?: WorkspaceSettings;
  members?: WorkspaceMember[];
  created_at: string;
  updated_at: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspace: string;
  workspace_name: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  invited_by: string;
  invited_by_name: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  created_at: string;
  expires_at: string;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface InviteUserData {
  email: string;
  role: 'viewer' | 'editor' | 'admin';
}

class WorkspacesApi {
  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await api.get('/workspaces/');
    return response.data.results || response.data;
  }

  async getWorkspace(id: string): Promise<Workspace> {
    const response = await api.get(`/workspaces/${id}/`);
    return response.data;
  }

  async createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
    const response = await api.post('/workspaces/', data);
    return response.data;
  }

  async updateWorkspace(id: string, data: UpdateWorkspaceData): Promise<Workspace> {
    const response = await api.patch(`/workspaces/${id}/`, data);
    return response.data;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await api.delete(`/workspaces/${id}/`);
  }

  async leaveWorkspace(id: string): Promise<void> {
    await api.post(`/workspaces/${id}/leave/`);
  }

  // Members
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const response = await api.get(`/workspaces/${workspaceId}/members/`);
    return response.data;
  }

  async inviteUser(workspaceId: string, data: InviteUserData): Promise<WorkspaceInvitation> {
    const response = await api.post(`/workspaces/${workspaceId}/invite/`, data);
    return response.data;
  }

  async updateMemberRole(workspaceId: string, memberId: string, role: string): Promise<WorkspaceMember> {
    const response = await api.patch(`/workspaces/${workspaceId}/members/${memberId}/`, { role });
    return response.data;
  }

  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/members/${memberId}/`);
  }

  // Invitations
  async acceptInvitation(token: string): Promise<void> {
    await api.post(`/workspaces/invitations/${token}/accept/`);
  }

  async declineInvitation(token: string): Promise<void> {
    await api.post(`/workspaces/invitations/${token}/decline/`);
  }

  async getPendingInvitations(): Promise<WorkspaceInvitation[]> {
    const response = await api.get('/workspaces/invitations/pending/');
    return response.data;
  }

  // Settings
  async getWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings> {
    const response = await api.get(`/workspaces/${workspaceId}/settings/`);
    return response.data;
  }

  async updateWorkspaceSettings(workspaceId: string, settings: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    const response = await api.patch(`/workspaces/${workspaceId}/settings/`, settings);
    return response.data;
  }

  // Search users for invitations
  async searchUsers(query: string): Promise<Array<{id: number; email: string; name: string; avatar?: string}>> {
    const response = await api.get('/auth/users/', { params: { search: query } });
    return response.data.results || response.data;
  }

  // Analytics overview
  async getAnalyticsOverview(params?: { workspaces?: string[]; from?: string; to?: string }): Promise<any> {
    const response = await api.get('/workspaces/analytics/overview/', {
      params: {
        ...(params?.from ? { from: params.from } : {}),
        ...(params?.to ? { to: params.to } : {}),
        ...(params?.workspaces ? { 'workspaces[]': params.workspaces } : {}),
      }
    });
    return response.data;
  }
}

export const workspacesApi = new WorkspacesApi();
