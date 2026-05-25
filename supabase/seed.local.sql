-- LOCAL DEV ONLY. Never run against remote Supabase projects.
--
-- This file is intentionally named `seed.local.sql` (not `seed.sql`) so
-- `supabase db reset` does NOT auto-load it. The release pipeline never
-- ships it. To apply it on a fresh local stack, run: `mise run seed-local`.
--
-- This is a quick-start convenience: it seeds a `local-rater@example.test`
-- account with 3 ratings so the UI has something to show without going
-- through GitHub OAuth. The bcrypt password (`password`) is publicly
-- known on GitHub — that is fine for local-only use, never acceptable
-- for any deployed env.

-- Defence in depth: the wrapper script (`infra/scripts/seed-local.sh`)
-- sets `app.environment = 'local'` before piping this file. A direct
-- `psql remote < seed.local.sql` lacks that setting and fails here.
do $$
begin
  if coalesce(current_setting('app.environment', true), '') <> 'local' then
    raise exception
      'seed.local.sql blocked: app.environment=% (expected ''local''). Run via `mise run seed-local`.',
      coalesce(current_setting('app.environment', true), '<unset>');
  end if;
end
$$;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'local-rater@example.test', crypt('password', gen_salt('bf')), now(), now(), now())
on conflict (id) do nothing;

insert into public.ratings (user_id, feature_id, rating)
values
  ('00000000-0000-0000-0000-000000000001', 'git-worktrees', 5),
  ('00000000-0000-0000-0000-000000000001', 'sandbox-isolation', 4),
  ('00000000-0000-0000-0000-000000000001', 'visual-task-management', 3)
on conflict (user_id, feature_id) do update set rating = excluded.rating;
