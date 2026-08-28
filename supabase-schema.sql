-- Run this once in your Supabase project's SQL editor (Supabase Dashboard -> SQL Editor -> New query).
-- It creates one table that stores each signed-in user's data (company profile,
-- clients, quotations, rate library) and locks it down so a user can only ever
-- read or write their own rows. This is what makes per-account data isolation real
-- (unlike the earlier Claude-artifact version, which only trusted the typed name).

create table if not exists public.user_data (
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_data enable row level security;

create policy "Users can read their own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own data"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own data"
  on public.user_data for delete
  using (auth.uid() = user_id);

-- Optional but recommended: keep updated_at fresh automatically.
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_data_touch on public.user_data;
create trigger user_data_touch
  before update on public.user_data
  for each row execute procedure public.touch_updated_at();
