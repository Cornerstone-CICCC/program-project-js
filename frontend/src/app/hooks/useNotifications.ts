// 📁 /src/app/hooks/useNotifications.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Notification } from "../models/notification";
import { notificationService } from "../services/notificationService";

export function useNotifications(token: string | null) {
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.list(token);
      // newest first
      setItems([...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = useCallback(
    async (id: string, isRead: boolean) => {
      if (!token) throw new Error("Not authenticated");
      const updated = await notificationService.update(id, { isRead }, token);
      setItems((prev) => prev.map((n) => (n.id === id ? updated : n)));
      return updated;
    },
    [token]
  );

  const value = useMemo(() => ({ items, isLoading, error, refresh, markRead }), [items, isLoading, error, refresh, markRead]);
  return value;
}