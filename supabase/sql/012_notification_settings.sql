create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  push_enabled boolean default true,
  email_enabled boolean default false,
  reminders_enabled boolean default true,
  quiet_hours_start text,
  quiet_hours_end text,
  preferred_times jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

create unique index if not exists notification_settings_user_idx on public.notification_settings (user_id);

alter table public.notification_settings enable row level security;

create policy if not exists "Users can view their notification settings"
  on public.notification_settings for select
  using (user_id = auth.uid());

create policy if not exists "Users can insert notification settings"
  on public.notification_settings for insert
  with check (user_id = auth.uid());

create policy if not exists "Users can update notification settings"
  on public.notification_settings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
