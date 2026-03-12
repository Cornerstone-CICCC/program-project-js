export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

export interface ChatRoom {
  id: number;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}
