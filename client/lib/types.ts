export type UserRole = "admin" | "dispatcher" | "restaurant" | "driver";

export type OrderStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "delivered"
  | "cancelled";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone_number: string;
  email?: string;
  created_at?: string;
}

export interface CustomerGeo {
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  created_at: string;
  restaurant_id: string;
  driver_id: string | null;
  customer_name: string;
  customer_address: string;
  customer_geo: CustomerGeo | null;
  phone_primary: string;
  phone_secondary: string | null;
  collection_amount: number;
  delivery_fee: number;
  status: OrderStatus;
  delivery_window: string | null;
  restaurant?: Profile;
  driver?: Profile;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_address: string;
  customer_geo?: CustomerGeo;
  phone_primary: string;
  phone_secondary?: string;
  collection_amount: number;
}

export interface AssignOrderInput {
  order_id: string;
  driver_id: string;
  delivery_window: string;
}

export interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface WalletSummary {
  today_total: number;
  orders: Order[];
}
