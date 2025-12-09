import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(data);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Routes
  app.get("/api/users", async (req, res) => {
    const role = req.query.role as string | undefined;
    if (role) {
      const users = await storage.getUsersByRole(role);
      res.json(users);
    } else {
      const users = await storage.getAllUsers();
      res.json(users);
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Order Routes
  app.get("/api/orders", async (req, res) => {
    const restaurantId = req.query.restaurantId;
    const driverId = req.query.driverId;
    const status = req.query.status as string;

    let orders = await storage.getAllOrders();

    if (restaurantId) {
      orders = orders.filter(o => o.restaurantId === parseInt(restaurantId as string));
    }
    if (driverId) {
      orders = orders.filter(o => o.driverId === parseInt(driverId as string));
    }
    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const order = await storage.updateOrder(id, updates);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to update order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

