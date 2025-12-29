export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number; 
  purchasePrice: number; 
  stock: number;
  imageUrl?: string;
  categoryId?: string; // NEW: optional link to a category
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  tenderedAmount: number;
  change: number;
}