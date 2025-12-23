import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", {
    enum: ["admin", "dispatcher", "restaurant", "driver"],
  }).notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number"),
  balance: integer("balance").default(0).notNull(),
  currentLat: text("current_lat"),
  currentLng: text("current_lng"),
  pushToken: text("push_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLat: text("delivery_lat"),
  deliveryLng: text("delivery_lng"),
  restaurantId: integer("restaurant_id").notNull(),
  driverId: integer("driver_id"),
  status: text("status", {
    enum: ["pending", "assigned", "picked_up", "delivered", "cancelled"],
  })
    .default("pending")
    .notNull(),
  collectionAmount: integer("collection_amount").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  deliveryWindow: text("delivery_window"),
  pickedAt: timestamp("picked_at"),
  deliveredAt: timestamp("delivered_at"),
  proofImageUrl: text("proof_image_url"),
  notes: text("notes"),
  dispatcherNotes: text("dispatcher_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // In cents
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'commission', 'payment'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ordersAsRestaurant: many(orders, { relationName: "restaurantOrders" }),
  ordersAsDriver: many(orders, { relationName: "driverOrders" }),
  transactions: many(transactions, { relationName: "userTransactions" }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  restaurant: one(users, {
    fields: [orders.restaurantId],
    references: [users.id],
    relationName: "restaurantOrders",
  }),
  driver: one(users, {
    fields: [orders.driverId],
    references: [users.id],
    relationName: "driverOrders",
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
    relationName: "userTransactions",
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Ratings table for driver reviews
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  driverId: integer("driver_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

