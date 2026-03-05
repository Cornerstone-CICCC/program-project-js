// 📁 /src/app/models/chat.ts
import type { UUID, User } from "./user";

export type Message = {
  id: UUID;
  senderId: UUID;
  sharedPostId: UUID;
  content: string;
  createdAt: string;

  // Optional expanded
  sender?: Pick<User, "id" | "name">;
};

export type SendMessageInput = {
  sharedPostId: UUID;
  content: string;
};