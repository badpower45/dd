import { type User, type InsertUser, type Order, type InsertOrder } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order>;
  getOrdersByRestaurant(restaurantId: number): Promise<Order[]>;
  getOrdersByDriver(driverId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getPendingOrders(): Promise<Order[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private userIdCounter: number;
  private orderIdCounter: number;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.userIdCounter = 1;
    this.orderIdCounter = 1;

    this.seedDemoData();
  }

  private seedDemoData() {
    // Seed Users
    const demoUsers: InsertUser[] = [
      {
        email: "admin@demo.com",
        password: "demo123",
        role: "admin",
        fullName: "Admin User",
        phoneNumber: "1234567890",
      },
      {
        email: "dispatcher@demo.com",
        password: "demo123",
        role: "dispatcher",
        fullName: "Dispatcher Sarah",
        phoneNumber: "0987654321",
      },
      {
        email: "restaurant@demo.com",
        password: "demo123",
        role: "restaurant",
        fullName: "Pizza Palace",
        phoneNumber: "1122334455",
      },
      {
        email: "driver@demo.com",
        password: "demo123",
        role: "driver",
        fullName: "John Driver",
        phoneNumber: "5544332211",
      },
    ];

    demoUsers.forEach(u => this.createUser(u));

    // Seed Orders
    this.createOrder({
      customerName: "Alice Smith",
      customerPhone: "1231231234",
      deliveryAddress: "123 Main St, Springfield",
      restaurantId: 3, // Matches Pizza Palace above
      status: "pending",
      collectionAmount: 2500, // $25.00
      deliveryFee: 500, // $5.00
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      ...insertUser,
      id,
      phoneNumber: insertUser.phoneNumber ?? null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter((u) => u.role === role);
  }

  // Order Methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const order: Order = {
      ...insertOrder,
      id,
      driverId: insertOrder.driverId ?? null,
      deliveryLat: insertOrder.deliveryLat ?? null,
      deliveryLng: insertOrder.deliveryLng ?? null,
      notes: insertOrder.notes ?? null,
      status: insertOrder.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const order = await this.getOrder(id);
    if (!order) throw new Error("Order not found");
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (o) => o.restaurantId === restaurantId
    );
  }

  async getOrdersByDriver(driverId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (o) => o.driverId === driverId
    );
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getPendingOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (o) => o.status === "pending"
    );
  }
}

export const storage = new MemStorage();
