/**
 * Enhanced query client configuration with optimized caching
 */

import { QueryClient } from "@tanstack/react-query";
import { getOptimizedQueryClient } from "./performance";

// Use optimized query client
export const queryClient = getOptimizedQueryClient();

// Query keys factory for consistency
export const queryKeys = {
  // Auth
  currentUser: ["current-user"] as const,

  // Users
  users: (role?: string) => ["users", role] as const,
  user: (id: number) => ["user", id] as const,

  // Orders
  orders: (filters?: Record<string, any>) => ["orders", filters] as const,
  order: (id: number) => ["order", id] as const,
  pendingOrders: ["orders", "pending"] as const,

  // Transactions
  transactions: (userId?: number) => ["transactions", userId] as const,

  // Ratings
  ratings: (driverId: number) => ["ratings", driverId] as const,

  // Notifications
  notifications: (userId: number) => ["notifications", userId] as const,
  unreadCount: (userId: number) => ["unread-count", userId] as const,

  // Analytics
  stats: (type: string, id?: number) => ["stats", type, id] as const,
  restaurantStats: (id: number) => ["stats", "restaurant", id] as const,
  driverStats: (id: number) => ["stats", "driver", id] as const,
  dailyStats: ["stats", "daily"] as const,

  // Drivers
  activeDrivers: ["drivers", "active"] as const,

  // Customers
  customerLookup: (phone: string) => ["customer", phone] as const,
  customerHistory: (phone: string) => ["customer-history", phone] as const,
};
