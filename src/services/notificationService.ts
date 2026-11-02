export type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
  read: boolean;
};

let notifications: AppNotification[] = [
  {
    id: '1',
    title: 'Welcome to Sora',
    message: 'Your personal expense tracker is ready to use.',
    time: 'Just now',
    icon: 'notifications-outline',
    read: false,
  },
  {
    id: '2',
    title: 'Keep your records updated',
    message: 'Remember to record your expenses to keep track of your spending.',
    time: 'Today',
    icon: 'receipt-outline',
    read: false,
  },
  {
    id: '3',
    title: 'Review your spending',
    message: 'Take a moment to review your recent transactions.',
    time: 'Yesterday',
    icon: 'wallet-outline',
    read: true,
  },
];

type NotificationListener = () => void;

const listeners: NotificationListener[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const getNotifications = (): AppNotification[] => {
  return [...notifications];
};

export const getUnreadCount = (): number => {
  return notifications.filter(notification => !notification.read).length;
};

export const subscribeToNotifications = (
  listener: NotificationListener,
): (() => void) => {
  listeners.push(listener);

  return () => {
    const index = listeners.indexOf(listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

export const markNotificationAsRead = (id: string): void => {
  notifications = notifications.map(notification =>
    notification.id === id
      ? { ...notification, read: true }
      : notification,
  );

  notifyListeners();
};

export const markAllNotificationsAsRead = (): void => {
  notifications = notifications.map(notification => ({
    ...notification,
    read: true,
  }));

  notifyListeners();
};