#!/usr/bin/env bash
# Ensures every Supabase migration carries a unique version prefix.
#
# Supabase derives a migration's version from the leading numeric token of
# its filename (e.g. `20260529000001` in
# `20260529000001_user_preferences.sql`) and uses it as the primary key of
# `supabase_migrations.schema_migrations`. Two files sharing the same prefix
# — a near-certainty when migrations land on parallel branches that both pick
# "today's" timestamp — collide at push time with:
#
#   ERROR: duplicate key value violates unique constraint
#          "schema_migrations_pkey" (SQLSTATE 23505)
#
# ...which only surfaces in CI against the remote DB, long after the merge.
# This hook turns that runtime failure into a deterministic, local check.
#
# Invoked from a delta-gate Stop / SubagentStop hook. Exit 0 means every
# version is unique; exit 2 means at least one prefix is duplicated.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
migrations_dir="$repo_root/supabase/migrations"

[[ -d "$migrations_dir" ]] || exit 0

shopt -s nullglob
migrations=("$migrations_dir"/*.sql)
shopt -u nullglob

(( ${#migrations[@]} == 0 )) && exit 0

# Extract the leading numeric version token of each filename, then look for
# any value that appears more than once.
versions=""
for path in "${migrations[@]}"; do
  file="$(basename "$path")"
  version="${file%%_*}"
  # Guard against unconventional names lacking a numeric prefix.
  if [[ ! "$version" =~ ^[0-9]+$ ]]; then
    echo "ERROR: migration '$file' has no numeric version prefix." >&2
    echo "       Expected '<version>_<description>.sql'." >&2
    exit 2
  fi
  versions+="$version"$'\n'
done

duplicates="$(printf '%s' "$versions" | sort | uniq -d)"

[[ -z "$duplicates" ]] && exit 0

echo "ERROR: duplicate Supabase migration version prefix(es) detected." >&2
echo >&2
echo "  Supabase uses the leading numeric token as the schema_migrations" >&2
echo "  primary key, so duplicates fail at push time with SQLSTATE 23505." >&2
echo >&2

while IFS= read -r dup; do
  [[ -z "$dup" ]] && continue
  echo "  Version '$dup' is shared by:" >&2
  for path in "${migrations[@]}"; do
    file="$(basename "$path")"
    [[ "${file%%_*}" == "$dup" ]] && echo "    - $file" >&2
  done
  echo >&2
done <<< "$duplicates"

echo "  Rename the most recently created file with a later unique version" >&2
echo "  (e.g. bump the trailing counter), keeping it ordered after its" >&2
echo "  predecessors, then re-run the deploy." >&2

exit 2
