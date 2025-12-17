create table if not exists public.water_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  total_ml integer default 0,
  goal_ml integer default 2000,
  updated_at timestamptz default now()
);

create unique index if not exists water_tracking_user_date_idx on public.water_tracking (user_id, date);

alter table public.water_tracking enable row level security;

create policy if not exists "Users can view their water tracking"
  on public.water_tracking for select
  using (user_id = auth.uid());

create policy if not exists "Users can upsert water tracking"
  on public.water_tracking for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update water tracking"
  on public.water_tracking for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
