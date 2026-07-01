-- Monsters' Club schema migration v2
-- Run once in Supabase SQL Editor (Dashboard → SQL Editor → New query → Run)
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS

-- Challenge settings (singleton)
create table if not exists public.challenge_settings (
  id int primary key default 1 check (id = 1),
  start_date date not null default current_date,
  duration_days int not null default 75,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.challenge_settings (id, start_date, duration_days)
values (1, current_date, 75)
on conflict (id) do nothing;

alter table public.challenge_settings enable row level security;

drop policy if exists "challenge readable by authenticated" on public.challenge_settings;
create policy "challenge readable by authenticated"
  on public.challenge_settings for select
  using (auth.role() = 'authenticated');

drop policy if exists "admins can update challenge" on public.challenge_settings;
create policy "admins can update challenge"
  on public.challenge_settings for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

drop policy if exists "admins can insert challenge" on public.challenge_settings;
create policy "admins can insert challenge"
  on public.challenge_settings for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Extend habits
alter table public.habits
  add column if not exists habit_type text not null default 'custom',
  add column if not exists goal_mode text not null default 'binary',
  add column if not exists goal_target numeric not null default 1,
  add column if not exists goal_unit text not null default '',
  add column if not exists sort_order int not null default 0,
  add column if not exists is_preset boolean not null default false;

-- Extend habit_logs
alter table public.habit_logs
  add column if not exists value numeric not null default 0,
  add column if not exists completed boolean not null default false,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Backfill legacy logs (rows that existed before v2 columns)
update public.habit_logs
set value = 1, completed = true
where value = 0 and completed = false;

-- Journal entries (private)
create table if not exists public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  content text not null default '',
  mood int check (mood between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

alter table public.journal_entries enable row level security;

drop policy if exists "owners read own journal" on public.journal_entries;
create policy "owners read own journal"
  on public.journal_entries for select
  using (auth.uid() = owner_id);

drop policy if exists "owners insert own journal" on public.journal_entries;
create policy "owners insert own journal"
  on public.journal_entries for insert
  with check (auth.uid() = owner_id);

drop policy if exists "owners update own journal" on public.journal_entries;
create policy "owners update own journal"
  on public.journal_entries for update
  using (auth.uid() = owner_id);

drop policy if exists "owners delete own journal" on public.journal_entries;
create policy "owners delete own journal"
  on public.journal_entries for delete
  using (auth.uid() = owner_id);

-- Reload PostgREST schema cache (fixes 404 right after migration)
notify pgrst, 'reload schema';
