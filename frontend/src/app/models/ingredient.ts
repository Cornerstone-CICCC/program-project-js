// 📁 /src/app/models/ingredient.ts
import type { UUID } from "./user";

export type Ingredient = {
  id: UUID;
  userId: UUID;
  name: string;
  price: number;
  storeName: string;
  expirationDate: string; // YYYY-MM-DD or ISO string
  isShared: boolean;
  createdAt: string; // ISO string
};

// Form inputs
export type CreateIngredientInput = {
  name: string;
  price: number;
  storeName: string;
  expirationDate: string; // YYYY-MM-DD
  // Optional if you add it to ERD later:
  // category?: "fridge" | "freezer" | "pantry";
};

export type UpdateIngredientInput = Partial<CreateIngredientInput> & {
  isShared?: boolean;
};

// Useful derived UI states
export type IngredientExpiryStatus = "ok" | "expiring" | "expired";