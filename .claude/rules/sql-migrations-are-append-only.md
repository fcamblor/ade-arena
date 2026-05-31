---
description: SQL migration files under supabase/migrations are append-only. Never edit, rename, reorder or delete a committed migration — ship a new one instead.
globs:
  - "supabase/migrations/*.sql"
---

# SQL migrations are append-only

Every file under `supabase/migrations/*.sql` is an **immutable, ordered ledger
entry**. Once a migration has been committed (and therefore potentially applied
to a local, dev or prod database), its content, filename and ordering are
frozen.

## Never do this

- **Edit** the SQL of an already-committed migration (add/remove/reword
  statements, fix a typo in a seeded value, re-sort an `insert ... values`
  list, …).
- **Rename** a committed migration file (the timestamp prefix defines apply
  order and is recorded in the database migration history).
- **Delete** or reorder a committed migration.

A database that already ran the old version of the file will **not** re-run it,
so any edit silently diverges fresh databases (which see the new content) from
existing ones (which kept the old) — the exact class of bug migrations exist to
prevent.

> A file you created in the current, not-yet-committed session is fair game to
> edit or rename — it only becomes frozen once it lands in `git`.

## Do this instead — ship a new migration

Express the change as a **new** migration with a later timestamp that
transforms the existing state forward. Make it idempotent so it is a harmless
no-op on a fresh database that never had the old state.

### Renaming / removing a seeded value (e.g. a `features_catalog` id)

Do it as a backward-compatible, FK-safe sequence in a new migration — **never**
by editing the original seed:

1. `insert` the new value (so any `on delete restrict` FK target exists).
2. `update` every referencing table to re-point its foreign keys.
3. `delete` the now-unreferenced old value.

See `supabase/migrations/20260531000002_features_catalog_rename_cloud_execution.sql`
for a worked example.

## Why the catalog-sync hook tolerates this

`.claude/scripts/check-features-catalog-sync.sh` compares `src/data/features.ts`
against the **effective** catalog state — every id inserted across the
`*features_catalog*.sql` migrations **minus** every id later removed by a
`delete from features_catalog` statement. That is what lets a rename live in a
new migration while the original seed stays untouched: do not "fix" a removed id
by editing the seed to make the hook pass.
