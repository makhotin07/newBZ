import api from './api';

export interface UserProfile {
  phone?: string;
  company?: string;
  job_title?: string;
  website?: string;
  notification_preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    task_reminders?: boolean;
    workspace_invites?: boolean;
    comment_mentions?: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  is_email_verified: boolean;
  profile?: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  profile?: Partial<UserProfile>;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
  confirm_password: string;
}

class UserApi {
  async getUserProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile/');
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(data: UpdateUserData): Promise<User> {
    try {
      const response = await api.patch('/auth/profile/', data);
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.post('/auth/change-password/', data);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/auth/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password/', data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password/', data);
    return response.data;
  }
}

export const userApi = new UserApi();
