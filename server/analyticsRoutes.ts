import type { Express } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Register analytics API routes
 */
export function registerAnalyticsRoutes(app: Express) {
  // Get revenue analytics
  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      const period = (req.query.period as string) || "weekly";
      const data = await getRevenueData(period);
      res.json(data);
    } catch (error) {
      console.error("Revenue analytics error:", error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  // Get orders distribution by status
  app.get("/api/analytics/orders/distribution", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
      `);
      res.json(result);
    } catch (error) {
      console.error("Orders distribution error:", error);
      res.status(500).json({ message: "Failed to fetch orders distribution" });
    }
  });

  // Get driver performance leaderboard
  app.get("/api/analytics/drivers/leaderboard", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          u.id,
          u.full_name as name,
          COUNT(o.id) as total_deliveries,
          AVG(r.rating) as average_rating,
          SUM(o.delivery_fee) as total_earnings,
          COUNT(CASE WHEN o.delivered_at IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(o.id), 0) as on_time_percentage
        FROM users u
        LEFT JOIN orders o ON u.id = o.driver_id
        LEFT JOIN ratings r ON u.id = r.driver_id
        WHERE u.role = 'driver'
        GROUP BY u.id, u.full_name
        ORDER BY total_deliveries DESC
        LIMIT 10
      `);
      res.json(result);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get driver achievements
  app.get("/api/analytics/drivers/:id/achievements", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const result = await db.execute(
        sql`SELECT * FROM achievements WHERE driver_id = ${driverId} ORDER BY earned_at DESC`,
      );
      res.json(result);
    } catch (error) {
      console.error("Achievements error:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Get customer insights
  app.get("/api/analytics/customers/insights", async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM customer_insights
        ORDER BY total_orders DESC
        LIMIT 50
      `);
      res.json(result);
    } catch (error) {
      console.error("Customer insights error:", error);
      res.status(500).json({ message: "Failed to fetch customer insights" });
    }
  });
}

/**
 * Get revenue data for specified period
 */
async function getRevenueData(period: string) {
  const query =
    period === "daily"
      ? sql`
      SELECT 
        DATE(created_at) as date,
        SUM(delivery_fee) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `
      : period === "weekly"
        ? sql`
      SELECT 
        DATE_TRUNC('week', created_at) as date,
        SUM(delivery_fee) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY date
    `
        : sql`
      SELECT 
        DATE_TRUNC('month', created_at) as date,
        SUM(delivery_fee) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY date
    `;

  const result = await db.execute(query);
  return result;
}
