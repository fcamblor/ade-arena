#!/usr/bin/env bash
# Bootstrap script for the local development environment.
#
# Idempotent:
# - Generates an age key under ~/.config/sops/age/keys.txt if missing.
# - Writes .sops.yaml (git-ignored) with the contributor's public recipient.
#   Only rewrites if the on-disk recipient differs.
# - Creates infra/secrets/local.enc.yaml encrypted with sops if missing.
#   The file is intentionally git-ignored — every contributor regenerates
#   their own with their own age key.
#
# Required tools (provided via mise): age, sops.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
secret_file="$repo_root/infra/secrets/local.enc.yaml"
sops_config="$repo_root/.sops.yaml"
key_dir="${SOPS_AGE_KEY_DIR:-$HOME/.config/sops/age}"
key_file="$key_dir/keys.txt"

for tool in age-keygen sops; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Error: '$tool' is required. Run \`mise install\` first." >&2
    exit 1
  fi
done

# 1. Ensure age key exists.
"$repo_root/infra/scripts/bootstrap-age-key.sh" >/dev/null
public_recipient="$(age-keygen -y "$key_file")"
echo "age recipient: $public_recipient"

# 2. Sync .sops.yaml with the public recipient. The file is git-ignored
#    and per-contributor, so we own it freely. Only rewrite if the on-disk
#    content does not already point at the same recipient.
desired_sops_config=$(cat <<EOF
creation_rules:
  - path_regex: '(\./)?infra/secrets/.*\.enc\.yaml\$'
    age: $public_recipient
EOF
)
if [[ -f "$sops_config" ]] && [[ "$(cat "$sops_config")" == "$desired_sops_config" ]]; then
  echo "$sops_config already up to date"
else
  printf '%s\n' "$desired_sops_config" > "$sops_config"
  echo "wrote $sops_config"
fi

# 3. Create local.enc.yaml if missing. Pre-fill known Supabase local-stack
#    constants so contributors only have to supply their GitHub OAuth pair.
if [[ -f "$secret_file" ]]; then
  echo "$secret_file already exists — skipping creation."
  exit 0
fi

# These values are the public defaults for a freshly-started \`supabase start\`
# stack: anon and service-role JWTs signed with the default JWT secret. They
# are documented at https://supabase.com/docs/guides/cli/local-development.
local_anon_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
local_service_role_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

echo
echo "We'll create $secret_file. Supabase local-stack keys are pre-filled."
echo "You need a GitHub OAuth App with callback URL:"
echo "  http://127.0.0.1:54321/auth/v1/callback"
echo "Create one at https://github.com/settings/developers, then paste below."
echo "(Press Enter to leave a value as 'replace-me' and edit later with \`sops $secret_file\`.)"
echo

read -r -p "GitHub OAuth Client ID: " github_client_id
github_client_id="${github_client_id:-replace-me}"
read -r -s -p "GitHub OAuth Client Secret: " github_client_secret
echo
github_client_secret="${github_client_secret:-replace-me}"

mkdir -p "$(dirname "$secret_file")"

tmp_plain="$(mktemp)"
trap 'rm -f "$tmp_plain"' EXIT

cat > "$tmp_plain" <<EOF
# Local development secrets. Git-ignored; regenerated per-contributor.
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID: $github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET: $github_client_secret
PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY: $local_anon_key
SUPABASE_SERVICE_ROLE_KEY: $local_service_role_key
EOF

sops --config "$sops_config" \
  --encrypt \
  --filename-override "$secret_file" \
  --input-type yaml --output-type yaml \
  "$tmp_plain" > "$secret_file"
echo "wrote $secret_file (encrypted)"
echo
echo "Edit later with: sops $secret_file"
