// Lokasi: types/database.ts

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  university?: string;
  address?: string;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  specifications?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  image_url?: string;
  category?: string;
  rating?: number;
  sold?: number;
  variants?: string; // JSON string
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  user_id: number | null;
  total_amount: number;
  status: 'pending-payment' | 'payment-confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: string;
  shipping_method?: string;
  payment_method: 'bank_transfer' | 'virtual_account_bca' | 'virtual_account_bri' | 'virtual_account_bni' | 'virtual_account_mandiri' | 'shopeepay' | 'gopay' | 'qris';
  customer_info: string; // JSON string
  payment_proof?: string;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: Date;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_method: 'bank_transfer' | 'virtual_account_bca' | 'virtual_account_bri' | 'virtual_account_bni' | 'virtual_account_mandiri' | 'shopeepay' | 'gopay' | 'qris';
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  payment_proof?: string;
  confirmed_by?: number;
  confirmed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}