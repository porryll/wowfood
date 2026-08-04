export type ProductStatus = 'available' | 'sold_out';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export type SpiceLevel = '不辣' | '微辣' | '中辣' | '重辣';

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  tags: string[];
  imageUrl: string;
  status: ProductStatus;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  dateKey: string;
  queueNumber: number;
  displayNumber: string;
  phone: string;
  pickupTime: string;
  spice: SpiceLevel;
  remark: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  name: string;
  notice: string;
  adminPin: string;
  openLabel: string;
  acceptingOrders: boolean;
  pauseMessage: string;
}

export interface SharedSnapshot {
  revision: number;
  settings: ShopSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
}
