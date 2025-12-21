export type UserRole = "admin" | "dispatcher" | "restaurant" | "driver";

export type OrderStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "delivered"
  | "cancelled";

export type DriverStatus = "available" | "busy" | "offline";

export interface Profile {
  id: number;
  role: UserRole;
  fullName: string;
  phoneNumber: string;
  email?: string;
  createdAt?: string;
  currentLocation?: CustomerGeo | null;
  driverStatus?: DriverStatus;
  balance?: number; // Added from backend
}

export interface CustomerGeo {
  lat: number;
  lng: number;
}

export interface Order {
  id: number;
  createdAt: string;
  restaurantId: number;
  driverId: number | null;
  customerName: string;
  customerAddress: string;
  customerGeo: CustomerGeo | null;
  phonePrimary: string; // customerPhone in backend
  phoneSecondary: string | null;
  collectionAmount: number;
  deliveryFee: number;
  status: OrderStatus;
  deliveryWindow: string | null;
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
