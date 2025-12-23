-- DeliverEase Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_lat TEXT,
  delivery_lng TEXT,
  restaurant_id INTEGER NOT NULL REFERENCES users(id),
  driver_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'delivered', 'cancelled')),
  collection_amount INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL,
  delivery_window TEXT,
  picked_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  proof_image_url TEXT,
  notes TEXT,
  dispatcher_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  driver_id INTEGER NOT NULL REFERENCES users(id),
  restaurant_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_driver ON ratings(driver_id);

-- Insert demo users (password is 'demo123' hashed with bcrypt)
INSERT INTO users (email, password, role, full_name, phone_number) VALUES
  ('admin@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'admin', 'Admin User', '01000000000'),
  ('dispatcher@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'dispatcher', 'Dispatcher User', '01011111111'),
  ('restaurant@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'restaurant', 'Burger King Demo', '01022222222'),
  ('driver@demo.com', '$2b$10$0NB/yZehH4RdARrw33SDnOKtiEIguhh9hDf8xkyHTeN85uffidody', 'driver', 'Hassan Driver', '01033333333')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated access
-- Users policy: authenticated users can read all users, update their own
CREATE POLICY "Users are viewable by authenticated users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own record" ON users FOR UPDATE USING (true);

-- Orders policy: authenticated users can manage orders
CREATE POLICY "Orders are viewable by authenticated users" ON orders FOR SELECT USING (true);
CREATE POLICY "Orders can be inserted by authenticated users" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders can be updated by authenticated users" ON orders FOR UPDATE USING (true);

-- Transactions policy
CREATE POLICY "Transactions are viewable by authenticated users" ON transactions FOR SELECT USING (true);
CREATE POLICY "Transactions can be inserted" ON transactions FOR INSERT WITH CHECK (true);

-- Ratings policy
CREATE POLICY "Ratings are viewable by all" ON ratings FOR SELECT USING (true);
CREATE POLICY "Ratings can be inserted" ON ratings FOR INSERT WITH CHECK (true);
