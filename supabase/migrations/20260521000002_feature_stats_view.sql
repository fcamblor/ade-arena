-- Community feature stats aggregate.
--
-- This view is intentionally declared with `security_invoker = false` so it
-- runs with the privileges of the view owner (postgres), bypassing the RLS
-- on `public.ratings` (which restricts users to their own rows). Without
-- this, an authenticated user querying `feature_stats` would only see
-- aggregates over their own ratings — defeating the very purpose of the
-- view. Access is controlled at the grant level instead: see
-- `20260523000001_auth_gate_stats_views.sql` which revokes `select` from
-- anon and re-grants it to authenticated only.
--
-- See ADR 003 for the cost/benefit trade-off versus a materialized view.
create or replace view public.feature_stats
with (security_invoker = false)
as
select
  feature_id,
  avg(rating)::numeric(3,2) as avg_rating,
  count(*)::bigint as vote_count,
  count(*) filter (where rating = 5)::bigint as count_5,
  count(*) filter (where rating = 4)::bigint as count_4,
  count(*) filter (where rating = 3)::bigint as count_3,
  count(*) filter (where rating = 2)::bigint as count_2,
  count(*) filter (where rating = 1)::bigint as count_1
from public.ratings
group by feature_id;

grant select on public.feature_stats to anon, authenticated;
