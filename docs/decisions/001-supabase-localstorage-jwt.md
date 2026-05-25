# ADR 001 — JWT in localStorage rather than HttpOnly cookies

- **Status**: Accepted
- **Date**: 2026-05-22
- **Deciders**: @fcamblor

## Context

The site is served as **Astro static** from Cloudflare Pages. Authentication uses Supabase Auth + GitHub OAuth. By default the Supabase SDK persists the JWT in `localStorage` (`src/lib/supabase.ts:73-78`, `persistSession: true`).

The well-known localStorage risk: if an XSS is exploited on the domain, the attacker can read the JWT and impersonate the user until the token expires (1 hour by default, `supabase/config.toml:22`).

The theoretical alternative — `HttpOnly` cookies — is not accessible to JavaScript and therefore immune to XSS exfiltration. **However**, an `HttpOnly` cookie must be set by a server-side `Set-Cookie` header. Astro static has no server.

## Options considered

1. **Stay on localStorage + strict CSP**: zero refactor, we harden the XSS defense upstream through Content-Security-Policy.
2. **Switch Astro to hybrid mode** (`output: 'server'` + `@astrojs/cloudflare`): add a server endpoint `/auth/callback` that exchanges the OAuth code and sets an `HttpOnly` cookie. Auth-flow refactor, 1–2 days of work. Pulls in Cloudflare Pages Functions (included, 100k invocations/day free tier).
3. **Use Supabase Edge Functions as an auth proxy**: technically possible but cross-domain cookies (`*.supabase.co` ≠ our domain) prevent setting a cookie on our origin.

## Decision

**Option 1**: we stay on localStorage. We compensate with:
- A strict CSP in `public/_headers` (Cloudflare Pages), enforced after a `Content-Security-Policy-Report-Only` warm-up period.
- No inline scripts, no `eval`, `connect-src` restricted to the necessary Supabase domains.
- Strict sanitization of any user-controlled input rendered to the DOM (Svelte does this by default except for `@html`).

## Consequences

- ✅ Zero immediate refactor. The project stays fully static, deployable to any CDN.
- ✅ Cloudflare Pages remains a plain static-file host — no extra server-side attack surface.
- ✅ Infrastructure costs unchanged.
- ⚠️ An XSS remains catastrophic. CSP becomes a critical security control — not a bonus.
- ⚠️ The JWT is exfiltratable via a malicious browser extension or an unpatched Svelte/Astro vulnerability. Residual risk accepted for a public-facing, low-value-target site.
- 🔄 **Re-evaluate** if the stored data becomes more sensitive (payment, health data, etc.) → switch to option 2.
- 🔄 **Re-evaluate** if Astro/Cloudflare lower the friction of partial SSR with negligible cost — switch prophylactically.

## Links

- Current implementation: `src/lib/supabase.ts:64-82`.
- CSP hardening rule: see [ADR 002](002-cors-edge-functions-permissive.md) for how it relates to CORS.
