-- DeliverEase Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geolocation features

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dispatcher', 'restaurant', 'driver')),
  full_name TEXT NOT NULL,
  phone_number TEXT,
  balance INTEGER DEFAULT 0 NOT NULL,
  current_lat TEXT,
  current_lng TEXT,
  push_token TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='is_active') THEN
    ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='avatar_url') THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='updated_at') THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_lat TEXT,
  delivery_lng TEXT,
  restaurant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'delivered', 'cancelled')),
  collection_amount INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL,
  delivery_window TEXT,
  picked_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  proof_image_url TEXT,
  notes TEXT,
  dispatcher_notes TEXT,
  cancelled_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to orders if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='cancelled_reason') THEN
    ALTER TABLE orders ADD COLUMN cancelled_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='orders' AND column_name='updated_at') THEN
    ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'commission', 'payment', 'refund')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing column to transactions if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='transactions' AND column_name='order_id') THEN
    ALTER TABLE transactions ADD COLUMN order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id)
);

-- Notifications table (for real-time alerts)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'transaction', 'system', 'alert')),
  is_read BOOLEAN DEFAULT false NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_driver ON ratings(driver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_driver_status ON orders(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo users (password is 'demo123' hashed with bcrypt)
INSERT INTO users (email, password, role, full_name, phone_number, balance) VALUES
  ('admin@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'admin', 'Admin User', '01000000000', 0),
  ('dispatcher@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'dispatcher', 'Dispatcher User', '01011111111', 0),
  ('restaurant@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'restaurant', 'Burger King Demo', '01022222222', 0),
  ('restaurant2@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'restaurant', 'Pizza Hut Demo', '01022222223', 0),
  ('driver@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'driver', 'Hassan Driver', '01033333333', 0),
  ('driver2@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'driver', 'Ahmed Driver', '01033333334', 0)
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on users
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users';
    END LOOP;
    
    -- Drop all policies on orders
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON orders';
    END LOOP;
    
    -- Drop all policies on transactions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'transactions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON transactions';
    END LOOP;
    
    -- Drop all policies on ratings
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'ratings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ratings';
    END LOOP;
    
    -- Drop all policies on notifications
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notifications') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON notifications';
    END LOOP;
END $$;

-- Create policies for authenticated access
-- Users policies: Allow public read for authentication, but restrict writes
CREATE POLICY "Users are publicly readable" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update themselves" ON users FOR UPDATE USING (true);

-- Orders policies: Open for all authenticated users
CREATE POLICY "Orders are publicly readable" ON orders FOR SELECT USING (true);
CREATE POLICY "Orders can be inserted" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders can be updated" ON orders FOR UPDATE USING (true);
CREATE POLICY "Orders can be deleted" ON orders FOR DELETE USING (true);

-- Transactions policies
CREATE POLICY "Transactions are publicly readable" ON transactions FOR SELECT USING (true);
CREATE POLICY "Transactions can be inserted" ON transactions FOR INSERT WITH CHECK (true);

-- Ratings policies
CREATE POLICY "Ratings are publicly readable" ON ratings FOR SELECT USING (true);
CREATE POLICY "Ratings can be inserted" ON ratings FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Notifications are publicly readable" ON notifications FOR SELECT USING (true);
CREATE POLICY "Notifications can be inserted" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Notifications can be updated" ON notifications FOR UPDATE USING (true);

DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
CREATE PUBLICATION supabase_realtime FOR TABLE orders, notifications, users;

-- Create view for order statistics
CREATE OR REPLACE VIEW order_stats AS
SELECT 
  DATE(created_at) as date,
  status,
  COUNT(*) as count,
  SUM(collection_amount) as total_collection,
  SUM(delivery_fee) as total_delivery_fee
FROM orders
GROUP BY DATE(created_at), status;

-- Create view for driver statistics
CREATE OR REPLACE VIEW driver_stats AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  COUNT(o.id) as total_deliveries,
  SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as completed_deliveries,
  SUM(CASE WHEN o.status = 'delivered' THEN o.delivery_fee ELSE 0 END) as total_earnings,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(r.id) as rating_count
FROM users u
LEFT JOIN orders o ON u.id = o.driver_id
LEFT JOIN ratings r ON u.id = r.driver_id
WHERE u.role = 'driver'
GROUP BY u.id, u.full_name, u.email;

-- Grant access to views
GRANT SELECT ON order_stats TO anon, authenticated;
GRANT SELECT ON driver_stats TO anon, authenticated;
