-- Per-user rating preferences collected at the start of the rating tunnel.
--
-- These are NOT feature ratings: they are global preferences that shape how
-- the personal leaderboard is computed.
--   * daily_os: the OS the user works on every day. Tools that do not support
--     ALL of them are excluded from the user's personal ranking (a "web" tool
--     is treated as compatible with every OS — handled client-side).
--   * opensource_importance: a 1-5 weight applied to a synthetic "open-source
--     codebase" criterion in the personal score.
--   * willing_to_pay: a side metric (yes=true / no=false). It does NOT affect
--     any tool score; it is only counted and surfaced through the GDPR export.
--
-- One row per user (primary key is user_id), upserted on conflict. RLS mirrors
-- the `ratings`/`feature_skips` tables: each user can only read/write their own
-- row. Deletion cascades with the auth.users row, so delete_my_account() cleans
-- it up automatically.
create table if not exists public.user_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_os text[] not null default '{}'::text[],
  opensource_importance smallint check (opensource_importance between 1 and 5),
  willing_to_pay boolean,
  updated_at timestamptz not null default now(),
  primary key (user_id),
  constraint user_preferences_daily_os_allowed
    check (daily_os <@ array['linux', 'mac', 'windows']::text[])
);

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

drop policy if exists "read own preferences" on public.user_preferences;
create policy "read own preferences"
on public.user_preferences
for select
using (auth.uid() = user_id);

drop policy if exists "insert own preferences" on public.user_preferences;
create policy "insert own preferences"
on public.user_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "update own preferences" on public.user_preferences;
create policy "update own preferences"
on public.user_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "delete own preferences" on public.user_preferences;
create policy "delete own preferences"
on public.user_preferences
for delete
using (auth.uid() = user_id);

grant select, insert, update, delete on public.user_preferences to authenticated;
