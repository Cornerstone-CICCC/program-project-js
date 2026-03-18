//src/app/services/notificationService.ts
import type { Notification } from "../models";

type NotificationApiItem = {
  _id?: string;
  id?: string | number;
  type?: "expiry" | "share" | "chat" | "system";
  title?: string;
  message?: string;
  description?: string;
  time?: string;
  read?: boolean;
  unread?: boolean;
  is_read?: boolean;
  icon?: "calendar" | "chat" | "share";
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
  if (!dateString) return "Just now";

  const now = new Date().getTime();
  const created = new Date(dateString).getTime();
  const diffMinutes = Math.floor((now - created) / (1000 * 60));

  if (Number.isNaN(created)) return dateString;
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(dateString).toLocaleDateString();
}

function inferType(message: string): Notification["type"] {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("expire") ||
    normalized.includes("expiration") ||
    normalized.includes("expired")
  ) {
    return "expiry";
  }

  if (normalized.includes("share") || normalized.includes("shared")) {
    return "share";
  }

  if (normalized.includes("message") || normalized.includes("chat")) {
    return "chat";
  }

  return "system";
}

function getDefaultTitle(type: Notification["type"]) {
  if (type === "expiry") return "Expiry Alert";
  if (type === "share") return "Item Shared";
  if (type === "chat") return "New Message";
  return "Notification";
}

function getIcon(type: Notification["type"]): Notification["icon"] {
  if (type === "expiry") return "calendar";
  if (type === "chat") return "chat";
  return "share";
}

function mapApiNotification(item: NotificationApiItem): Notification {
  const message = item.message || item.description || "";
  const type = item.type || inferType(message);

  const read =
    typeof item.read === "boolean"
      ? item.read
      : typeof item.unread === "boolean"
        ? !item.unread
        : Boolean(item.is_read);

  const rawTime = item.time || item.createdAt || item.created_at;

  return {
    id: String(item._id || item.id || ""),
    type,
    title: item.title || getDefaultTitle(type),
    message,
    time:
      rawTime && typeof rawTime === "string" && rawTime.includes(":")
        ? rawTime
        : formatRelativeTime(rawTime),
    read,
    icon: item.icon || getIcon(type),
  };
}

function isNotificationApiItem(data: unknown): data is NotificationApiItem {
  return !!data && typeof data === "object";
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<NotificationApiItem[] | ApiErrorResponse>(
      response,
    );

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to load notifications"));
    }

    return Array.isArray(data) ? data.map(mapApiNotification) : [];
  },

  async getUnreadCount(): Promise<number> {
    const notifications = await this.getAll();
    return notifications.filter((item) => !item.read).length;
  },

  async markAsRead(id: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${id}/read`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      },
    );

    const data = await parseJson<NotificationApiItem | ApiErrorResponse>(
      response,
    );

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to mark notification as read"));
    }
  },

  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<{ success?: boolean } | ApiErrorResponse>(
      response,
    );

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to mark all notifications as read"));
    }
  },

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<{ success?: boolean } | ApiErrorResponse>(
      response,
    );

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to delete notification"));
    }

    return true;
  },

  async getById(id: string): Promise<Notification | undefined> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<NotificationApiItem | ApiErrorResponse>(
      response,
    );

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to load notification"));
    }

    return isNotificationApiItem(data) ? mapApiNotification(data) : undefined;
  },
};