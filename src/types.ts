export interface RestaurantTable {
  id: string;
  table_number: number;
  qr_code_url: string;
  status: 'vacant' | 'occupied' | 'service_required';
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  is_veg: boolean;
  is_non_veg: boolean;
  is_spicy: boolean;
  image_url: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';
export type PaymentMethod = 'cash' | 'digital';

export interface Order {
  id: string;
  table_id?: string;
  table_number: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  total_amount: number;
  notes?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type ServiceRequestType = 'waiter' | 'water' | 'bill';
export type ServiceRequestStatus = 'pending' | 'resolved';

export interface ServiceRequest {
  id: string;
  table_id?: string;
  table_number: number;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  created_at: string;
}

export interface SalesSummary {
  totalRevenue: number;
  orderCount: number;
  cashRevenue: number;
  digitalRevenue: number;
  topSellingItems: Array<{ name: string; quantity: number; revenue: number }>;
}

export interface User {
  email: string;
  role: 'admin' | 'guest';
}

