create table if not exists public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid references public.exercises (id),
  set_number integer,
  reps_completed integer,
  weight_kg numeric(6,2),
  completed boolean default false,
  created_at timestamptz default now()
);

create index if not exists session_exercises_session_idx on public.session_exercises (session_id);
create index if not exists session_exercises_user_idx on public.session_exercises (user_id);

alter table public.session_exercises enable row level security;

create policy if not exists "Users can view their session exercises"
  on public.session_exercises for select
  using (user_id = auth.uid());

create policy if not exists "Users can insert session exercises"
  on public.session_exercises for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update session exercises"
  on public.session_exercises for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "Users can delete session exercises"
  on public.session_exercises for delete
  using (user_id = auth.uid());
