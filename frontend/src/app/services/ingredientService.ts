import type { Ingredient } from '../models';

// Mock data for development
const mockIngredients: Ingredient[] = [
  {
    id: 1,
    name: "Seoul Milk 500ml",
    category: "Dairy",
    expiry: "Apr 25, 2025",
    daysLeft: 3,
    status: "expiring",
    image: "🥛",
    checked: false,
  },
  {
    id: 2,
    name: "Eggs (6)",
    category: "Dairy",
    expiry: "Apr 26, 2025",
    daysLeft: 4,
    status: "fresh",
    image: "🥚",
    checked: true,
  },
  {
    id: 3,
    name: "Spinach",
    category: "Vegetable",
    expiry: "Apr 28, 2025",
    daysLeft: 6,
    status: "fresh",
    image: "🥬",
    checked: true,
  },
  {
    id: 4,
    name: "Tomatoes",
    category: "Vegetable",
    expiry: "Apr 30, 2025",
    daysLeft: 8,
    status: "fresh",
    image: "🍅",
    checked: false,
  },
  {
    id: 5,
    name: "Chicken Breast",
    category: "Meat",
    expiry: "Apr 27, 2025",
    daysLeft: 5,
    status: "fresh",
    image: "🍗",
    checked: false,
  },
];

export const ingredientService = {
  // Get all ingredients
  getAll: async (): Promise<Ingredient[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockIngredients]), 300);
    });
  },

  // Get ingredient by ID
  getById: async (id: number): Promise<Ingredient | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ingredient = mockIngredients.find((item) => item.id === id);
        resolve(ingredient);
      }, 300);
    });
  },

  // Add new ingredient
  add: async (ingredient: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newIngredient = {
          ...ingredient,
          id: Math.max(...mockIngredients.map(i => i.id)) + 1,
        };
        mockIngredients.push(newIngredient);
        resolve(newIngredient);
      }, 300);
    });
  },

  // Update ingredient
  update: async (id: number, updates: Partial<Ingredient>): Promise<Ingredient | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockIngredients.findIndex((item) => item.id === id);
        if (index !== -1) {
          mockIngredients[index] = { ...mockIngredients[index], ...updates };
          resolve(mockIngredients[index]);
        } else {
          resolve(undefined);
        }
      }, 300);
    });
  },

  // Delete ingredient
  delete: async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockIngredients.findIndex((item) => item.id === id);
        if (index !== -1) {
          mockIngredients.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  },

  // Get expiring soon ingredients
  getExpiringSoon: async (days: number = 7): Promise<Ingredient[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const expiring = mockIngredients.filter((item) => item.daysLeft <= days);
        resolve(expiring);
      }, 300);
    });
  },

  // Toggle ingredient checked status
  toggleChecked: async (id: number): Promise<Ingredient | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockIngredients.findIndex((item) => item.id === id);
        if (index !== -1) {
          mockIngredients[index].checked = !mockIngredients[index].checked;
          resolve(mockIngredients[index]);
        } else {
          resolve(undefined);
        }
      }, 300);
    });
  },
};
