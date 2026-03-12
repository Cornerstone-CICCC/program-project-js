//models/ingredient.ts
export interface Ingredient {
  id: number;
  name: string;
  category: string;
  expiry: string;
  daysLeft: number;
  status: "fresh" | "expiring" | "expired";
  image: string;
  checked: boolean;

  buyDate?: string;
  expirationDate?: string;
  storeName?: string;
}