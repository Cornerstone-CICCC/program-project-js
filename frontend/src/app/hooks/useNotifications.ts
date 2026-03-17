import { useCallback, useEffect, useState } from "react";
import type { Notification } from "../models/notification";

type NotificationApiItem = {
  id?: string | number;
  _id?: string;
  type?: "expiry" | "share" | "chat" | "system";
  title?: string;
  description?: string;
  message?: string;
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

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "Just now";

  const now = new Date().getTime();
  const created = new Date(dateString).getTime();
  const diffMinutes = Math.floor((now - created) / (1000 * 60));

  if (Number.isNaN(created)) return "Just now";
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

function iconFromType(type: Notification["type"]): Notification["icon"] {
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
    id: String(item.id || item._id || ""),
    type,
    title:
      item.title ||
      (type === "expiry"
        ? "Expiry Alert"
        : type === "share"
          ? "Item Shared"
          : type === "chat"
            ? "New Message"
            : "Notification"),
    message,
    time: rawTime && rawTime.includes(":") ? rawTime : formatRelativeTime(rawTime),
    read,
    icon: item.icon || iconFromType(type),
  };
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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = (await res.json().catch(() => null)) as
        | NotificationApiItem[]
        | ApiErrorResponse
        | null;

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to fetch notifications"));
      }

      const mapped = Array.isArray(data) ? data.map(mapApiNotification) : [];
      setNotifications(mapped);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { notifications, loading, error, refresh };
}