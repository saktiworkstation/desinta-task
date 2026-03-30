-- Self Body Care — Migration (Additive Only)
-- Run this AFTER migration.sql has been applied
-- This migration ONLY adds new tables and does NOT modify existing ones

-- 7. Body Care Daily Routine (AM/PM skincare checklist)
CREATE TABLE IF NOT EXISTS bodycare_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id INT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  routine TEXT NOT NULL CHECK (routine IN ('am', 'pm')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id, date, routine)
);

-- 8. Body Care Weekly (masker, scrub, hair treatment, etc.)
CREATE TABLE IF NOT EXISTS bodycare_weekly (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id INT NOT NULL,
  week_number INT NOT NULL,
  year INT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id, week_number, year)
);

-- 9. Skin Condition Log
CREATE TABLE IF NOT EXISTS skin_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  condition TEXT NOT NULL CHECK (condition IN ('glowing', 'normal', 'oily', 'dry', 'breakout')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 10. Body Care Products Tracker
CREATE TABLE IF NOT EXISTS bodycare_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  opened_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_months INT NOT NULL DEFAULT 12,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Body Care Streak
CREATE TABLE IF NOT EXISTS bodycare_streak (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bodycare_daily_user_date ON bodycare_daily(user_id, date);
CREATE INDEX IF NOT EXISTS idx_bodycare_daily_routine ON bodycare_daily(user_id, date, routine);
CREATE INDEX IF NOT EXISTS idx_bodycare_weekly_user_week ON bodycare_weekly(user_id, week_number, year);
CREATE INDEX IF NOT EXISTS idx_skin_log_user_date ON skin_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_bodycare_products_user_active ON bodycare_products(user_id, is_active);

-- Insert default streak row for Desinta
INSERT INTO bodycare_streak (user_id, current_streak, longest_streak)
VALUES ('desinta-main', 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE bodycare_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE bodycare_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bodycare_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bodycare_streak ENABLE ROW LEVEL SECURITY;

-- Create policies for anon access (single-user app, same pattern as existing tables)
CREATE POLICY "Allow all for bodycare_daily" ON bodycare_daily FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for bodycare_weekly" ON bodycare_weekly FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for skin_log" ON skin_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for bodycare_products" ON bodycare_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for bodycare_streak" ON bodycare_streak FOR ALL USING (true) WITH CHECK (true);
