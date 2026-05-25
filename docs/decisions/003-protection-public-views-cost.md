# ADR 003 — Protecting public views against wallet-DoS

- **Status**: Accepted
- **Date**: 2026-05-22
- **Deciders**: @fcamblor

## Context

Two PostgREST views are exposed to `anon` (unauthenticated users):
- `public.feature_stats` — aggregates `avg(rating), count(*) group by feature_id`.
- `public.community_voters` — distinct voter count.

Neither is materialized. Every request recomputes the aggregate. First intuition: an attacker could spam these endpoints to saturate the compute and/or push billed egress upward.

## Benchmark — actual response size

| Endpoint | Rows | JSON payload size | + HTTP headers | **Total per request** |
|---|---|---|---|---|
| `/rest/v1/feature_stats` | 54 features | ~150 B/row × 54 ≈ 8 KB | ~500 B | **~8.5 KB** |
| `/rest/v1/community_voters` | 1 | ~25 B | ~500 B | **~500 B** |

## Usage and DoS scenarios — actual numbers (anon-readable model)

| Scenario | Req/day | Egress/month | Cost on Supabase Pro (250 GB included, $0.09/GB after) |
|---|---|---|---|
| Current traffic estimate (<1k visitors/day) | <1k | <300 MB | **0 $** |
| Target traffic (5k visitors/day, 2 stats hits/visit) | 10k | 2.5 GB | **0 $** (well below quota) |
| Single-IP DoS 100 req/s sustained | 8.6M | 2.2 TB | ~$177/month if sustained 30 days |
| Distributed DoS 1000 req/s across 100 IPs | 86M | 22 TB | ~$1,960/month theoretical max |

## Supabase cost breakdown

| Component | Billed? | DoS impact |
|---|---|---|
| DB compute | Plan-included | Possible saturation = site down, no bill |
| Egress | ✅ billed past quota (~$0.09/GB on Pro) | Bill grows |
| Number of requests | ❌ not billed | — |
| Storage | ❌ unrelated | — |

## Options considered

| Option | Compute | Egress | Latency | Effort | Recurring cost |
|---|---|---|---|---|---|
| A. Materialize the views + `pg_cron` refresh every 5 min | ✅ neutralized | ❌ unchanged (same payload) | ✅ improved | ~1h | $0 |
| B. Cloudflare Worker with Cache API + Rate Limiting | ✅ | ✅ | ✅ excellent | ~1 day | Workers 100k/day free tier |
| C. Supabase custom domain + Cloudflare proxy (Cache Rules + Rate Limiting) | ✅ | ✅ | ✅ | ~1h config | Included in Supabase Pro |
| D. Supabase Spend Cap + billing alerts (manual dashboard config, **not Terraformable**) | ❌ | ❌ (but bill is capped) | — | 2 min | $0 |
| **E. Require authentication to read stats views (`grant select … to authenticated`)** | ✅ | ✅ | — | ~30 min SQL + ~1h frontend gating | $0 |

**Key insight on A–D**: without an intermediate component between the browser and `*.supabase.co`, we cannot prevent egress for anonymous traffic. Materialization alone (A) saves compute but not egress. B and C add infrastructure to fix that, but only after we accepted the premise that anonymous reads must be supported.

**Key insight on E**: dropping that premise entirely is strictly cheaper than mitigating it. An attacker now needs a GitHub account, an OAuth flow, and a JWT that expires every hour — making the wallet-DoS effort dramatically more expensive (and traceable) than the value it extracts from a low-profile public site.

## Decision

**E + D as backup**:

1. **Gate stats endpoints behind authentication.** Revoke `select` on `public.feature_stats` and `public.community_voters` from `anon`. Keep `grant select … to authenticated`. Frontend components that currently read these views surface a "Sign in to see community ratings" affordance for anonymous visitors. No teaser, no aggregate proxy: anonymous visitors get **no community data at all**.
2. **Keep Spend Cap = ON** in Supabase Dashboard → Organization Settings → Billing as a defense-in-depth backstop, even though the primary attack vector is now closed. Stays manual (the Supabase Terraform provider does not expose a billing resource at this time).

Options A, B, C are **explicitly not pursued for security**. Materialization (A) may still be revisited later **as a perf optimization** if community-page latency becomes a problem, but it is no longer required to manage cost risk.

## Why E beats A + D for this project

- **Attack economics**: an unauthenticated DoS is the cheapest threat to operate. By removing anonymous access, we shift the attacker from "free, untraceable curl" to "GitHub account + OAuth flow + 1h JWT lifetime + per-user audit trail in Supabase logs". For a low-value target, this changes the equation from "trivial to abuse" to "not worth the effort".
- **Product alignment**: stats become an authenticated benefit, which incentivizes signup — the same primitive that drives the rating contribution flow. Voting and reading aggregate results become two sides of the same OAuth gate.
- **Observability**: every stats read is tagged with a `user_id` in Supabase logs. Detecting abusive patterns and banning specific accounts becomes possible (RLS-friendly killswitch).
- **No additional infrastructure**: kills the need for Workers (B) or custom-domain proxy (C). Spend Cap (D) becomes a true backstop, not the main line of defense.

## Consequences

- ✅ Wallet-DoS risk neutralized for unauthenticated traffic (= 100% of the attack surface for an opportunistic attacker).
- ✅ Per-user audit trail on every stats read.
- ✅ No additional infrastructure, no extra vendor surface.
- ✅ Reinforces the "sign in to participate and to see" loop.
- ⚠️ **Anonymous visitors see no community data.** The homepage, the community-ranking mode of the leaderboard, and the per-feature rating summaries become "Sign in" affordances for anyone not logged in. This was explicitly accepted as a tradeoff.
- ⚠️ A signed-in malicious user can still spam the endpoints with their own JWT. Supabase rate-limits per JWT/IP and abuse detection covers the standard cases; if a determined attacker industrializes GitHub-account creation, we can ban the offending `user_id` reactively (logs surface it).
- ⚠️ SEO impact on stats-driven landings is forfeited (acceptable since stats are JS-hydrated today, no current SEO surface to protect).
- 🔄 **Re-evaluation** if:
  - Anonymous visibility of community stats becomes a product priority — re-open the discussion, likely with option C (Cloudflare-proxied cache) as the cheapest pivot.
  - A signed-in attack pattern emerges that abuse detection cannot block on its own — add per-user PostgREST rate-limit or a Worker proxy.
  - Latency on the authenticated community page becomes a perf bottleneck — pull in option A (materialization) for speed, not for safety.

## Implementation pointers

- Migration: revoke `select` on both views from `anon`; keep `grant select … to authenticated`. Drop the `to anon, …` grants present in `supabase/migrations/20260522000001_fix_feature_stats_security.sql` and `20260522000003_community_voters_view.sql` via a new dated migration (do not edit historical migrations).
- Frontend: detect the `42501 / permission denied` PostgREST error on these reads (or check the session up-front via `getSupabase().auth.getSession()`) and render the "Sign in to see community ratings" CTA. Likely components:
  - `src/components/ComparisonRankings.svelte` (community mode)
  - `src/components/FeatureRatingSummary.svelte`
  - the homepage section that displays the "X voters" counter
- Dashboard: confirm Spend Cap is enabled at Organization Settings → Billing.

## Links

- Current view migrations: `supabase/migrations/20260522000001_fix_feature_stats_security.sql`, `supabase/migrations/20260522000003_community_voters_view.sql`.
- Feature catalog: `src/data/features.ts` (54 features as of writing).
- Supabase custom domains doc (for the re-evaluation pivot): https://supabase.com/docs/guides/platform/custom-domains
- Cloudflare Cache Rules doc (for the re-evaluation pivot): https://developers.cloudflare.com/cache/how-to/cache-rules/
