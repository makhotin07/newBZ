import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  Cog6ToothIcon,
  InboxIcon
} from '@heroicons/react/24/outline';
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkAsRead, 
  useMarkAllAsRead, 
  useDeleteNotification,
  useRealtimeNotifications 
} from '../../../../shared/hooks/useNotifications';
import { Notification } from '../../api';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';

const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: unreadCountData } = useUnreadCount();
  const { 
    data: notificationsData, 
    fetchNextPage, 
    hasNextPage, 
    isLoading,
    isFetchingNextPage 
  } = useNotifications({ unread_only: false });
  
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  
  const { newNotifications, clearNewNotifications } = useRealtimeNotifications();

  const unreadCount = unreadCountData?.count || 0;
  const notifications = notificationsData?.pages?.flatMap(page => page.results) || [];

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Не удалось отметить уведомление как прочитанное:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Не удалось отметить все уведомления как прочитанные:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Не удалось удалить уведомление:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'mention':
        return '👤';

      case 'task':
        return '📋';
      case 'workspace':
        return '👥';
      default:
        return 'ℹ️';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString();
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    // Дополнительная проверка на случай, если notification undefined
    if (!notification || !notification.id) {
      return null;
    }
    
    const isUnread = !notification.is_read;

    return (
      <div
        className={`relative flex items-start space-x-3 p-3 hover:bg-gray-50 ${
          isUnread ? 'bg-blue-50 border-l-2 border-blue-500' : ''
        }`}
      >
        <div className="flex-shrink-0">
          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium text-gray-900 ${isUnread ? 'font-semibold' : ''}`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
              
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{formatDate(notification.created_at)}</span>
                {notification.sender && (
                  <span>by {notification.sender.name}</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 ml-2">
              {isUnread && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleMarkAsRead(notification.id);
                  }}
                  className="p-1 text-blue-600 hover:text-blue-800 rounded"
                  title="Mark as read"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteNotification(notification.id);
                }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Удалить"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {notification.action_url && notification.action_text && (
            <Link
              to={notification.action_url}
              className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => setIsOpen(false)}
            >
              {notification.action_text} →
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md relative"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            clearNewNotifications();
          }
        }}
      >
        <BellIcon className="w-5 h-5" />
        {(unreadCount > 0 || (newNotifications.filter(notification => notification && notification.id).length > 0)) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {Math.min(unreadCount + newNotifications.filter(notification => notification && notification.id).length, 99)}
          </span>
        )}
      </Menu.Button>

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          static
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50 border border-gray-200 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
              <Link
                to="/settings?tab=notifications"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Notification settings"
              >
                <Cog6ToothIcon className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <InboxIcon className="w-8 h-8 mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <>
                {/* New notifications (from real-time) */}
                {newNotifications.filter(notification => notification && notification.id).map(notification => (
                  <div key={`new-${notification.id}`} className="border-b border-yellow-200 bg-yellow-50">
                    <NotificationItem notification={notification} />
                  </div>
                ))}

                {/* Existing notifications */}
                {notifications.filter(notification => notification && notification.id).map(notification => (
                  <div key={notification.id} className="border-b border-gray-100">
                    <NotificationItem notification={notification} />
                  </div>
                ))}

                {/* Загрузить ещё */}
                {hasNextPage && (
                  <div className="p-3 text-center border-t border-gray-200">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                    >
                      {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationPanel;
