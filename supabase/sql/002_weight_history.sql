create table if not exists public.weight_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at date not null default current_date,
  weight_kg numeric(6,2) not null,
  note text,
  created_at timestamptz default now()
);

create index if not exists weight_history_user_date_idx on public.weight_history (user_id, recorded_at desc);

alter table public.weight_history enable row level security;

create policy if not exists "Users can view their weight history"
  on public.weight_history for select
  using (user_id = auth.uid());

create policy if not exists "Users can insert weight history"
  on public.weight_history for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update weight history"
  on public.weight_history for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "Users can delete weight history"
  on public.weight_history for delete
  using (user_id = auth.uid());
