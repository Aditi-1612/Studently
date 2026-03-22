-- Supabase initialization script for Member 2

create table topics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  name text,
  subject text,
  interval_days int default 1,
  next_revision timestamptz default now(),
  last_studied timestamptz
);

create table study_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  exam_name text,
  exam_date date,
  plan_json jsonb,
  created_at timestamptz default now()
);

create table user_xp (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  xp_points int default 0,
  streak_days int default 0,
  last_active timestamptz
);
