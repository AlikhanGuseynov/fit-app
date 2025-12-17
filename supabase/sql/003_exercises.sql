create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  equipment text[] default '{}',
  muscle_groups text[] default '{}',
  description text,
  video_url text,
  created_at timestamptz default now()
);

alter table public.exercises enable row level security;

create policy if not exists "Allow read exercises to everyone"
  on public.exercises for select
  using (true);
