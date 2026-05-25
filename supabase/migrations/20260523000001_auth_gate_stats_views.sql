-- Auth-gate the community stats views.
--
-- Both views used to grant `select to anon` so anonymous visitors could see
-- community ratings without signing in. Per ADR 003, that surface is the
-- cheapest wallet-DoS vector against the project (no JWT, no account,
-- untraceable from a botnet, ~$177–$2k/month theoretical egress at 100–1000
-- req/s). Closing the hole is strictly cheaper than mitigating it through
-- materialization + cache + rate-limit, given that the product loop ("sign
-- in to rate") already assumes authentication for the value-add side.
--
-- Anonymous visitors now see no community data at all. The frontend renders
-- a "Sign in to see community ratings" CTA when it detects a missing
-- session or a PostgREST 42501 error on these reads.

revoke select on public.feature_stats from anon;
revoke select on public.community_voters from anon;

-- Re-grant to authenticated for idempotence with the historical migrations.
grant select on public.feature_stats to authenticated;
grant select on public.community_voters to authenticated;
