// ============================================
// src/components/Notifications/NotificationBell.tsx
// ============================================
// Enhanced NotificationBell: Dropdown with list, auto-mark-as-read, loading/error states.
// Uses Tailwind for styling, Headless UI for accessible menu, date-fns for timestamps.
// Integrates useNotifications hook for data/mutations.

import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types';

interface NotificationBellProps {
  userId: string;
}

export const NotificationBell = ({ userId }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead, isMarking } = useNotifications(userId);

  // Handle notification click (mark as read, navigate if link)
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      window.open(notification.link, '_blank');
    }
    setIsOpen(false); // Close dropdown
  };

  if (isLoading) {
    return (
      <div className="relative">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" aria-label="Loading notifications" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <button
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={() => window.location.reload()} // Simple retry
          aria-label="Retry loading notifications"
        >
          🔔
        </button>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          !
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
          <span className="sr-only">Notifications</span>
          <span aria-label={`Notifications: ${unreadCount} unread`}>🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Menu.Button>

        <Transition
          show={isOpen}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            static
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          >
            <div className="px-4 py-3 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    await markAllAsRead();
                    setIsOpen(false);
                  }}
                  disabled={isMarking}
                  className="text-xs text-blue-600 hover:text-blue-500 disabled:opacity-50 mt-1"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="py-1">
              {notifications.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">No notifications yet.</p>
              ) : (
                notifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 text-sm ${
                          active ? 'bg-gray-100' : ''
                        } ${!notification.read ? 'bg-blue-50 border-r-4 border-blue-500' : ''}`}
                        disabled={isMarking}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span
                              className={`inline-flex h-8 w-8 rounded-full ${
                                notification.type === 'system'
                                  ? 'bg-gray-500'
                                  : notification.type === 'transaction'
                                  ? 'bg-green-500'
                                  : notification.type === 'service_request'
                                  ? 'bg-blue-500'
                                  : notification.type === 'review'
                                  ? 'bg-yellow-500'
                                  : 'bg-purple-500'
                              } text-white flex items-center justify-center text-xs font-medium`}
                            >
                              {notification.type.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-500'}`}>
                              {notification.title || 'Notification'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0 ml-2">
                              <span className="text-xs text-blue-500">New</span>
                            </div>
                          )}
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                ))
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};