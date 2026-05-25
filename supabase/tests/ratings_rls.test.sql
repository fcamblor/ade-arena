begin;

select plan(16);

select has_table('public', 'ratings', 'ratings table exists');
select has_table('public', 'feature_skips', 'feature_skips table exists');
select has_table('public', 'account_audit', 'account_audit table exists');
select has_view('public', 'feature_stats', 'feature_stats view exists');
select has_view('public', 'community_voters', 'community_voters view exists');
select policies_are(
  'public',
  'ratings',
  array['read own ratings', 'insert own ratings', 'update own ratings', 'delete own ratings']
);
select policies_are(
  'public',
  'feature_skips',
  array['read own skips', 'insert own skips', 'update own skips', 'delete own skips']
);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@example.test', 'x', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@example.test', 'x', now(), now(), now());

insert into public.ratings (user_id, feature_id, rating)
values
  ('10000000-0000-0000-0000-000000000001', 'git-worktrees', 5),
  ('10000000-0000-0000-0000-000000000002', 'git-worktrees', 3);

select results_eq(
  $$select avg_rating::text, vote_count::text from public.feature_stats where feature_id = 'git-worktrees'$$,
  $$values ('4.00'::text, '2'::text)$$,
  'feature_stats aggregates all users'
);

select throws_ok(
  $$insert into public.ratings (user_id, feature_id, rating) values ('10000000-0000-0000-0000-000000000001', 'sandbox-isolation', 6)$$,
  null,
  'rating check rejects values outside 1-5'
);

-- ====================================================================
-- Authenticated-as-user-A negative tests
-- ====================================================================
set local role authenticated;
set local request.jwt.claims to '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';

select throws_ok(
  $$insert into public.feature_skips (user_id, feature_id) values ('10000000-0000-0000-0000-000000000002', 'git-worktrees')$$,
  '42501',
  null,
  'feature_skips RLS rejects cross-user insert (auth.uid() != user_id)'
);

-- User A can only see their own ratings, never user B's.
select results_eq(
  $$select count(*)::int from public.ratings$$,
  $$values (1)$$,
  'ratings RLS hides rows owned by other users'
);

-- Cross-user UPDATE is silently filtered out by RLS (0 rows affected),
-- not raised as an error — verify nothing actually changes on B's row.
update public.ratings set rating = 1 where user_id = '10000000-0000-0000-0000-000000000002';
reset role;
select results_eq(
  $$select rating::int from public.ratings where user_id = '10000000-0000-0000-0000-000000000002' and feature_id = 'git-worktrees'$$,
  $$values (3)$$,
  'ratings RLS prevents cross-user UPDATE from mutating other users'' rows'
);

set local role authenticated;
set local request.jwt.claims to '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';

-- Same idea for DELETE: silently filtered, no exception.
delete from public.ratings where user_id = '10000000-0000-0000-0000-000000000002';
reset role;
select results_eq(
  $$select count(*)::int from public.ratings where user_id = '10000000-0000-0000-0000-000000000002'$$,
  $$values (1)$$,
  'ratings RLS prevents cross-user DELETE from removing other users'' rows'
);

-- account_audit must remain invisible to authenticated callers even via SELECT.
insert into public.account_audit (user_id, action) values ('10000000-0000-0000-0000-000000000001', 'account_deleted');
set local role authenticated;
set local request.jwt.claims to '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
select results_eq(
  $$select count(*)::int from public.account_audit$$,
  $$values (0)$$,
  'account_audit returns zero rows to authenticated (RLS deny-all)'
);
reset role;

-- ====================================================================
-- Anonymous role: community stats views must be gated.
-- ====================================================================
set local role anon;
select throws_ok(
  $$select * from public.feature_stats$$,
  '42501',
  null,
  'feature_stats refuses anon role (permission denied)'
);
select throws_ok(
  $$select * from public.community_voters$$,
  '42501',
  null,
  'community_voters refuses anon role (permission denied)'
);
reset role;

select * from finish();
rollback;
