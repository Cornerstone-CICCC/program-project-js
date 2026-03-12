import type { Notification } from '../models';

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'expiry',
    title: 'Expiring Soon',
    message: 'Seoul Milk expires in 3 days',
    time: '2 hours ago',
    read: false,
    icon: '🥛',
  },
  {
    id: 2,
    type: 'share',
    title: 'New Item Shared',
    message: 'Minho shared Fresh Apples nearby',
    time: '5 hours ago',
    read: false,
    icon: '🍎',
  },
  {
    id: 3,
    type: 'chat',
    title: 'New Message',
    message: 'Sora: The bread is ready for pickup',
    time: 'Yesterday',
    read: true,
    icon: '💬',
  },
  {
    id: 4,
    type: 'system',
    title: 'Recipe Match',
    message: 'We found 5 recipes you can make with your ingredients',
    time: '2 days ago',
    read: true,
    icon: '👨‍🍳',
  },
];

export const notificationService = {
  // Get all notifications
  getAll: async (): Promise<Notification[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockNotifications]), 300);
    });
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const count = mockNotifications.filter(n => !n.read).length;
        resolve(count);
      }, 300);
    });
  },

  // Mark as read
  markAsRead: async (id: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notification = mockNotifications.find(n => n.id === id);
        if (notification) {
          notification.read = true;
        }
        resolve();
      }, 300);
    });
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockNotifications.forEach(n => n.read = true);
        resolve();
      }, 300);
    });
  },

  // Delete notification
  delete: async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockNotifications.findIndex(n => n.id === id);
        if (index !== -1) {
          mockNotifications.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  },
};
