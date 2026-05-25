create table if not exists public.feature_skips (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature_id text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, feature_id)
);

create index if not exists feature_skips_feature_idx on public.feature_skips(feature_id);

drop trigger if exists feature_skips_set_updated_at on public.feature_skips;
create trigger feature_skips_set_updated_at
before update on public.feature_skips
for each row
execute function public.set_updated_at();

alter table public.feature_skips enable row level security;

drop policy if exists "read own skips" on public.feature_skips;
create policy "read own skips"
on public.feature_skips
for select
using (auth.uid() = user_id);

drop policy if exists "insert own skips" on public.feature_skips;
create policy "insert own skips"
on public.feature_skips
for insert
with check (auth.uid() = user_id);

drop policy if exists "update own skips" on public.feature_skips;
create policy "update own skips"
on public.feature_skips
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "delete own skips" on public.feature_skips;
create policy "delete own skips"
on public.feature_skips
for delete
using (auth.uid() = user_id);

grant select, insert, update, delete on public.feature_skips to authenticated;
