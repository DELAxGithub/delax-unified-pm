-- PMPlatto development seed data
-- Test user for authentication
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'authenticated',
  'authenticated',
  'user@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Sample programs data (updated to match current schema)
INSERT INTO programs (
  program_id,
  title,
  subtitle,
  status,
  first_air_date,
  filming_date,
  complete_date,
  cast1,
  cast2,
  script_url,
  pr_text,
  notes,
  created_at,
  updated_at,
  pr_completed,
  pr_due_date,
  series_name,
  series_type
) VALUES 
('001', 'テスト番組1', '@日比谷公園', '放送済み', '2024-07-09', null, null, 'ゲスト1', 'ゲスト2', null, 'テスト用番組説明文です。', null, NOW(), NOW(), true, null, 'プラッと進捗すごろく', 'interview'),
('002', 'テスト番組2', '@大手町', '放送済み', '2024-07-23', null, null, 'ゲスト3', 'ゲスト4', null, 'テスト用番組説明文2です。', null, NOW(), NOW(), true, null, 'プラッと進捗すごろく', 'vtr');

-- Sample team dashboard data
INSERT INTO team_dashboard (
  widget_type,
  title,
  content,
  sort_order,
  is_active,
  created_by,
  updated_by
) VALUES 
('memo', 'テストメモ', '{"text": "これはテスト用のメモです"}', 1, true, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
('schedule', '今日の予定', '{"events": [{"time": "10:00", "title": "会議"}]}', 2, true, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');