-- Monsters' Club database schema
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

create extension if not exists "uuid-ossp";

-- Profiles (one row per logged-in user, linked to Supabase auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#4C8DF6',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Habits (each belongs to one profile)
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  icon text not null default 'ti-target',
  color_idx int not null default 0,
  freq text not null default 'daily',
  created_at timestamptz not null default now()
);

-- Habit logs (one row per completed day)
create table public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- Everyone signed in can see all profiles (needed for leaderboard + people list)
create policy "profiles are viewable by all signed in users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- A user can only edit their own profile name/color (not is_admin)
create policy "users can update their own profile basics"
  on public.profiles for update
  using (auth.uid() = id);

-- A user can insert their own profile row on first login
create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Only admins can delete profiles (remove members)
create policy "admins can delete any profile"
  on public.profiles for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Everyone signed in can see all habits (needed for leaderboard scoring)
create policy "habits are viewable by all signed in users"
  on public.habits for select
  using (auth.role() = 'authenticated');

-- A user can only manage their own habits
create policy "users manage their own habits"
  on public.habits for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Everyone signed in can see all logs (needed for leaderboard scoring)
create policy "logs are viewable by all signed in users"
  on public.habit_logs for select
  using (auth.role() = 'authenticated');

-- A user can only manage their own logs
create policy "users manage their own logs"
  on public.habit_logs for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Admins can update is_admin on other profiles (promote/demote) -- optional, run separately if wanted:
-- create policy "admins can update any profile"
--   on public.profiles for update
--   using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
