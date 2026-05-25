---
description: Secret handling rules — SOPS/age is mandatory for `infra/secrets/local.enc.yaml`, never commit `.env`/decrypted files, strictly isolate `SUPABASE_SERVICE_ROLE_KEY`.
globs:
  - "infra/secrets/**"
  - ".env*"
  - "supabase/functions/**/*.ts"
  - ".github/workflows/*.yml"
  - "infra/scripts/*.sh"
---

# Secrets — handling rules

## Scope

This repository hosts the **application code** (Astro + Svelte + Supabase
local stack). Remote deployment secrets (dev/prod) live in the
[`ade-arena-infra`](https://github.com/fcamblor/ade-arena-infra) repository.
The rules below apply to local-only secrets in this repository.

## Encrypted file `infra/secrets/local.enc.yaml`

- **Git-ignored** and **per-contributor**. Generate it via `mise run bootstrap-local`.
- **Always** encrypted with SOPS + age. Content must contain `ENC[AES256_GCM,...]` on every value.
- Edit only through `sops infra/secrets/local.enc.yaml` — **never** edit directly with a text editor.
- When in doubt, decrypt to inspect: `sops -d infra/secrets/local.enc.yaml` (never persist plaintext on disk).

> 🔒 **Automated guard**: a `delta-gate` `Stop`/`SubagentStop` hook (configured in
> `.claude/settings.json`) runs `.claude/scripts/check-secrets-encrypted.sh`
> against any `infra/secrets/*.enc.yaml` file modified during a Claude session.
> The hook fails if a value is not wrapped in `ENC[AES256_GCM,...]` or if the
> `sops:` metadata block is missing, regardless of whether you remembered this
> rule. **This automation covers property-style YAML files only** — for other
> file types where content layout is more variable (Edge Functions, scripts),
> the manual rules below still apply.

## Files banned from commits

- `.env`, `.env.local`, `.env.dev`, `.env.prod` (covered by `.gitignore`).
- `infra/secrets/*.dec.yaml`, `infra/secrets/*.plain.yaml`.
- `infra/secrets/local.enc.yaml` itself (git-ignored — encryption alone is not enough since
  every contributor uses their own age key).
- The age private key (`~/.config/sops/age/keys.txt`).

## Fail-hard on decryption

Scripts that decrypt (`infra/scripts/with-secrets.sh`) must **fail loud** if `sops -d` errors out. No silent `cat` fallback.

## `SUPABASE_SERVICE_ROLE_KEY` isolation

- **Never** in the Astro bundle (no reference under `src/`, no `PUBLIC_*` variable).
- **Never** in Cloudflare Pages env vars in deployed envs (those are inlined into the build, ending up in the bundle).
- Only exposed to Supabase Edge Functions (platform-injected automatically). In local dev, the key is
  the public Supabase-CLI default value documented at
  [supabase.com/docs/guides/cli/local-development](https://supabase.com/docs/guides/cli/local-development).

## Edge Functions

- To validate a user's identity, **always** create the client with `anonKey` + the `Authorization` header. RLS applies.
- For admin operations (deletion, cross-user reads), create a **second** client with `serviceRoleKey`, **after** identity validation.
- Do not mix both in the same client — it is an anti-pattern that bypasses RLS if the validation step is broken by a refactor.
