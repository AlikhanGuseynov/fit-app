create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  goal text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists workout_plans_user_idx on public.workout_plans (user_id, is_active);

alter table public.workout_plans enable row level security;

create policy if not exists "Users can view their workout plans"
  on public.workout_plans for select
  using (user_id = auth.uid());

create policy if not exists "Users can insert workout plans"
  on public.workout_plans for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update workout plans"
  on public.workout_plans for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "Users can delete workout plans"
  on public.workout_plans for delete
  using (user_id = auth.uid());
