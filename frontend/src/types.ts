export interface Product {
  id: number;
  name: string;
  category: string;
  value: number;
  stock: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Order {
  id: number;
  productId: number;
  userId: number | null;
  quantity: number;
  totalValue: number;
  status: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  userId: number | null;
  orderId: number | null;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export interface Shipment {
  id: number;
  orderId: number;
  tracking: string;
  address: string;
  status: string;
  createdAt: string;
}

export interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  nickname: string;
  role: string;
  avatar: string | null;
  createdAt: string;
}
