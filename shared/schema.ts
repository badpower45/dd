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
  full_name: text("full_name").notNull(),
  phone_number: text("phone_number"),
  balance: integer("balance").default(0).notNull(),
  current_lat: text("current_lat"),
  current_lng: text("current_lng"),
  push_token: text("push_token"),
  is_active: boolean("is_active").default(true).notNull(),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customer_name: text("customer_name").notNull(),
  customer_phone: text("customer_phone").notNull(),
  delivery_address: text("delivery_address").notNull(),
  delivery_lat: text("delivery_lat"),
  delivery_lng: text("delivery_lng"),
  restaurant_id: integer("restaurant_id").notNull(),
  driver_id: integer("driver_id"),
  status: text("status", {
    enum: ["pending", "assigned", "picked_up", "delivered", "cancelled"],
  })
    .default("pending")
    .notNull(),
  collection_amount: integer("collection_amount").notNull(),
  delivery_fee: integer("delivery_fee").notNull(),
  delivery_window: text("delivery_window"),
  picked_at: timestamp("picked_at"),
  delivered_at: timestamp("delivered_at"),
  proof_image_url: text("proof_image_url"),
  notes: text("notes"),
  dispatcher_notes: text("dispatcher_notes"),
  cancelled_reason: text("cancelled_reason"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  order_id: integer("order_id"),
  amount: integer("amount").notNull(), // In cents
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'commission', 'payment', 'refund'
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ordersAsRestaurant: many(orders, { relationName: "restaurantOrders" }),
  ordersAsDriver: many(orders, { relationName: "driverOrders" }),
  transactions: many(transactions, { relationName: "userTransactions" }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  restaurant: one(users, {
    fields: [orders.restaurant_id],
    references: [users.id],
    relationName: "restaurantOrders",
  }),
  driver: one(users, {
    fields: [orders.driver_id],
    references: [users.id],
    relationName: "driverOrders",
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.user_id],
    references: [users.id],
    relationName: "userTransactions",
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  created_at: true,
});

// Ratings table for driver reviews
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").notNull(),
  driver_id: integer("driver_id").notNull(),
  restaurant_id: integer("restaurant_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  created_at: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
