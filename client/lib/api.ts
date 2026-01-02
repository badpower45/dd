/**
 * API Layer - Uses Supabase directly (no separate backend needed)
 */

import { supabaseApi } from "./supabaseApi";

// Re-export supabaseApi as the main api
export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      supabaseApi.auth.login(body.email, body.password),
    register: (body: any) => supabaseApi.auth.register(body),
  },
  users: {
    get: (id: number) => supabaseApi.users.get(id),
    list: (role?: string) => supabaseApi.users.list(role),
    update: (id: number, body: any) => supabaseApi.users.update(id, body),
  },
  orders: {
    list: (filters?: {
      restaurantId?: number;
      driverId?: number;
      status?: string;
    }) => supabaseApi.orders.list(filters),
    create: (body: any) => supabaseApi.orders.create(body),
    update: (id: number, body: any) => supabaseApi.orders.update(id, body),
    getPending: () => supabaseApi.orders.getPending(),
  },
  drivers: {
    updateLocation: (userId: number, lat: number, lng: number) =>
      supabaseApi.users.updateLocation(userId, String(lat), String(lng)),
    getActive: () => supabaseApi.drivers.getActive(),
  },
  transactions: {
    list: (userId: number) => supabaseApi.transactions.list(userId),
  },
  analytics: {
    getDaily: () => supabaseApi.analytics.getDailyStats(),
    getRestaurantStats: (restaurantId: number) =>
      supabaseApi.analytics.getRestaurantStats(restaurantId),
  },
  customers: {
    lookup: (phone: string) => supabaseApi.customers.lookup(phone),
  },
  ratings: {
    create: (body: any) => supabaseApi.ratings.create(body),
    getByDriver: (driverId: number) =>
      supabaseApi.ratings.getByDriver(driverId),
  },
};

// Legacy exports for backward compatibility
export const BASE_URL = "https://supabase-direct"; // Not used anymore
export const apiRequest = async () => {
  throw new Error("Use supabaseApi instead of apiRequest");
};

export default api;
