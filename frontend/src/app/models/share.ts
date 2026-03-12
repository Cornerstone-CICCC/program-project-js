export interface SharedItem {
  id: number;
  name: string;
  category: string;
  image: string;
  type: 'free' | 'pickup' | 'exchange';
  location: string;
  distance: string;
  user: {
    name: string;
    avatar: string;
    rating: number;
  };
  description: string;
  expiryDate?: string;
  createdAt: string;
}

export type ShareItemType = 'free' | 'pickup' | 'exchange';
