-- Enhanced Schema for New Features
-- Run this after the main supabase-schema.sql

-- Customer Profiles Table
CREATE TABLE IF NOT EXISTS customer_profiles (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  average_order_value INTEGER DEFAULT 0,
  preferred_restaurant_id INTEGER REFERENCES users(id),
  preferred_delivery_time TEXT,
  last_order_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver Metrics Table
CREATE TABLE IF NOT EXISTS driver_metrics (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  total_deliveries INTEGER DEFAULT 0,
  on_time_deliveries INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_earnings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, date)
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES users(id),
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table (for security)
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  session_token TEXT NOT NULL UNIQUE,
  device_info TEXT,
  ip_address TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Two-Factor Auth Table
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  secret_key TEXT,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offline Queue Table
CREATE TABLE IF NOT EXISTS offline_queue (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  operation_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enhance notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'system';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_driver_metrics_driver_date ON driver_metrics(driver_id, date);
CREATE INDEX IF NOT EXISTS idx_achievements_driver ON achievements(driver_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offline_queue_user ON offline_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Create trigger for customer_profiles updated_at
DROP TRIGGER IF EXISTS update_customer_profiles_updated_at ON customer_profiles;
CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for new tables
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- Policies (allow authenticated users)
CREATE POLICY "customer_profiles_policy" ON customer_profiles FOR ALL USING (true);
CREATE POLICY "driver_metrics_policy" ON driver_metrics FOR ALL USING (true);
CREATE POLICY "achievements_policy" ON achievements FOR ALL USING (true);
CREATE POLICY "user_sessions_policy" ON user_sessions FOR ALL USING (true);
CREATE POLICY "activity_logs_policy" ON activity_logs FOR ALL USING (true);
CREATE POLICY "two_factor_auth_policy" ON two_factor_auth FOR ALL USING (true);
CREATE POLICY "offline_queue_policy" ON offline_queue FOR ALL USING (true);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE customer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE achievements;

-- Analytics Views
CREATE OR REPLACE VIEW customer_insights AS
SELECT 
  cp.*,
  COUNT(o.id) as order_count,
  AVG(o.collection_amount) as avg_order_value,
  MAX(o.created_at) as last_order_date
FROM customer_profiles cp
LEFT JOIN orders o ON cp.phone_number = o.customer_phone
GROUP BY cp.id;

CREATE OR REPLACE VIEW driver_performance AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  dm.date,
  dm.total_deliveries,
  dm.on_time_deliveries,
  dm.average_rating,
  dm.total_earnings,
  ROUND((dm.on_time_deliveries::DECIMAL / NULLIF(dm.total_deliveries, 0)) * 100, 2) as on_time_percentage
FROM users u
JOIN driver_metrics dm ON u.id = dm.driver_id
WHERE u.role = 'driver';

-- Grant access to views
GRANT SELECT ON customer_insights TO anon, authenticated;
GRANT SELECT ON driver_performance TO anon, authenticated;
