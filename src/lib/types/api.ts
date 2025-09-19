export interface User {
  id: number;
  email: string;
  name: string;
  google_id: string;
  role: 'admin' | 'trainee';
  status: 'pending' | 'approved' | 'rejected';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'electronics' | 'clothing' | 'books';
  inStock: boolean;
  created_at: string;
}