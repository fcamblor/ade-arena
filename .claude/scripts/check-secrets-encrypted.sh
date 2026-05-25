#!/usr/bin/env bash
# Verifies that every `infra/secrets/*.enc.yaml` file passed as argument is
# SOPS-encrypted (and not plaintext). Intended to be invoked from a delta-gate
# Claude Code Stop hook — see `.claude/settings.json`.
#
# Pass each file as a separate positional argument. Files outside
# `infra/secrets/*.enc.yaml` and non-existent files (deletions) are skipped.
#
# Exit codes:
#   0 — every checked file is properly SOPS-encrypted (or none to check).
#   2 — at least one file looks like plaintext (missing `sops:` metadata
#       block or contains any scalar leaf — at any nesting depth — that is
#       not wrapped in `ENC[AES256_GCM,...]`).
set -euo pipefail

# yq is pinned in mise.toml. If a contributor runs the hook outside a
# mise-activated shell we self-activate so the right yq is on PATH.
if ! command -v yq >/dev/null 2>&1; then
  if command -v mise >/dev/null 2>&1; then
    eval "$(mise activate bash --shims 2>/dev/null)" || true
  fi
fi
if ! command -v yq >/dev/null 2>&1; then
  echo "ERROR: yq not found on PATH. Activate mise (\`mise install\`) before re-running." >&2
  exit 2
fi

failed=0

for file in "$@"; do
  [[ -z "$file" ]] && continue
  [[ ! -f "$file" ]] && continue

  case "$file" in
    infra/secrets/*.enc.yaml) ;;
    */infra/secrets/*.enc.yaml) ;;
    *) continue ;;
  esac

  issues=""

  if ! grep -q '^sops:' "$file"; then
    issues+=$'\n  - missing `sops:` metadata block (file is not SOPS-encrypted)'
  fi

  # Walk every scalar leaf in the document except those under the `sops:`
  # block (which legitimately holds plaintext metadata like age recipients
  # and AES nonces). Anything else must be a SOPS ciphertext.
  #
  # mikefarah/yq `.. | select(tag != "!!map" and tag != "!!seq")` yields
  # every scalar in the tree at any nesting depth — closing the previous
  # hole where the awk parser only inspected top-level lines.
  if ! bad_leaves=$(yq 'del(.sops) | .. | select(tag != "!!map" and tag != "!!seq") | (path | join(".")) + "=" + (. | tostring)' "$file" 2>&1); then
    issues+=$'\n  - yq could not parse the file (invalid YAML?)'
    bad_leaves=""
  fi

  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    path="${line%%=*}"
    value="${line#*=}"
    if [[ "$value" != ENC\[AES256_GCM,* ]]; then
      issues+=$'\n'"  - $path = plaintext (\"$value\")"
    fi
  done <<< "$bad_leaves"

  if [[ -n "$issues" ]]; then
    echo "ERROR: $file is not properly SOPS-encrypted:" >&2
    echo "$issues" >&2
    echo >&2
    failed=1
  fi
done

if [[ "$failed" -eq 1 ]]; then
  cat >&2 <<'EOF'
One or more secret files appear to be plaintext. Re-encrypt them with:
    sops -e -i infra/secrets/<env>.enc.yaml
or edit them through `sops infra/secrets/<env>.enc.yaml` (never with a plain
text editor). See `.claude/rules/secrets-and-encryption.md` for details.
EOF
  exit 2
fi

exit 0
