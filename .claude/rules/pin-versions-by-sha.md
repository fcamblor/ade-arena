---
description: Every external tool version and GitHub Action reference in the repo must be pinned by SHA (with the tag in a trailing comment), never by a floating tag nor `latest`.
globs:
  - "mise.toml"
  - ".github/workflows/*.yml"
  - ".github/workflows/*.yaml"
  - ".github/actions/**/action.yml"
---

# Pin versions by SHA

Every external tool version and GitHub Action reference in the repo **must be pinned by SHA**, never by a floating tag nor `latest`.

## GitHub Actions

Expected format:
```yaml
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

- The SHA is mandatory (immutable reference, immune to a compromised tag).
- The matching tag is mandatory as a trailing comment (readability + signal for Dependabot).
- **No `@main`, no `@v4` alone, no `@latest`.**

To resolve a SHA:
```bash
gh api repos/<owner>/<repo>/git/refs/tags/<tag> --jq '.object.sha'
```

## Tools via `mise.toml`

Expected format:
```toml
[tools]
age = "1.2.1"
sops = "3.9.4"
terraform = "1.10.3"
node = "22.21.1"
pnpm = "10.17.0"
```

- Exact version (no `latest`, no `^1.0` ranges).
- Bumps go through an explicit PR, with verified release notes.

For tools not versioned via the `mise` registry (e.g. `github:supabase/cli`), keep the explicit tag (`2.101.0`) — it is the most reproducible form `mise` supports today.

## Node dependencies (`package.json`)

`package.json` may use `^` on application dependencies, but:
- `pnpm-lock.yaml` must be committed.
- Every CI action must use `pnpm install --frozen-lockfile`.

## When you modify CI/infra

If you add or bump an action or a tool, **resolve the SHA at commit time**. If you do not have the SHA at hand, ask the user — do not leave a floating tag as a placeholder.
