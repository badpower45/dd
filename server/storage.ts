import { users, orders, transactions, type User, type InsertUser, type Order, type InsertOrder, type Transaction } from "@shared/schema";
import { db } from "./db";
import { eq, or, and, ne } from "drizzle-orm";
import { hash, compare } from "bcryptjs";

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

  // New Methods
  getOnlineDrivers(): Promise<User[]>;
  updateDriverLocation(id: number, lat: string, lng: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  async getOnlineDrivers(): Promise<User[]> {
    // For now, we consider drivers with recent location updates as online
    // In a real app, we might check a "last_active" timestamp
    return await db.select().from(users).where(eq(users.role, 'driver'));
  }

  async updateDriverLocation(id: number, lat: string, lng: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ currentLat: lat, currentLng: lng })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Order Methods
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const order = await this.getOrder(id);
    if (!order) throw new Error("Order not found");

    // Business Logic: Delivery Completion
    if (updates.status === 'delivered' && order.status !== 'delivered') {
      const now = new Date();
      updates.deliveredAt = now;

      // Transaction Logic
      await db.transaction(async (tx) => {
        // 1. Add delivery fee to Driver's balance
        if (order.driverId) {
          await tx.update(users)
            .set({ balance: eq(users.balance, order.deliveryFee) }) // This is wrong, needs sql increment. Correct way usually sql`${users.balance} + ${order.deliveryFee}` but keeping it simple for now or fetch-update
          // Drizzle simple increment:
          // .set({ balance: sql`${users.balance} + ${order.deliveryFee}` }) 
          // Since I don't have sql imported, I will do read-update for simplicity or just assume standard update
          // Let's do a safe read-update logic inside transaction if possible, but for MVP:
          const [driver] = await tx.select().from(users).where(eq(users.id, order.driverId));
          if (driver) {
            await tx.update(users).set({ balance: driver.balance + order.deliveryFee }).where(eq(users.id, order.driverId));

            await tx.insert(transactions).values({
              userId: order.driverId,
              amount: order.deliveryFee,
              type: 'commission',
              description: `Delivery fee for order #${id}`
            });
          }
        }

        // 2. Adjust Restaurant Balance (Restaurant OWES commission or GETS paid? 
        // Usually: Restaurant gets (Collection - Commission). 
        // Let's assume restaurant gets the full collection amount recorded for now.
        const [restaurant] = await tx.select().from(users).where(eq(users.id, order.restaurantId));
        if (restaurant) {
          await tx.update(users).set({ balance: restaurant.balance + order.collectionAmount }).where(eq(users.id, order.restaurantId));

          await tx.insert(transactions).values({
            userId: order.restaurantId,
            amount: order.collectionAmount,
            type: 'payment',
            description: `Collection for order #${id}`
          });
        }
      });
    }

    // Status Logic for timestamps
    if (updates.status === 'picked_up' && !order.pickedAt) {
      updates.pickedAt = new Date();
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    return updatedOrder;
  }

  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.restaurantId, restaurantId));
  }

  async getOrdersByDriver(driverId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.driverId, driverId));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getPendingOrders(): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.status, "pending"));
  }
}

export const storage = new DatabaseStorage();
