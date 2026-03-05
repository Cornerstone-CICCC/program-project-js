// src/app/models/share.ts
import type { Ingredient } from "./ingredient";

export type PickupType = "door_pickup" | "public_meetup";
export type SharedPostStatus = "available" | "reserved" | "done" | "cancelled";

export interface SharedPost {
  id: string;

  ingredientId: string;
  userId: string;

  pickupType: PickupType;
  photoUrl?: string | null;
  status: SharedPostStatus;

  createdAt: string;

  // optional expanded fields (if backend joins them)
  ingredient?: Ingredient;
  // If your backend returns user info, uncomment and add type:
  // user?: { id: string; name: string };
}

/** Create a shared post (client -> server) */
export interface CreateSharedPostInput {
  ingredientId: string;
  pickupType: PickupType;

  // optional
  photoUrl?: string | null;
}

/** Update shared post (client -> server) */
export interface UpdateSharedPostInput {
  pickupType?: PickupType;
  photoUrl?: string | null;
  status?: SharedPostStatus;
}