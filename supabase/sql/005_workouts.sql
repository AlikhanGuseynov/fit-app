create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid references public.workout_plans (id) on delete cascade,
  name text not null,
  day_index integer,
  focus text,
  created_at timestamptz default now()
);

create index if not exists workouts_plan_idx on public.workouts (plan_id);
create index if not exists workouts_user_idx on public.workouts (user_id);

alter table public.workouts enable row level security;

create policy if not exists "Users can view their workouts"
  on public.workouts for select
  using (user_id = auth.uid());

create policy if not exists "Users can insert workouts"
  on public.workouts for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update workouts"
  on public.workouts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "Users can delete workouts"
  on public.workouts for delete
  using (user_id = auth.uid());
