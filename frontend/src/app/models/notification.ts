export interface Notification {
  id: number;
  type: 'expiry' | 'share' | 'chat' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
}
