create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  sets integer,
  reps integer,
  rest_seconds integer,
  notes text
);

create index if not exists workout_exercises_workout_idx on public.workout_exercises (workout_id);
create index if not exists workout_exercises_user_idx on public.workout_exercises (user_id);

alter table public.workout_exercises enable row level security;

create policy if not exists "Users can view their workout exercises"
  on public.workout_exercises for select
  using (user_id = auth.uid());

create policy if not exists "Users can insert workout exercises"
  on public.workout_exercises for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update workout exercises"
  on public.workout_exercises for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "Users can delete workout exercises"
  on public.workout_exercises for delete
  using (user_id = auth.uid());
