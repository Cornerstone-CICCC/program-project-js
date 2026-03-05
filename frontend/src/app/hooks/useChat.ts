// 📁 /src/app/hooks/useChat.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Message } from "../models/chat";
import { chatService } from "../services/chatService";

export function useChat(sharedPostId: string | null, token: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !sharedPostId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await chatService.listMessages(sharedPostId, token);
      // sort by createdAt ascending
      setMessages([...data].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [sharedPostId, token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const send = useCallback(
    async (content: string) => {
      if (!token || !sharedPostId) throw new Error("Not ready");
      const msg = await chatService.sendMessage({ sharedPostId, content }, token);
      setMessages((prev) => [...prev, msg].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      return msg;
    },
    [sharedPostId, token]
  );

  const value = useMemo(() => ({ messages, isLoading, error, refresh, send }), [messages, isLoading, error, refresh, send]);
  return value;
}