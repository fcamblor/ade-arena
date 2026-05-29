begin;

select plan(7);

select has_table('public', 'user_preferences', 'user_preferences table exists');
select policies_are(
  'public',
  'user_preferences',
  array['read own preferences', 'insert own preferences', 'update own preferences', 'delete own preferences']
);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pa@example.test', 'x', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pb@example.test', 'x', now(), now(), now());

-- Seed one row per user so the RLS isolation checks have something to hide.
insert into public.user_preferences (user_id, daily_os, opensource_importance, willing_to_pay)
values
  ('20000000-0000-0000-0000-000000000001', array['linux', 'mac']::text[], 4, true),
  ('20000000-0000-0000-0000-000000000002', array['windows']::text[], 2, false);

select throws_ok(
  $$insert into public.user_preferences (user_id, opensource_importance) values ('20000000-0000-0000-0000-000000000001', 6)$$,
  null,
  'opensource_importance check rejects values outside 1-5'
);

select throws_ok(
  $$insert into public.user_preferences (user_id, daily_os) values ('20000000-0000-0000-0000-000000000001', array['android']::text[])$$,
  null,
  'daily_os check rejects values outside {linux,mac,windows}'
);

-- ====================================================================
-- Authenticated-as-user-A negative tests
-- ====================================================================
set local role authenticated;
set local request.jwt.claims to '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}';

select throws_ok(
  $$insert into public.user_preferences (user_id, willing_to_pay) values ('20000000-0000-0000-0000-000000000002', true)$$,
  '42501',
  null,
  'user_preferences RLS rejects cross-user insert (auth.uid() != user_id)'
);

select results_eq(
  $$select count(*)::int from public.user_preferences$$,
  $$values (1)$$,
  'user_preferences RLS hides rows owned by other users'
);

-- Cross-user UPDATE is silently filtered out by RLS (0 rows affected).
update public.user_preferences set opensource_importance = 1 where user_id = '20000000-0000-0000-0000-000000000002';
reset role;
select results_eq(
  $$select opensource_importance::int from public.user_preferences where user_id = '20000000-0000-0000-0000-000000000002'$$,
  $$values (2)$$,
  'user_preferences RLS prevents cross-user UPDATE from mutating other users'' rows'
);

select * from finish();
rollback;
