//useChat.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "../models/chat";
import { chatService } from "../services/chatService";

export function useChat(sharedPostId: string | null, token: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !sharedPostId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await chatService.getMessages(sharedPostId);

      setMessages(
        [...data].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [sharedPostId, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const send = useCallback(
    async (content: string) => {
      if (!token || !sharedPostId) {
        throw new Error("Not ready");
      }

      const msg = await chatService.sendMessage(sharedPostId, content);

      setMessages((prev) =>
        [...prev, msg].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      );

      return msg;
    },
    [sharedPostId, token],
  );

  const value = useMemo(
    () => ({
      messages,
      isLoading,
      error,
      refresh,
      send,
    }),
    [messages, isLoading, error, refresh, send],
  );

  return value;
}