create table if not exists public.users_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade unique,
  full_name text,
  age integer,
  gender text check (gender in ('male', 'female', 'other')),
  height_cm numeric(6,2),
  weight_kg numeric(6,2),
  goal text check (goal in ('lose_weight', 'maintain', 'gain_muscle')),
  activity_level text check (activity_level in ('low', 'moderate', 'high')),
  fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  workouts_per_week integer,
  equipment text[] default '{}',
  onboarding_completed boolean default false,
  bmr numeric(10,2),
  tdee numeric(10,2),
  target_calories numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists users_profiles_user_id_idx on public.users_profiles (user_id);

alter table public.users_profiles enable row level security;

create policy if not exists "Users can view their profile"
  on public.users_profiles for select
  using (user_id = auth.uid());

create policy if not exists "Users can insert their profile"
  on public.users_profiles for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update their profile"
  on public.users_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
