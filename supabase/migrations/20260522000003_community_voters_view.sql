-- Community voter count.
--
-- Like `feature_stats`, this view is intentionally declared with
-- `security_invoker = false` so the count(distinct user_id) aggregates
-- across all users despite the RLS on `public.ratings`. Anonymous access
-- is closed via `20260523000001_auth_gate_stats_views.sql`.
create or replace view public.community_voters
with (security_invoker = false)
as
select count(distinct user_id)::bigint as voter_count
from public.ratings;

grant select on public.community_voters to anon, authenticated;
