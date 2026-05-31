-- Rename the `cloud-execution` feature to `remote-agent-execution`.
--
-- The feature was renamed in `src/data/features.ts` (label "Cloud execution"
-- -> "Remote agent execution"). Migrations are append-only
-- (see .claude/rules/sql-migrations-are-append-only.md): the original seed
-- migration (20260523000004_features_catalog.sql) is left untouched and still
-- seeds `cloud-execution`, so this migration carries the whole rename forward.
--
-- We perform a backward-compatible rename without ever dangling a foreign key:
--   1. insert the new catalog id (so the FK target exists)
--   2. re-point existing ratings + feature_skips rows to the new id
--   3. delete the now-unreferenced old catalog id
--
-- The FK constraints are `on delete restrict`, so step 3 can only succeed once
-- every referencing row has been migrated in step 2.
--
-- The catalog-sync hook replays the `delete from features_catalog` statement
-- below, so it treats `cloud-execution` as removed from the effective catalog
-- despite the original seed still listing it.

-- 1. Make sure the new catalog id exists.
insert into public.features_catalog (id) values
  ('remote-agent-execution')
on conflict (id) do nothing;

-- 2. Migrate every referencing row to the new id.
update public.ratings
  set feature_id = 'remote-agent-execution'
  where feature_id = 'cloud-execution';

update public.feature_skips
  set feature_id = 'remote-agent-execution'
  where feature_id = 'cloud-execution';

-- 3. Drop the old, now-unreferenced catalog id.
delete from public.features_catalog
  where id = 'cloud-execution';
