-- Daily Glow — Desinta: Database Migration
-- Run this SQL in your Supabase SQL Editor

-- 1. Daily Tasks
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id INT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id, date)
);

-- 2. Weekly Tasks
CREATE TABLE IF NOT EXISTS weekly_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id INT NOT NULL,
  week_number INT NOT NULL,
  year INT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id, week_number, year)
);

-- 3. Stats
CREATE TABLE IF NOT EXISTS stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  total_content_posted INT NOT NULL DEFAULT 0,
  total_brand_deals INT NOT NULL DEFAULT 0,
  total_earnings INT NOT NULL DEFAULT 0,
  thesis_progress INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Journal
CREATE TABLE IF NOT EXISTS journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT NOT NULL CHECK (mood IN ('glowing', 'happy', 'okay', 'tired')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 5. Income Log
CREATE TABLE IF NOT EXISTS income_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL,
  amount INT NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Content Tracker
CREATE TABLE IF NOT EXISTS content_tracker (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  platform TEXT NOT NULL CHECK (platform IN ('TikTok', 'Instagram', 'Both')),
  content_type TEXT NOT NULL CHECK (content_type IN ('Review', 'GRWM', 'Tutorial', 'Endorse', 'Other')),
  brand_name TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'filming', 'editing', 'posted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_tasks_user_week ON weekly_tasks(user_id, week_number, year);
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal(user_id, date);
CREATE INDEX IF NOT EXISTS idx_income_log_user_date ON income_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_content_tracker_user_status ON content_tracker(user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_tracker_user_date ON content_tracker(user_id, date);

-- Insert default stats row for Desinta
INSERT INTO stats (user_id, current_streak, longest_streak, total_content_posted, total_brand_deals, total_earnings, thesis_progress)
VALUES ('desinta-main', 0, 0, 0, 0, 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Enable Row Level Security (optional, for production)
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tracker ENABLE ROW LEVEL SECURITY;

-- Create policies for anon access (single-user app)
CREATE POLICY "Allow all for daily_tasks" ON daily_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for weekly_tasks" ON weekly_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for stats" ON stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for journal" ON journal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for income_log" ON income_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for content_tracker" ON content_tracker FOR ALL USING (true) WITH CHECK (true);
