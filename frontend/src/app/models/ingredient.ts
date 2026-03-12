export interface Ingredient {
  id: number;
  name: string;
  category: string;
  expiry: string;
  daysLeft: number;
  status: 'fresh' | 'expiring' | 'expired';
  image: string;
  checked: boolean;
}

export type IngredientCategory = 'Dairy' | 'Vegetable' | 'Meat' | 'Fruit' | 'Grain' | 'Other';
