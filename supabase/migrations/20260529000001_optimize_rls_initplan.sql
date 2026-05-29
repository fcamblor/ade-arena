-- Optimize RLS policies: evaluate auth.uid() once per statement (InitPlan)
-- instead of once per scanned row.
--
-- A bare `auth.uid()` in a policy predicate is treated as row-dependent, so
-- Postgres re-evaluates it for every row. Wrapping it in a scalar subselect
-- `(select auth.uid())` lets the planner hoist it into an InitPlan, computed
-- once and then compared against each row. The predicate result is identical
-- in every case — this is a pure performance change.
--
-- Addresses the Supabase advisor "auth_rls_initplan" warnings on
-- public.ratings and public.feature_skips. Recreated here in a new migration
-- (rather than editing the historical ones) per the project's
-- never-edit-applied-migrations convention.

-- public.ratings
drop policy if exists "read own ratings" on public.ratings;
create policy "read own ratings"
on public.ratings
for select
using ((select auth.uid()) = user_id);

drop policy if exists "insert own ratings" on public.ratings;
create policy "insert own ratings"
on public.ratings
for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "update own ratings" on public.ratings;
create policy "update own ratings"
on public.ratings
for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "delete own ratings" on public.ratings;
create policy "delete own ratings"
on public.ratings
for delete
using ((select auth.uid()) = user_id);

-- public.feature_skips
drop policy if exists "read own skips" on public.feature_skips;
create policy "read own skips"
on public.feature_skips
for select
using ((select auth.uid()) = user_id);

drop policy if exists "insert own skips" on public.feature_skips;
create policy "insert own skips"
on public.feature_skips
for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "update own skips" on public.feature_skips;
create policy "update own skips"
on public.feature_skips
for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "delete own skips" on public.feature_skips;
create policy "delete own skips"
on public.feature_skips
for delete
using ((select auth.uid()) = user_id);
