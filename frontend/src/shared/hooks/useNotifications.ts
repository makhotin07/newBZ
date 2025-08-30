import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import notificationsApi, { Reminder } from '../../features/notifications/api';
import { notificationService } from '../../features/collaboration/api';


// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
  reminders: () => [...notificationKeys.all, 'reminders'] as const,
};

// Notifications hooks
export const useNotifications = (params?: {
  unread_only?: boolean;
  type?: string;
}) => {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(params || {}),
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.getNotifications({
        ...params,
        page: pageParam,
        page_size: 20,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.next ? pages.length + 1 : undefined;
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationsApi.getUnreadCount,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

// Settings hooks
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: notificationsApi.getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.settings() });
    },
  });
};

// Reminders hooks
export const useReminders = (params?: { completed?: boolean }) => {
  return useInfiniteQuery({
    queryKey: [...notificationKeys.reminders(), params || {}],
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.getReminders({
        ...params,
        page: pageParam as number,
        page_size: 20,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, pages) => {
      return lastPage.next ? pages.length + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.reminders() });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reminder> }) =>
      notificationsApi.updateReminder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.reminders() });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.reminders() });
    },
  });
};

export const useCompleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.completeReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.reminders() });
    },
  });
};

// Real-time notifications hook
export const useRealtimeNotifications = () => {
  const token = localStorage.getItem('access_token');
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [newNotifications, setNewNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const connect = async () => {
      try {
        await notificationService.connect(token);
        setIsConnected(true);

        notificationService.onNotification((notification: any) => {
          // Add to local state for immediate UI feedback
          setNewNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5

          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
          queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });

          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
            });
          }
        });
      } catch (error) {
        console.error('Failed to connect to notification service:', error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      notificationService.disconnect();
      setIsConnected(false);
    };
  }, [token, queryClient]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    isConnected,
    newNotifications,
    clearNewNotifications: () => setNewNotifications([]),
    requestNotificationPermission,
  };
};
