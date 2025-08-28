import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'comment' | 'task' | 'workspace';
  is_read: boolean;
  created_at: string;
  read_at?: string;
  action_url?: string;
  action_text?: string;
  related_object?: {
    type: string;
    id: string;
    title: string;
  };
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NotificationSettings {
  id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  comment_notifications: boolean;
  mention_notifications: boolean;
  task_notifications: boolean;
  workspace_notifications: boolean;
  daily_digest: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily';
}

export interface Reminder {
  id: string;
  title: string;
  message?: string;
  remind_at: string;
  is_completed: boolean;
  related_object?: {
    type: string;
    id: string;
    title: string;
  };
  created_at: string;
  completed_at?: string;
}

export interface CreateNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type?: string;
  action_url?: string;
  action_text?: string;
  related_object_type?: string;
  related_object_id?: string;
}

export interface CreateReminderRequest {
  title: string;
  message?: string;
  remind_at: string;
  related_object_type?: string;
  related_object_id?: string;
}

// Notifications API functions
export const notificationsApi = {
  // Get user notifications
  getNotifications: async (params?: {
    unread_only?: boolean;
    type?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    results: Notification[];
    count: number;
    next: string | null;
    previous: string | null;
  }> => {
    const response = await api.get('/notifications/', { params });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read/`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/mark-all-read/');
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}/`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/notifications/', {
      params: { unread_only: true, page_size: 1 }
    });
    return { count: response.data.count };
  },

  // Create notification (admin only)
  createNotification: async (data: CreateNotificationRequest): Promise<Notification> => {
    const response = await api.post('/notifications/create/', data);
    return response.data;
  },

  // Notification settings
  getSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get('/notifications/settings/');
    return response.data;
  },

  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const response = await api.patch('/notifications/settings/', settings);
    return response.data;
  },

  // Reminders
  getReminders: async (params?: {
    completed?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{
    results: Reminder[];
    count: number;
    next: string | null;
    previous: string | null;
  }> => {
    const response = await api.get('/notifications/reminders/', { params });
    return response.data;
  },

  createReminder: async (data: CreateReminderRequest): Promise<Reminder> => {
    const response = await api.post('/notifications/reminders/', data);
    return response.data;
  },

  updateReminder: async (id: string, data: Partial<Reminder>): Promise<Reminder> => {
    const response = await api.patch(`/notifications/reminders/${id}/`, data);
    return response.data;
  },

  deleteReminder: async (id: string): Promise<void> => {
    await api.delete(`/notifications/reminders/${id}/`);
  },

  completeReminder: async (id: string): Promise<Reminder> => {
    const response = await api.patch(`/notifications/reminders/${id}/`, {
      is_completed: true,
      completed_at: new Date().toISOString()
    });
    return response.data;
  },
};

export default notificationsApi;
