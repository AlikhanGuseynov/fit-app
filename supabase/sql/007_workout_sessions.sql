create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_id uuid references public.workouts (id) on delete set null,
  start_time timestamptz default now(),
  end_time timestamptz,
  duration_seconds integer,
  completed boolean default false,
  calories_burned numeric(10,2),
  created_at timestamptz default now()
);

create index if not exists workout_sessions_user_idx on public.workout_sessions (user_id, start_time desc);

alter table public.workout_sessions enable row level security;

create policy if not exists "Users can view their workout sessions"
  on public.workout_sessions for select
  using (user_id = auth.uid());

create policy if not exists "Users can insert workout sessions"
  on public.workout_sessions for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update workout sessions"
  on public.workout_sessions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "Users can delete workout sessions"
  on public.workout_sessions for delete
  using (user_id = auth.uid());
