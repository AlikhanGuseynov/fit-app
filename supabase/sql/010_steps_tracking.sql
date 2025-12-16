create table if not exists public.steps_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  steps integer default 0,
  distance_km numeric(8,2),
  calories_burned numeric(10,2),
  updated_at timestamptz default now()
);

create unique index if not exists steps_tracking_user_date_idx on public.steps_tracking (user_id, date);

alter table public.steps_tracking enable row level security;

create policy if not exists "Users can view their steps tracking"
  on public.steps_tracking for select
  using (user_id = auth.uid());

create policy if not exists "Users can upsert steps tracking"
  on public.steps_tracking for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update steps tracking"
  on public.steps_tracking for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
