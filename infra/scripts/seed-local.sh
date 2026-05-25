#!/usr/bin/env bash
# Applies `supabase/seed.local.sql` to the running local Supabase DB.
#
# `supabase/seed.local.sql` is intentionally not named `seed.sql`, so
# `supabase db reset` never auto-loads it. That keeps a trivially-known
# bcrypt password (`local-rater@example.test` / `password`) from sneaking
# into a remote project via a misconfigured `db reset --linked`.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
seed_file="$repo_root/supabase/seed.local.sql"

if [[ ! -f "$seed_file" ]]; then
  echo "Error: $seed_file not found." >&2
  exit 1
fi

container="supabase_db_ade-showdown"
if ! docker ps --format '{{.Names}}' | grep -qx "$container"; then
  echo "Error: container '$container' is not running." >&2
  echo "       Start the local Supabase stack first: \`supabase start\`." >&2
  exit 1
fi

# `app.environment=local` is the DB-level guard checked at the top of
# seed.local.sql. Without this, a stray `psql remote < seed.local.sql`
# would silently insert the well-known bcrypt password into prod.
exec docker exec -e PGPASSWORD=postgres -i "$container" \
  psql -h localhost -U postgres -d postgres -v ON_ERROR_STOP=1 \
       -c "set app.environment = 'local';" \
       -f - < "$seed_file"
