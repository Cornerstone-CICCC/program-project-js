export interface Notification {
  id: string;
  type: "expiry" | "share" | "chat" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: "calendar" | "chat" | "share";
}