// 📁 /src/app/services/chatService.ts
import type { Message, SendMessageInput } from "../models/chat";
import { apiFetch } from "./_http";

export const chatService = {
  listMessages(sharedPostId: string, token: string) {
    return apiFetch<Message[]>(`/api/shared-posts/${sharedPostId}/messages`, { method: "GET", token });
  },
  sendMessage(input: SendMessageInput, token: string) {
    return apiFetch<Message>(`/api/shared-posts/${input.sharedPostId}/messages`, {
      method: "POST",
      body: { content: input.content },
      token,
    });
  },
};