-- Add scheduled_time column to content_tracker
-- Run this migration in Supabase SQL Editor
ALTER TABLE content_tracker ADD COLUMN IF NOT EXISTS scheduled_time TEXT;
