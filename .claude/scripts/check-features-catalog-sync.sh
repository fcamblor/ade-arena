#!/usr/bin/env bash
# Ensures the catalog of valid feature IDs stays in lockstep between
# `src/data/features.ts` (application code) and the union of
# `supabase/migrations/*_features_catalog*.sql` migration files
# (database state).
#
# Without this hook, a contributor could add a new feature ID to
# `features.ts` and ship it without a corresponding catalog-sync
# migration, which would silently mean: ratings for the new feature
# fail at the FK boundary in prod even though local dev (where the
# seed-local script may have its own list) works.
#
# Invoked from a delta-gate Stop / SubagentStop hook. Exit 0 means the
# two lists match; exit 2 means a sync migration is missing.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
features_ts="$repo_root/src/data/features.ts"
migrations_glob="$repo_root/supabase/migrations/*features_catalog*.sql"

[[ -f "$features_ts" ]] || exit 0

# IDs declared in features.ts: lines like "    id: 'foo-bar'," (the
# leading indentation pins it to top-level feature objects, ignoring any
# nested `id:` keys deeper in the file).
ts_ids=$(grep -oE "^    id: '[^']+'" "$features_ts" \
  | sed "s/^    id: '//;s/'$//" \
  | sort -u)

# IDs declared across every catalog-sync migration. `grep -h` strips
# filenames so the output is just the literal IDs.
shopt -s nullglob
catalog_files=("$repo_root"/supabase/migrations/*features_catalog*.sql)
shopt -u nullglob

if (( ${#catalog_files[@]} == 0 )); then
  echo "ERROR: no features_catalog migration found in supabase/migrations." >&2
  echo "       Create one before continuing — see 20260523000004_features_catalog.sql." >&2
  exit 2
fi

sql_ids=$(grep -hoE "'[a-z][a-z0-9-]*'" "${catalog_files[@]}" \
  | tr -d "'" \
  | sort -u)

missing_in_sql=$(comm -23 <(echo "$ts_ids") <(echo "$sql_ids"))
missing_in_ts=$(comm -13 <(echo "$ts_ids") <(echo "$sql_ids"))

if [[ -z "$missing_in_sql" && -z "$missing_in_ts" ]]; then
  exit 0
fi

echo "ERROR: features.ts and supabase/migrations/*features_catalog*.sql are out of sync." >&2
echo >&2

if [[ -n "$missing_in_sql" ]]; then
  echo "  Feature IDs present in features.ts but missing from any catalog migration:" >&2
  echo "$missing_in_sql" | sed 's/^/    - /' >&2
  echo >&2
  echo "  Add a new migration that inserts them, e.g.:" >&2
  echo "    create or replace ... (or:)" >&2
  echo "    insert into public.features_catalog (id) values" >&2
  echo "      ('new-feature-id')" >&2
  echo "    on conflict (id) do nothing;" >&2
  echo >&2
fi

if [[ -n "$missing_in_ts" ]]; then
  echo "  Feature IDs present in catalog migrations but missing from features.ts:" >&2
  echo "$missing_in_ts" | sed 's/^/    - /' >&2
  echo >&2
  echo "  Either restore them in features.ts, or write a migration that:" >&2
  echo "    1. Migrates/cleans up any ratings + feature_skips rows for these IDs." >&2
  echo "    2. Deletes them from features_catalog." >&2
  echo "  The FK constraint is \`on delete restrict\`, so step 1 must run first." >&2
  echo >&2
fi

exit 2
