create table if not exists public.calories_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  meals jsonb default '[]'::jsonb,
  total_calories integer default 0,
  calories_burned integer default 0,
  updated_at timestamptz default now()
);

create unique index if not exists calories_tracking_user_date_idx on public.calories_tracking (user_id, date);

alter table public.calories_tracking enable row level security;

create policy if not exists "Users can view their calories tracking"
  on public.calories_tracking for select
  using (user_id = auth.uid());

create policy if not exists "Users can upsert calories tracking"
  on public.calories_tracking for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update calories tracking"
  on public.calories_tracking for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
