import type { ChatRoom, ChatMessage } from '../models';

// Mock chat rooms
const mockChatRooms: ChatRoom[] = [
  {
    id: 1,
    userName: "Minho",
    userAvatar: "👨",
    lastMessage: "Sure! I'll be home after 5 PM",
    time: "10:30 AM",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    userName: "Sora",
    userAvatar: "👩",
    lastMessage: "The bread is ready for pickup",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    userName: "Jiwon",
    userAvatar: "👩‍🦰",
    lastMessage: "Thanks for the vegetables!",
    time: "2 days ago",
    unread: 1,
    online: true,
  },
];

// Mock messages for each chat room
const mockMessages: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      text: "Hi! Are the apples still available?",
      sender: "user",
      timestamp: "10:20 AM",
    },
    {
      id: 2,
      text: "Yes! They are. When can you pick them up?",
      sender: "other",
      timestamp: "10:25 AM",
    },
    {
      id: 3,
      text: "Can I come by this evening?",
      sender: "user",
      timestamp: "10:28 AM",
    },
    {
      id: 4,
      text: "Sure! I'll be home after 5 PM",
      sender: "other",
      timestamp: "10:30 AM",
    },
  ],
  2: [],
  3: [],
};

export const chatService = {
  // Get all chat rooms
  getAllRooms: async (): Promise<ChatRoom[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockChatRooms]), 300);
    });
  },

  // Get messages for a chat room
  getMessages: async (roomId: number): Promise<ChatMessage[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = mockMessages[roomId] || [];
        resolve([...messages]);
      }, 300);
    });
  },

  // Send a message
  sendMessage: async (roomId: number, text: string): Promise<ChatMessage> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage: ChatMessage = {
          id: Date.now(),
          text,
          sender: "user",
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        };
        
        if (!mockMessages[roomId]) {
          mockMessages[roomId] = [];
        }
        mockMessages[roomId].push(newMessage);
        
        // Update last message in room
        const roomIndex = mockChatRooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) {
          mockChatRooms[roomIndex].lastMessage = text;
          mockChatRooms[roomIndex].time = 'Just now';
        }
        
        resolve(newMessage);
      }, 300);
    });
  },

  // Mark room as read
  markAsRead: async (roomId: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const roomIndex = mockChatRooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) {
          mockChatRooms[roomIndex].unread = 0;
        }
        resolve();
      }, 100);
    });
  },
};
