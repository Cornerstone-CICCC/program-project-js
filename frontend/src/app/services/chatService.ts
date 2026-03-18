//src/app/services/chatService.ts
import type { ChatRoom, ChatMessage } from "../models";

type ChatRoomApiItem = {
  _id?: string;
  id?: string | number;
  user_name?: string;
  userName?: string;
  user_avatar?: string;
  userAvatar?: string;
  last_message?: string;
  lastMessage?: string;
  time?: string;
  unread?: number;
  online?: boolean;
};

type ChatMessageApiItem = {
  _id?: string;
  id?: string | number;
  text?: string;
  message?: string;
  sender?: "user" | "other";
  timestamp?: string;
  created_at?: string;
  createdAt?: string;
};

type ApiErrorResponse = {
  message?: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

function getErrorMessage(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  return fallback;
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "";

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }

  const now = new Date();
  const diffMinutes = Math.floor(
    (now.getTime() - parsed.getTime()) / (1000 * 60),
  );

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return parsed.toLocaleDateString();
}

function formatMessageTime(dateString?: string) {
  if (!dateString) return "";

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }

  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapChatRoom(item: ChatRoomApiItem): ChatRoom {
  const rawTime = item.time;

  return {
    id: String(item._id || item.id || ""),
    userName: item.userName || item.user_name || "Unknown",
    userAvatar: item.userAvatar || item.user_avatar || "👤",
    lastMessage: item.lastMessage || item.last_message || "",
    time: rawTime ? formatRelativeTime(rawTime) : "",
    unread: item.unread ?? 0,
    online: Boolean(item.online),
  };
}

function mapChatMessage(item: ChatMessageApiItem): ChatMessage {
  const rawTimestamp = item.timestamp || item.createdAt || item.created_at;

  return {
    id: String(item._id || item.id || ""),
    text: item.text || item.message || "",
    sender: item.sender === "other" ? "other" : "user",
    timestamp: formatMessageTime(rawTimestamp),
  };
}

function isChatRoomApiItem(data: unknown): data is ChatRoomApiItem {
  return !!data && typeof data === "object";
}

function isChatMessageApiItem(data: unknown): data is ChatMessageApiItem {
  return !!data && typeof data === "object";
}

export const chatService = {
  async getAllRooms(): Promise<ChatRoom[]> {
    const response = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<ChatRoomApiItem[] | ApiErrorResponse>(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to load chat rooms"));
    }

    return Array.isArray(data) ? data.map(mapChatRoom) : [];
  },

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/messages`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    const data = await parseJson<ChatMessageApiItem[] | ApiErrorResponse>(
      response,
    );

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to load messages"));
    }

    return Array.isArray(data) ? data.map(mapChatMessage) : [];
  },

  async sendMessage(roomId: string, text: string): Promise<ChatMessage> {
    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text }),
      },
    );

    const data = await parseJson<ChatMessageApiItem | ApiErrorResponse>(
      response,
    );

    if (!response.ok || !isChatMessageApiItem(data)) {
      throw new Error(getErrorMessage(data, "Failed to send message"));
    }

    return mapChatMessage(data);
  },

  async markAsRead(roomId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/chat/rooms/${roomId}/read`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      },
    );

    const data = await parseJson<{ success?: boolean } | ApiErrorResponse>(
      response,
    );

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to mark chat as read"));
    }
  },

  async getRoomById(roomId: string): Promise<ChatRoom | undefined> {
    const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<ChatRoomApiItem | ApiErrorResponse>(response);

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok || !isChatRoomApiItem(data)) {
      throw new Error(getErrorMessage(data, "Failed to load chat room"));
    }

    return mapChatRoom(data);
  },
};