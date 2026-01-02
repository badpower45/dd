/**
 * Supabase Direct API Layer
 * This replaces the Express.js backend by calling Supabase directly
 * Enhanced with realtime features and optimized queries
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { compare, hash } from "bcryptjs";
import { RealtimeChannel } from "@supabase/supabase-js";

// Types
export interface User {
  id: number;
  email: string;
  password?: string; // hashed on the server, لا يتم تخزينه في التطبيق
  role: "admin" | "dispatcher" | "restaurant" | "driver";
  full_name: string;
  phone_number: string | null;
  balance: number;
  current_lat: string | null;
  current_lng: string | null;
  push_token: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_lat: string | null;
  delivery_lng: string | null;
  restaurant_id: number;
  driver_id: number | null;
  status: "pending" | "assigned" | "picked_up" | "delivered" | "cancelled";
  collection_amount: number;
  delivery_fee: number;
  delivery_window: string | null;
  picked_at: string | null;
  delivered_at: string | null;
  proof_image_url: string | null;
  notes: string | null;
  dispatcher_notes: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  order_id: number | null;
  amount: number;
  type: "deposit" | "withdrawal" | "commission" | "payment" | "refund";
  description: string | null;
  created_at: string;
}

export interface Rating {
  id: number;
  order_id: number;
  driver_id: number;
  restaurant_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "order" | "transaction" | "system" | "alert";
  is_read: boolean;
  data: any;
  created_at: string;
}

const stripPassword = <T extends { password?: string }>(
  user: T | null,
): T | null => {
  if (!user) return user;
  const { password: _ignored, ...rest } = user as any;
  return rest as T;
};

const stripPasswordArray = <T extends { password?: string }>(
  users: T[] | null,
): T[] => {
  if (!users) return [];
  return users.map((u) => stripPassword(u) as T);
};

// Auth API
export const supabaseApi = {
  auth: {
    async login(email: string, password: string): Promise<User> {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("is_active", true)
        .single();

      if (error || !user) throw new Error("Invalid credentials");

      if (!user.password) throw new Error("Invalid credentials");
      const isValid = await compare(password, user.password);
      if (!isValid) throw new Error("Invalid credentials");

      return stripPassword(user) as User;
    },

    async register(
      userData: Partial<User> & { password: string },
    ): Promise<User> {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

      const hashedPassword = await hash(userData.password, 10);

      const { data: user, error } = await supabase
        .from("users")
        .insert({ ...userData, password: hashedPassword })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return stripPassword(user) as User;
    },
  },

  users: {
    async get(id: number): Promise<User> {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return stripPassword(data) as User;
    },

    async list(role?: string, activeOnly: boolean = true): Promise<User[]> {
      let query = supabase.from("users").select("*");
      if (role) query = query.eq("role", role);
      if (activeOnly) query = query.eq("is_active", true);

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });
      if (error) throw new Error(error.message);
      return stripPasswordArray(data) as User[];
    },

    async update(id: number, updates: Partial<User>): Promise<User> {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return stripPassword(data) as User;
    },

    async updateLocation(id: number, lat: string, lng: string): Promise<User> {
      return this.update(id, { current_lat: lat, current_lng: lng });
    },

    async deactivate(id: number): Promise<User> {
      return this.update(id, { is_active: false });
    },
  },

  orders: {
    async create(order: Partial<Order>): Promise<Order> {
      const { data, error } = await supabase
        .from("orders")
        .insert(order)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Create notification for dispatcher
      await supabaseApi.notifications.create({
        user_id: 0, // Broadcast to dispatchers
        title: "New Order",
        message: `New order #${data.id} from ${data.customer_name}`,
        type: "order",
        data: { order_id: data.id },
      });

      return data;
    },

    async get(id: number): Promise<Order> {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    async list(filters?: {
      restaurantId?: number;
      driverId?: number;
      status?: string;
      limit?: number;
    }): Promise<Order[]> {
      let query = supabase.from("orders").select("*");

      if (filters?.restaurantId)
        query = query.eq("restaurant_id", filters.restaurantId);
      if (filters?.driverId) query = query.eq("driver_id", filters.driverId);
      if (filters?.status) query = query.eq("status", filters.status);

      query = query.order("created_at", { ascending: false });

      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    },

    async update(id: number, updates: Partial<Order>): Promise<Order> {
      // Handle status-specific timestamps
      if (updates.status === "picked_up" && !updates.picked_at) {
        updates.picked_at = new Date().toISOString();
      }
      if (updates.status === "delivered" && !updates.delivered_at) {
        updates.delivered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // If delivered, create transactions
      if (updates.status === "delivered" && data.driver_id) {
        await this.processDeliveryTransaction(data);
      }

      // Send notifications based on status
      await this.sendStatusNotifications(data);

      return data;
    },

    async processDeliveryTransaction(order: Order): Promise<void> {
      // Add delivery fee to driver's balance
      if (order.driver_id) {
        const { data: driver } = await supabase
          .from("users")
          .select("balance")
          .eq("id", order.driver_id)
          .single();

        if (driver) {
          await supabase
            .from("users")
            .update({ balance: driver.balance + order.delivery_fee })
            .eq("id", order.driver_id);

          await supabase.from("transactions").insert({
            user_id: order.driver_id,
            order_id: order.id,
            amount: order.delivery_fee,
            type: "commission",
            description: `Delivery fee for order #${order.id}`,
          });

          await supabaseApi.notifications.create({
            user_id: order.driver_id,
            title: "Payment Received",
            message: `You received ${order.delivery_fee} EGP for order #${order.id}`,
            type: "transaction",
            data: { order_id: order.id, amount: order.delivery_fee },
          });
        }
      }

      // Add collection to restaurant's balance
      const { data: restaurant } = await supabase
        .from("users")
        .select("balance")
        .eq("id", order.restaurant_id)
        .single();

      if (restaurant) {
        await supabase
          .from("users")
          .update({ balance: restaurant.balance + order.collection_amount })
          .eq("id", order.restaurant_id);

        await supabase.from("transactions").insert({
          user_id: order.restaurant_id,
          order_id: order.id,
          amount: order.collection_amount,
          type: "payment",
          description: `Collection for order #${order.id}`,
        });

        await supabaseApi.notifications.create({
          user_id: order.restaurant_id,
          title: "Order Delivered",
          message: `Order #${order.id} delivered successfully`,
          type: "order",
          data: { order_id: order.id },
        });
      }
    },

    async sendStatusNotifications(order: Order): Promise<void> {
      const statusMessages = {
        assigned: {
          title: "Order Assigned",
          msg: `Order #${order.id} has been assigned to a driver`,
        },
        picked_up: {
          title: "Order Picked Up",
          msg: `Order #${order.id} has been picked up`,
        },
        delivered: {
          title: "Order Delivered",
          msg: `Order #${order.id} has been delivered`,
        },
        cancelled: {
          title: "Order Cancelled",
          msg: `Order #${order.id} has been cancelled`,
        },
      };

      const notification =
        statusMessages[order.status as keyof typeof statusMessages];
      if (notification && order.restaurant_id) {
        await supabaseApi.notifications.create({
          user_id: order.restaurant_id,
          title: notification.title,
          message: notification.msg,
          type: "order",
          data: { order_id: order.id },
        });
      }
    },

    async getPending(): Promise<Order[]> {
      return this.list({ status: "pending" });
    },

    async assignDriver(orderId: number, driverId: number): Promise<Order> {
      return this.update(orderId, {
        driver_id: driverId,
        status: "assigned",
      });
    },

    // Realtime subscription for orders
    subscribeToOrders(callback: (order: Order) => void): RealtimeChannel {
      const channel = supabase
        .channel("orders-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => callback(payload.new as Order),
        )
        .subscribe();

      return channel;
    },

    unsubscribe(channel: RealtimeChannel): void {
      supabase.removeChannel(channel);
    },
  },

  transactions: {
    async list(userId?: number, limit?: number): Promise<Transaction[]> {
      let query = supabase.from("transactions").select("*");
      if (userId) query = query.eq("user_id", userId);

      query = query.order("created_at", { ascending: false });
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    },

    async create(transaction: Partial<Transaction>): Promise<Transaction> {
      const { data, error } = await supabase
        .from("transactions")
        .insert(transaction)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  },

  ratings: {
    async create(rating: Partial<Rating>): Promise<Rating> {
      const { data, error } = await supabase
        .from("ratings")
        .insert(rating)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Notify driver about new rating
      if (rating.driver_id) {
        await supabaseApi.notifications.create({
          user_id: rating.driver_id,
          title: "New Rating",
          message: `You received a ${rating.rating}-star rating`,
          type: "system",
          data: { rating_id: data.id },
        });
      }

      return data;
    },

    async getByDriver(
      driverId: number,
    ): Promise<{ ratings: Rating[]; average: number; count: number }> {
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("driver_id", driverId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      const ratings = data || [];
      const average =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      return {
        ratings,
        average: Math.round(average * 10) / 10,
        count: ratings.length,
      };
    },

    async getByRestaurant(restaurantId: number): Promise<Rating[]> {
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
  },

  notifications: {
    async create(
      notification: Partial<Notification>,
    ): Promise<Notification | null> {
      // Skip if user_id is 0 (broadcast)
      if (notification.user_id === 0) return null;

      const { data, error } = await supabase
        .from("notifications")
        .insert(notification)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    async list(userId: number, limit: number = 50): Promise<Notification[]> {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return data || [];
    },

    async markAsRead(id: number): Promise<void> {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },

    async markAllAsRead(userId: number): Promise<void> {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw new Error(error.message);
    },

    async getUnreadCount(userId: number): Promise<number> {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw new Error(error.message);
      return count || 0;
    },

    // Realtime subscription for notifications
    subscribeToNotifications(
      userId: number,
      callback: (notification: Notification) => void,
    ): RealtimeChannel {
      const channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => callback(payload.new as Notification),
        )
        .subscribe();

      return channel;
    },
  },

  drivers: {
    async getActive(): Promise<User[]> {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "driver")
        .eq("is_active", true)
        .not("current_lat", "is", null);

      if (error) throw new Error(error.message);
      return stripPasswordArray(data) as User[];
    },

    async getStats(driverId: number): Promise<any> {
      const { data, error } = await supabase
        .from("driver_stats")
        .select("*")
        .eq("id", driverId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  },

  analytics: {
    async getRestaurantStats(restaurantId: number): Promise<{
      todayOrders: number;
      totalCollection: number;
      activeDeliveries: number;
      thisWeek: number;
      thisMonth: number;
    }> {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const { data: todayData } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .gte("created_at", today.toISOString());

      const { data: weekData } = await supabase
        .from("orders")
        .select("id")
        .eq("restaurant_id", restaurantId)
        .eq("status", "delivered")
        .gte("created_at", weekAgo.toISOString());

      const { data: monthData } = await supabase
        .from("orders")
        .select("id")
        .eq("restaurant_id", restaurantId)
        .eq("status", "delivered")
        .gte("created_at", monthAgo.toISOString());

      const todayOrders = todayData?.length || 0;
      const totalCollection =
        todayData
          ?.filter((o) => o.status === "delivered")
          .reduce((sum, o) => sum + o.collection_amount, 0) || 0;
      const activeDeliveries =
        todayData?.filter((o) =>
          ["pending", "assigned", "picked_up"].includes(o.status),
        ).length || 0;

      return {
        todayOrders,
        totalCollection,
        activeDeliveries,
        thisWeek: weekData?.length || 0,
        thisMonth: monthData?.length || 0,
      };
    },

    async getDailyStats(): Promise<{
      collections: number;
      commissions: number;
      pendingOrders: number;
      activeDrivers: number;
      todayRevenue: number;
    }> {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .gte("created_at", today.toISOString());

      const collections =
        transactions
          ?.filter((t) => t.type === "payment")
          .reduce((sum, t) => sum + t.amount, 0) || 0;
      const commissions =
        transactions
          ?.filter((t) => t.type === "commission")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      const { data: pendingOrders } = await supabase
        .from("orders")
        .select("id")
        .eq("status", "pending");

      const { data: drivers } = await supabase
        .from("users")
        .select("id")
        .eq("role", "driver")
        .eq("is_active", true);

      return {
        collections,
        commissions,
        pendingOrders: pendingOrders?.length || 0,
        activeDrivers: drivers?.length || 0,
        todayRevenue: collections + commissions,
      };
    },

    async getDriverPerformance(
      driverId: number,
      days: number = 30,
    ): Promise<any> {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("driver_id", driverId)
        .gte("created_at", startDate.toISOString());

      const { data: ratings } = await supabase
        .from("ratings")
        .select("rating")
        .eq("driver_id", driverId);

      const totalDeliveries =
        orders?.filter((o) => o.status === "delivered").length || 0;
      const totalEarnings =
        orders
          ?.filter((o) => o.status === "delivered")
          .reduce((sum, o) => sum + o.delivery_fee, 0) || 0;
      const avgRating =
        ratings && ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      return {
        totalDeliveries,
        totalEarnings,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingCount: ratings?.length || 0,
      };
    },
  },

  customers: {
    async lookup(phone: string): Promise<{
      name: string;
      address: string;
      lat?: number;
      lng?: number;
    } | null> {
      const { data, error } = await supabase
        .from("orders")
        .select("customer_name, delivery_address, delivery_lat, delivery_lng")
        .eq("customer_phone", phone)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        name: data.customer_name,
        address: data.delivery_address,
        lat: data.delivery_lat ? parseFloat(data.delivery_lat) : undefined,
        lng: data.delivery_lng ? parseFloat(data.delivery_lng) : undefined,
      };
    },

    async getHistory(phone: string, limit: number = 10): Promise<Order[]> {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_phone", phone)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) return [];
      return data || [];
    },
  },
};

export default supabaseApi;
