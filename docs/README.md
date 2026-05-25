# Documentation — ADE Arena

This directory captures the structural choices behind the project and the reasoning that backs them.

## Architecture

- **Frontend**: Astro static + Svelte islands.
- **Backend**: Supabase (Postgres + Auth + Edge Functions on Deno).
- **Hosting**: Cloudflare Pages (static build).
- **IaC**: Terraform (Supabase provider + Cloudflare provider).
- **Secrets**: SOPS + age, files under `infra/secrets/<env>.enc.yaml`.

## Decisions (Architecture Decision Records)

Format: Michael Nygard (Status / Context / Decision / Consequences). Numbered sequentially, immutable once accepted (create a new ADR that supersedes them).

| # | Title | Status |
|---|---|---|
| [001](decisions/001-supabase-localstorage-jwt.md) | JWT in localStorage rather than HttpOnly cookies | Accepted |
| [002](decisions/002-cors-edge-functions-permissive.md) | Wildcard CORS on Edge Functions while we stay on localStorage | Accepted |
| [003](decisions/003-protection-public-views-cost.md) | Protecting public views against wallet-DoS | Accepted |
| [004](decisions/004-audit-log-rgpd.md) | Audit log for account deletion and GDPR compliance | Accepted |
| [005](decisions/005-pinning-versions-sha.md) | Pin versions by SHA | Accepted |

## Contribution conventions

- Every external version must be pinned by SHA — see [`.claude/rules/pin-versions-by-sha.md`](../.claude/rules/pin-versions-by-sha.md).
- Every secret handling step goes through SOPS — see [`.claude/rules/secrets-and-encryption.md`](../.claude/rules/secrets-and-encryption.md).
- English is the default language for everything that ends up in the repo — see [`.claude/rules/use-english-everywhere.md`](../.claude/rules/use-english-everywhere.md).
- For a new structural decision, create `docs/decisions/NNN-title.md` from the template below.

## ADR template

```markdown
# ADR NNN — Short title

- **Status**: Proposed / Accepted / Deprecated / Superseded by ADR-XXX
- **Date**: YYYY-MM-DD
- **Deciders**: ...

## Context

Which problem we are solving. Which constraints (technical, business, team, cost) apply.

## Options considered

List the real alternatives, not strawmen.

## Decision

The chosen option, in a single sentence.

## Consequences

- ✅ Expected benefits
- ⚠️ Trade-offs we accept
- 🔄 Re-evaluation conditions (when this ADR should be revisited)
```
