export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number; // per item
};

export type Order = {
  id: string; // e.g., VDW-2025-001
  customerName: string;
  phone?: string;
  createdAt: string; // ISO string
  items: { name: string; qty: number; price: number }[];
};