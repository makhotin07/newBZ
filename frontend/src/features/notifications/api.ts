import api from '../../shared/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'task' | 'workspace';
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

  email_on_mention: boolean;
  email_on_page_share: boolean;
  email_on_task_assigned: boolean;
  email_on_task_due: boolean;
  email_on_workspace_invite: boolean;

  push_on_mention: boolean;
  push_on_page_share: boolean;
  push_on_task_assigned: boolean;
  push_on_task_due: boolean;
  push_on_workspace_invite: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  message?: string;
  remind_at: string;
  is_sent: boolean;
  related_object?: {
    type: string;
    id: string;
    title: string;
  };
  created_at: string;
  sent_at?: string;
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

  // Mark notification as read (PATCH to update)
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${notificationId}/`, {
      is_read: true,
      read_at: new Date().toISOString()
    });
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/mark_all_read/');
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
    const response = await api.post('/notifications/', data);
    return response.data;
  },

  // Notification settings
  getSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get('/notification-settings/');
    return response.data;
  },

  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const response = await api.patch('/notification-settings/', settings);
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
    const response = await api.get('/reminders/', { params });
    return response.data;
  },

  createReminder: async (data: CreateReminderRequest): Promise<Reminder> => {
    const response = await api.post('/reminders/', data);
    return response.data;
  },

  updateReminder: async (id: string, data: Partial<Reminder>): Promise<Reminder> => {
    const response = await api.patch(`/reminders/${id}/`, data);
    return response.data;
  },

  deleteReminder: async (id: string): Promise<void> => {
    await api.delete(`/reminders/${id}/`);
  },

  completeReminder: async (id: string): Promise<Reminder> => {
    const response = await api.patch(`/reminders/${id}/`, {
      is_sent: true,
      sent_at: new Date().toISOString()
    });
    return response.data;
  },
};

export default notificationsApi;
