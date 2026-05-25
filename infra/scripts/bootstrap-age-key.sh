#!/usr/bin/env bash
set -euo pipefail

key_dir="${SOPS_AGE_KEY_DIR:-$HOME/.config/sops/age}"
key_file="$key_dir/keys.txt"

if ! command -v age-keygen >/dev/null 2>&1; then
  echo "age-keygen is required. Install age first." >&2
  exit 1
fi

mkdir -p "$key_dir"
chmod 700 "$key_dir"

if [[ ! -f "$key_file" ]]; then
  age-keygen -o "$key_file"
  chmod 600 "$key_file"
  if command -v security >/dev/null 2>&1; then
    if ! security add-generic-password -a "$USER" -s ade-arena-sops-age-key -w "$(cat "$key_file")" -U >/dev/null 2>&1; then
      echo "warning: failed to store age key in macOS Keychain (file at $key_file is still usable)." >&2
    fi
  fi
fi

age-keygen -y "$key_file"
