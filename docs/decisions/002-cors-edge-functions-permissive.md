# ADR 002 — Wildcard CORS on Edge Functions while we stay on localStorage

- **Status**: Accepted
- **Date**: 2026-05-22
- **Deciders**: @fcamblor

## Context

The `delete-user` and `export-ratings` Edge Functions (`supabase/functions/*/index.ts:3-7`) return `Access-Control-Allow-Origin: *`. An initial review flagged this as a critical risk: an attacker could in theory invoke `delete-user` from a malicious site and delete a victim's account.

## Actual risk analysis

CORS is a **browser-only** protection:

1. **`curl` / non-browser requests** ignore CORS. The server processes them and responds normally. CORS therefore never stops an attacker who already holds the JWT.
2. **Cross-origin from another site**: a malicious site running at `evil.com` cannot read the `localStorage` of `ade-arena.pages.dev` (strict same-origin policy). It therefore cannot obtain the JWT and cannot put it into an `Authorization` header. CSRF is not possible here.
3. **XSS on our own site**: the attacker JavaScript already runs on our origin. It can call `fetch('/edge-fn', { headers: { Authorization: 'Bearer ' + localStorage.getItem('sb-...-auth-token') } })`. CORS does not gate this — it is a request to `*.supabase.co` issued from our origin, which is exactly the pattern CORS is supposed to allow.

Conclusion: with **JWT in localStorage** ([ADR 001](001-supabase-localstorage-jwt.md)), strict CORS effectively brings **nothing**. The real control is XSS prevention (CSP).

Strict CORS would matter again **only** if we switched to cookies (HttpOnly or otherwise): cookies are sent automatically by the browser on cross-origin requests with `credentials: 'include'`, so a third-party site could trigger an authenticated request from a victim's browser → classic CSRF.

## Options considered

1. **Keep the wildcard**: less complexity, no allowlist to maintain.
2. **Whitelist origins**: `https://ade-arena.pages.dev`, `https://dev.ade-arena.pages.dev`, `http://localhost:4321`. Defense in depth.

## Decision

**Option 1**: keep `Access-Control-Allow-Origin: *` on Edge Functions while we are on localStorage.

## Consequences

- ✅ No maintenance cost for the origin allowlist.
- ✅ Consistent with the architecture: Edge Functions are a "public API" called by JS that already holds the JWT.
- ⚠️ The wildcard may give a misleading impression of "public Edge Function with no controls" during a superficial audit. Documented here and in the code.
- 🔄 **Mandatory re-evaluation** if we migrate to cookies (ADR 001 reopened). In that case, immediately switch to an explicit origin allowlist + `Access-Control-Allow-Credentials: true`.

## Links

- Edge Functions: `supabase/functions/delete-user/index.ts`, `supabase/functions/export-ratings/index.ts`.
- JWT storage decision: [ADR 001](001-supabase-localstorage-jwt.md).
