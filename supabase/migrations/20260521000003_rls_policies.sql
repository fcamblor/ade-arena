alter table public.ratings enable row level security;

drop policy if exists "read own ratings" on public.ratings;
create policy "read own ratings"
on public.ratings
for select
using (auth.uid() = user_id);

drop policy if exists "insert own ratings" on public.ratings;
create policy "insert own ratings"
on public.ratings
for insert
with check (auth.uid() = user_id);

drop policy if exists "update own ratings" on public.ratings;
create policy "update own ratings"
on public.ratings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "delete own ratings" on public.ratings;
create policy "delete own ratings"
on public.ratings
for delete
using (auth.uid() = user_id);

grant select, insert, update, delete on public.ratings to authenticated;
