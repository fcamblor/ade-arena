# ade-showdown — local dev environment

This directory holds the local-only infra wiring.  
**Remote environments (dev/prod) live in some private repository** elsewhere.

## Quickstart

```bash
mise install              # installs age, sops, supabase, node, pnpm pinned in mise.toml
mise run bootstrap-local  # generates age key + infra/secrets/local.enc.yaml
supabase start            # boots the local Supabase stack
supabase db reset         # applies migrations
mise run seed-local       # (optional) load supabase/seed.local.sql
./infra/scripts/with-secrets.sh local pnpm dev
```

`seed-local` is optional and local-only. It seeds a `local-rater@example.test`
account so the UI has something to show without going through GitHub OAuth.
The file is named `seed.local.sql` (not `seed.sql`) precisely so
`supabase db reset` never auto-loads it — keeping its trivially-known
bcrypt password out of any remote project, even on a misclicked
`db reset --linked`.

The bootstrap step is **idempotent** — re-running it is safe and only fills
in missing pieces.

## GitHub OAuth (local)

The local Supabase stack uses GitHub OAuth. Create a dev OAuth App at
<https://github.com/settings/developers> with:

- Homepage URL: `http://localhost:4321`
- Authorization callback URL: `http://127.0.0.1:54321/auth/v1/callback`

`mise run bootstrap-local` prompts for the Client ID and Secret. You can
re-edit them later with:

```bash
sops infra/secrets/local.enc.yaml
```

## Secrets

`infra/secrets/local.enc.yaml` is **git-ignored** and **per-contributor**.
It is encrypted with SOPS + age. Every contributor regenerates their own
file with their own age key — no key sharing.

`.sops.yaml` is also **git-ignored**: each contributor gets their own,
generated from [`.sops.yaml.example`](../.sops.yaml.example) by
`mise run bootstrap-local`, pointing at *their* age public key. There is
no shared encrypted file in this repository, so there is no shared
recipient.

If `sops` does not discover your age key automatically:

```bash
export SOPS_AGE_KEY_FILE="$HOME/.config/sops/age/keys.txt"
```

## Releasing

A release is **just a git tag** (`vX.Y.Z`).  
Some external tool will fetch the sources at that tag and builds the frontend per-env with
environment-specific `PUBLIC_*` variables, so dev and prod each get a build
matching their own Supabase project.
