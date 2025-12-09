import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order, CreateOrderInput, OrderStatus } from "@/lib/types";

const ORDERS_STORAGE_KEY = "@deliverease_orders";

const generateId = (): string => {
  return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const stored = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Error loading orders:", error);
    return [];
  }
};

export const saveOrders = async (orders: Order[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Error saving orders:", error);
  }
};

export const createOrder = async (
  input: CreateOrderInput,
  restaurantId: string,
): Promise<Order> => {
  const orders = await getOrders();

  const newOrder: Order = {
    id: generateId(),
    created_at: new Date().toISOString(),
    restaurant_id: restaurantId,
    driver_id: null,
    customer_name: input.customer_name,
    customer_address: input.customer_address,
    customer_geo: input.customer_geo || null,
    phone_primary: input.phone_primary,
    phone_secondary: input.phone_secondary || null,
    collection_amount: input.collection_amount,
    delivery_fee: 5.0,
    status: "pending",
    delivery_window: null,
  };

  orders.unshift(newOrder);
  await saveOrders(orders);

  return newOrder;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<Order | null> => {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);

  if (index === -1) return null;

  orders[index].status = status;
  await saveOrders(orders);

  return orders[index];
};

export const assignOrder = async (
  orderId: string,
  driverId: string,
  deliveryWindow: string,
): Promise<Order | null> => {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);

  if (index === -1) return null;

  orders[index].driver_id = driverId;
  orders[index].delivery_window = deliveryWindow;
  orders[index].status = "assigned";
  await saveOrders(orders);

  return orders[index];
};

export const getOrdersByRestaurant = async (
  restaurantId: string,
): Promise<Order[]> => {
  const orders = await getOrders();
  return orders.filter((o) => o.restaurant_id === restaurantId);
};

export const getOrdersByDriver = async (driverId: string): Promise<Order[]> => {
  const orders = await getOrders();
  return orders.filter((o) => o.driver_id === driverId);
};

export const getPendingOrders = async (): Promise<Order[]> => {
  const orders = await getOrders();
  return orders.filter((o) => o.status === "pending");
};

export const getDriverTodayDeliveries = async (
  driverId: string,
): Promise<Order[]> => {
  const orders = await getOrders();
  const today = new Date().toDateString();

  return orders.filter(
    (o) =>
      o.driver_id === driverId &&
      o.status === "delivered" &&
      new Date(o.created_at).toDateString() === today,
  );
};

export const clearAllOrders = async (): Promise<void> => {
  await AsyncStorage.removeItem(ORDERS_STORAGE_KEY);
};

export const seedDemoOrders = async (restaurantId: string): Promise<void> => {
  const existingOrders = await getOrders();
  if (existingOrders.length > 0) return;

  const demoOrders: Order[] = [
    {
      id: "demo-order-1",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      restaurant_id: restaurantId,
      driver_id: null,
      customer_name: "Michael Johnson",
      customer_address: "123 Main Street, Downtown",
      customer_geo: { lat: 40.7128, lng: -74.006 },
      phone_primary: "+1555123456",
      phone_secondary: null,
      collection_amount: 45.5,
      delivery_fee: 5.0,
      status: "pending",
      delivery_window: null,
    },
    {
      id: "demo-order-2",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      restaurant_id: restaurantId,
      driver_id: null,
      customer_name: "Emily Davis",
      customer_address: "456 Oak Avenue, Midtown",
      customer_geo: { lat: 40.7589, lng: -73.9851 },
      phone_primary: "+1555789012",
      phone_secondary: "+1555789013",
      collection_amount: 32.0,
      delivery_fee: 5.0,
      status: "pending",
      delivery_window: null,
    },
    {
      id: "demo-order-3",
      created_at: new Date(Date.now() - 1800000).toISOString(),
      restaurant_id: restaurantId,
      driver_id: "driver-001",
      customer_name: "Robert Wilson",
      customer_address: "789 Pine Road, Uptown",
      customer_geo: { lat: 40.7831, lng: -73.9712 },
      phone_primary: "+1555345678",
      phone_secondary: null,
      collection_amount: 67.25,
      delivery_fee: 5.0,
      status: "assigned",
      delivery_window: "6:00 PM - 6:30 PM",
    },
  ];

  await saveOrders(demoOrders);
};
