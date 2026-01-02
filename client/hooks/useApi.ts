/**
 * Custom hooks for data fetching with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabaseApi, {
  Order,
  User,
  Transaction,
  Notification,
} from "@/lib/supabaseApi";
import { queryKeys } from "@/lib/query-keys";

// ============= Orders =============

export function useOrders(filters?: {
  restaurantId?: number;
  driverId?: number;
  status?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.orders(filters),
    queryFn: () => supabaseApi.orders.list(filters),
    staleTime: 1000 * 10, // 10 seconds
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => supabaseApi.orders.get(id),
    enabled: !!id,
  });
}

export function usePendingOrders() {
  return useQuery({
    queryKey: queryKeys.pendingOrders,
    queryFn: () => supabaseApi.orders.getPending(),
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: Partial<Order>) => supabaseApi.orders.create(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Order> }) =>
      supabaseApi.orders.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.order(data.id) });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      driverId,
    }: {
      orderId: number;
      driverId: number;
    }) => supabaseApi.orders.assignDriver(orderId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// ============= Users =============

export function useUsers(role?: string, activeOnly: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users(role),
    queryFn: () => supabaseApi.users.list(role, activeOnly),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => supabaseApi.users.get(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<User> }) =>
      supabaseApi.users.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(data.id) });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, lat, lng }: { id: number; lat: string; lng: string }) =>
      supabaseApi.users.updateLocation(id, lat, lng),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(data.id) });
    },
  });
}

// ============= Drivers =============

export function useActiveDrivers() {
  return useQuery({
    queryKey: queryKeys.activeDrivers,
    queryFn: () => supabaseApi.drivers.getActive(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useDriverStats(driverId: number) {
  return useQuery({
    queryKey: queryKeys.driverStats(driverId),
    queryFn: () => supabaseApi.drivers.getStats(driverId),
    enabled: !!driverId,
  });
}

export function useDriverPerformance(driverId: number, days: number = 30) {
  return useQuery({
    queryKey: ["driver-performance", driverId, days],
    queryFn: () => supabaseApi.analytics.getDriverPerformance(driverId, days),
    enabled: !!driverId,
  });
}

// ============= Transactions =============

export function useTransactions(userId?: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.transactions(userId),
    queryFn: () => supabaseApi.transactions.list(userId, limit),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaction: Partial<Transaction>) =>
      supabaseApi.transactions.create(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ============= Ratings =============

export function useDriverRatings(driverId: number) {
  return useQuery({
    queryKey: queryKeys.ratings(driverId),
    queryFn: () => supabaseApi.ratings.getByDriver(driverId),
    enabled: !!driverId,
  });
}

export function useCreateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rating: Partial<any>) => supabaseApi.ratings.create(rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
    },
  });
}

// ============= Notifications =============

export function useNotifications(userId: number, limit: number = 50) {
  return useQuery({
    queryKey: queryKeys.notifications(userId),
    queryFn: () => supabaseApi.notifications.list(userId, limit),
    enabled: !!userId,
  });
}

export function useUnreadCount(userId: number) {
  return useQuery({
    queryKey: queryKeys.unreadCount(userId),
    queryFn: () => supabaseApi.notifications.getUnreadCount(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => supabaseApi.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      supabaseApi.notifications.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}

// ============= Analytics =============

export function useRestaurantStats(restaurantId: number) {
  return useQuery({
    queryKey: queryKeys.restaurantStats(restaurantId),
    queryFn: () => supabaseApi.analytics.getRestaurantStats(restaurantId),
    enabled: !!restaurantId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useDailyStats() {
  return useQuery({
    queryKey: queryKeys.dailyStats,
    queryFn: () => supabaseApi.analytics.getDailyStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// ============= Customers =============

export function useCustomerLookup(phone: string) {
  return useQuery({
    queryKey: queryKeys.customerLookup(phone),
    queryFn: () => supabaseApi.customers.lookup(phone),
    enabled: phone.length >= 10,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCustomerHistory(phone: string, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.customerHistory(phone),
    queryFn: () => supabaseApi.customers.getHistory(phone, limit),
    enabled: phone.length >= 10,
  });
}
