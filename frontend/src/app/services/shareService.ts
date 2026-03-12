import type { SharedItem } from '../models';

// Mock shared items data
const mockSharedItems: SharedItem[] = [
  {
    id: 1,
    name: "Fresh Apples",
    category: "Fruit",
    image: "🍎",
    type: "free",
    location: "Gangnam, Seoul",
    distance: "0.5km",
    user: {
      name: "Minho",
      avatar: "👨",
      rating: 4.8,
    },
    description: "5 fresh apples from my garden. Pick up today!",
    expiryDate: "Apr 24, 2025",
    createdAt: "2 hours ago",
  },
  {
    id: 2,
    name: "Homemade Bread",
    category: "Grain",
    image: "🥖",
    type: "pickup",
    location: "Hongdae, Seoul",
    distance: "1.2km",
    user: {
      name: "Sora",
      avatar: "👩",
      rating: 4.9,
    },
    description: "Freshly baked bread this morning. Available until 6 PM.",
    expiryDate: "Apr 23, 2025",
    createdAt: "5 hours ago",
  },
  {
    id: 3,
    name: "Organic Vegetables",
    category: "Vegetable",
    image: "🥕",
    type: "exchange",
    location: "Itaewon, Seoul",
    distance: "2.1km",
    user: {
      name: "Jiwon",
      avatar: "👩‍🦰",
      rating: 4.7,
    },
    description: "Looking to exchange for dairy products.",
    createdAt: "1 day ago",
  },
];

export const shareService = {
  // Get all shared items
  getAll: async (): Promise<SharedItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSharedItems]), 300);
    });
  },

  // Get shared item by ID
  getById: async (id: number): Promise<SharedItem | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockSharedItems.find((item) => item.id === id);
        resolve(item);
      }, 300);
    });
  },

  // Create new shared item
  create: async (item: Omit<SharedItem, 'id' | 'createdAt'>): Promise<SharedItem> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem: SharedItem = {
          ...item,
          id: Math.max(...mockSharedItems.map(i => i.id)) + 1,
          createdAt: 'Just now',
        };
        mockSharedItems.push(newItem);
        resolve(newItem);
      }, 300);
    });
  },

  // Filter by type
  filterByType: async (type: 'free' | 'pickup' | 'exchange'): Promise<SharedItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockSharedItems.filter((item) => item.type === type);
        resolve(filtered);
      }, 300);
    });
  },

  // Search shared items
  search: async (query: string): Promise<SharedItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockSharedItems.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  },
};
