#!/usr/bin/env bash
set -euo pipefail

# Ensure mise-managed tools (sops, yq) are on PATH. This script is
# invoked from contexts that may not have mise activated (Conductor
# non-login shells, .claude/launch.json, CI runners). If mise itself is
# available, activate its shims so the binaries it manages resolve.
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate bash --shims 2>/dev/null)" || true
fi

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 local <command> [args...]" >&2
  exit 2
fi

env_name="$1"
shift

if [[ "$env_name" != "local" ]]; then
  echo "Error: only the 'local' environment is supported in this repository." >&2
  echo "       Remote environments (dev/prod) live in another (private) repository config." >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
secret_file="$repo_root/infra/secrets/${env_name}.enc.yaml"
default_age_key_file="${SOPS_AGE_KEY_FILE:-$HOME/.config/sops/age/keys.txt}"

if [[ -z "${SOPS_AGE_KEY_FILE:-}" && -f "$default_age_key_file" ]]; then
  export SOPS_AGE_KEY_FILE="$default_age_key_file"
fi

if [[ ! -f "$secret_file" ]]; then
  echo "Missing secret file: $secret_file" >&2
  echo "Run \`mise run bootstrap-local\` to generate it." >&2
  exit 1
fi

for tool in sops yq; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Error: '$tool' is required to decrypt $secret_file." >&2
    echo "       Install it via \`mise install\`." >&2
    exit 1
  fi
done

if ! secret_payload="$(sops -d "$secret_file")"; then
  echo "Error: failed to decrypt $secret_file with sops." >&2
  echo "       Check that your age private key is available at \$SOPS_AGE_KEY_FILE." >&2
  exit 1
fi

# Parse the decrypted YAML with yq. The previous awk-based parser only
# handled flat `KEY: value` pairs and would silently mangle quoted
# strings, multi-line block scalars, or `---` document separators. yq's
# `-o=props` output is shell-friendly `KEY = value` text on one line per
# top-level scalar — robust to YAML's surface variations.
while IFS='=' read -r key value; do
  key="${key// /}"
  value="${value# }"
  if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    export "$key=$value"
  fi
done < <(printf '%s\n' "$secret_payload" | yq -o=props)

exec "$@"
