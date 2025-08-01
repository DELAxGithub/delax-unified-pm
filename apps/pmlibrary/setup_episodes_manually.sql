-- Episode Statuses Master Data Setup
-- Execute this in Supabase SQL Editor

-- Insert episode statuses (if not already present)
INSERT INTO episode_statuses (status_name, status_order, color_code) VALUES
  ('台本作成中', 1, '#6B7280'),
  ('素材準備', 2, '#8B5CF6'),
  ('素材確定', 3, '#6366F1'),
  ('編集中', 4, '#3B82F6'),
  ('試写1', 5, '#06B6D4'),
  ('修正1', 6, '#10B981'),
  ('MA中', 7, '#84CC16'),
  ('初稿完成', 8, '#EAB308'),
  ('修正中', 9, '#F59E0B'),
  ('完パケ納品', 10, '#22C55E')
ON CONFLICT (status_name) DO NOTHING;

-- Verify episode_statuses data
SELECT * FROM episode_statuses ORDER BY status_order;

-- Check episodes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'episodes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check episode_statuses table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'episode_statuses' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test episode insert with minimal data
INSERT INTO episodes (episode_id, title, episode_type, season, episode_number, current_status)
VALUES ('TEST-001', 'Test Episode', 'vtr', 1, 1, '台本作成中');

-- Verify test episode
SELECT * FROM episodes WHERE episode_id = 'TEST-001';

-- Clean up test data
DELETE FROM episodes WHERE episode_id = 'TEST-001';