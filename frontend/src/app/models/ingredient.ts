export interface Ingredient {
  id: string;
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
  isShared?: boolean;
}