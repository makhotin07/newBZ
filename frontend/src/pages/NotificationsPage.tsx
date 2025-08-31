import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  BellIcon, 
  ClockIcon,
  Cog6ToothIcon,
  TrashIcon,
  CheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { 
  useNotifications, 
  useReminders, 
  useNotificationSettings,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useCreateReminder,
  useCompleteReminder,
  useDeleteReminder,
  useUpdateNotificationSettings
} from '../shared/hooks/useNotifications';
import { Notification, Reminder, CreateReminderRequest } from '../features/notifications/api';
import LoadingSpinner from '../shared/ui/LoadingSpinner';
import EmptyState from '../shared/ui/EmptyState';

const NotificationsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showCreateReminder, setShowCreateReminder] = useState(false);

  const tabs = [
    { name: 'Notifications', icon: BellIcon },
    { name: 'Reminders', icon: ClockIcon },
    { name: 'Settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Manage your notifications, reminders, and preferences</p>
      </div>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                   ${selected
                     ? 'bg-white text-blue-700 shadow'
                     : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                   }`
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            );
          })}
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <NotificationsTab />
          </Tab.Panel>
          
          <Tab.Panel>
            <RemindersTab 
              showCreateForm={showCreateReminder} 
              onToggleCreateForm={() => setShowCreateReminder(!showCreateReminder)} 
            />
          </Tab.Panel>
          
          <Tab.Panel>
            <SettingsTab />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

const NotificationsTab: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const { 
    data: notificationsData, 
    fetchNextPage, 
    hasNextPage, 
    isLoading,
    isFetchingNextPage 
  } = useNotifications({ 
    unread_only: filter === 'unread' 
  });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsData?.pages?.flatMap((page: any) => page.results) || [];
  const totalCount = (notificationsData?.pages?.[0] as any)?.count || 0;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread
          </button>
        </div>

        {filter === 'unread' && notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={BellIcon}
          title="No notifications"
          description={
            filter === 'unread' 
              ? "You're all caught up! No unread notifications." 
              : "No notifications yet."
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow">
          {notifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isLast={index === notifications.length - 1}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
            />
          ))}

          {hasNextPage && (
            <div className="p-4 text-center border-t border-gray-200">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Загрузка...' : 'Загрузить ещё'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NotificationItem: React.FC<{
  notification: Notification;
  isLast: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ notification, isLast, onMarkAsRead, onDelete }) => {
  const isUnread = !notification.is_read;

  return (
    <div className={`p-6 ${!isLast ? 'border-b border-gray-200' : ''} ${isUnread ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium text-gray-900 ${isUnread ? 'font-semibold' : ''}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{new Date(notification.created_at).toLocaleString()}</span>
                  {notification.sender && (
                    <span>by {notification.sender.name}</span>
                  )}
                </div>
              </div>
            </div>

            {notification.action_url && notification.action_text && (
              <div className="mt-3">
                <a
                  href={notification.action_url}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {notification.action_text} →
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {isUnread && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
              title="Mark as read"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(notification.id)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
            title="Удалить"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const RemindersTab: React.FC<{
  showCreateForm: boolean;
  onToggleCreateForm: () => void;
}> = ({ showCreateForm, onToggleCreateForm }) => {
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  
  const { 
    data: remindersData, 
    fetchNextPage, 
    hasNextPage, 
    isLoading 
  } = useReminders({ 
    completed: filter === 'completed' 
  });

  const createReminderMutation = useCreateReminder();
  const completeReminderMutation = useCompleteReminder();
  const deleteReminderMutation = useDeleteReminder();

  const reminders = remindersData?.pages?.flatMap((page: any) => page.results) || [];

  const handleCreateReminder = async (data: CreateReminderRequest) => {
    try {
      await createReminderMutation.mutateAsync(data);
      onToggleCreateForm();
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      await completeReminderMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to complete reminder:', error);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminderMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'active'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'completed'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Завершенные
          </button>
        </div>

        <button
          onClick={onToggleCreateForm}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Reminder
        </button>
      </div>

      {/* Create reminder form */}
      {showCreateForm && (
        <CreateReminderForm
          onSubmit={handleCreateReminder}
          onCancel={onToggleCreateForm}
          isLoading={createReminderMutation.isPending}
        />
      )}

      {/* Reminders list */}
      {reminders.length === 0 ? (
        <EmptyState
          icon={ClockIcon}
          title="No reminders"
          description={
            filter === 'active' 
              ? "No active reminders. Create one to get started!" 
              : "No completed reminders."
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow">
          {reminders.map((reminder, index) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              isLast={index === reminders.length - 1}
              onComplete={handleCompleteReminder}
              onDelete={handleDeleteReminder}
            />
          ))}

          {hasNextPage && (
            <div className="p-4 text-center border-t border-gray-200">
              <button
                onClick={() => fetchNextPage()}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Загрузить ещё
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CreateReminderForm: React.FC<{
  onSubmit: (data: CreateReminderRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<CreateReminderRequest>({
    title: '',
    message: '',
    remind_at: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.remind_at) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Create Reminder</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Reminder title"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Optional message"
          />
        </div>

        <div>
          <label htmlFor="remind_at" className="block text-sm font-medium text-gray-700 mb-1">
            Remind me at *
          </label>
          <input
            id="remind_at"
            type="datetime-local"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.remind_at}
            onChange={(e) => setFormData(prev => ({ ...prev, remind_at: e.target.value }))}
          />
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.title.trim() || !formData.remind_at}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            <span>Create Reminder</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const ReminderItem: React.FC<{
  reminder: Reminder;
  isLast: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ reminder, isLast, onComplete, onDelete }) => {
  const isCompleted = reminder.is_sent;
  const isPastDue = new Date(reminder.remind_at) < new Date() && !isCompleted;

  return (
    <div className={`p-6 ${!isLast ? 'border-b border-gray-200' : ''} ${isPastDue ? 'bg-red-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {isPastDue && (
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {reminder.title}
            </p>
            {reminder.message && (
              <p className={`text-sm text-gray-600 mt-1 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                {reminder.message}
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>
                {isCompleted ? 'Completed' : 'Remind'} at: {new Date(reminder.remind_at).toLocaleString()}
              </span>
              {isCompleted && reminder.sent_at && (
                <span>Completed: {new Date(reminder.sent_at).toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {!isCompleted && (
            <button
              onClick={() => onComplete(reminder.id)}
              className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100"
              title="Mark as completed"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
            title="Удалить"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsTab: React.FC = () => {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateSettingsMutation = useUpdateNotificationSettings();

  const handleSettingChange = async (key: string, value: any) => {
    if (!settings) return;
    
    try {
      await updateSettingsMutation.mutateAsync({
        [key]: value
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Настройки уведомлений</h3>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Способы доставки</h4>
            

          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Типы уведомлений</h4>
            
            <div className="space-y-4">


              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Упоминания</p>
                  <p className="text-sm text-gray-500">Когда кто-то упоминает вас</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_on_mention}
                  onChange={(e) => handleSettingChange('email_on_mention', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Поделились страницей</p>
                  <p className="text-sm text-gray-500">Когда кто-то делится страницей с вами</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_on_page_share}
                  onChange={(e) => handleSettingChange('email_on_page_share', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Назначение задач</p>
                  <p className="text-sm text-gray-500">Когда вам назначают задачи</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_on_task_assigned}
                  onChange={(e) => handleSettingChange('email_on_task_assigned', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Сроки задач</p>
                  <p className="text-sm text-gray-500">Напоминания о сроках задач</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_on_task_due}
                  onChange={(e) => handleSettingChange('email_on_task_due', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Приглашения в workspace</p>
                  <p className="text-sm text-gray-500">Приглашения присоединиться к workspace</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_on_workspace_invite}
                  onChange={(e) => handleSettingChange('email_on_workspace_invite', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Frequency</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Daily digest</p>
                <p className="text-sm text-gray-500">Receive a daily summary of activities</p>
              </div>
              <input
                type="checkbox"
                checked={settings.daily_digest}
                onChange={(e) => handleSettingChange('daily_digest', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
