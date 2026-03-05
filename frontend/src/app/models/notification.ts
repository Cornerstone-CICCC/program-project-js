// 📁 /src/app/models/notification.ts
import type { UUID } from "./user";
import type { Ingredient } from "./ingredient";

export type Notification = {
  id: UUID;
  userId: UUID;
  ingredientId: UUID;
  message: string;
  isRead: boolean;
  createdAt: string;

  // Optional expanded
  ingredient?: Pick<Ingredient, "id" | "name" | "expirationDate">;
};

export type UpdateNotificationInput = {
  isRead: boolean;
};