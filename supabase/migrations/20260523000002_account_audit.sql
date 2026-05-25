-- Anonymized audit log for account deletions (ADR 004).
--
-- The row stores only the Supabase UUID + an action label + a timestamp.
-- After the account is deleted from auth.users the UUID is no longer
-- traceable back to any natural person — it is anonymized data within the
-- GDPR meaning, so we do not need a special legal basis or retention rule.
-- A 12-month rolling purge is added as a security best practice (and to
-- keep the table small).
--
-- Do NOT extend this table to email, IP, User-Agent or any other PII
-- without a new ADR.

create table if not exists public.account_audit (
  user_id uuid not null,
  action text not null check (action in ('account_deleted')),
  created_at timestamptz not null default now()
);

create index if not exists account_audit_created_at_idx
  on public.account_audit(created_at);

-- RLS on, no grant to anon or authenticated. Writes happen through the
-- `public.delete_my_account()` security-definer RPC; reads happen via
-- the Supabase dashboard or service-role only.
--
-- The explicit deny-all SELECT policy below is belt-and-braces. Without
-- it, the table is already inaccessible to PostgREST roles (no grant +
-- RLS enabled), but the explicit `using (false)` makes the intent
-- machine-readable and catches a future drift where someone hands out
-- `grant select on public.account_audit` without thinking.
alter table public.account_audit enable row level security;

create policy "deny all reads"
  on public.account_audit
  for select
  to authenticated, anon
  using (false);

create policy "deny all writes from clients"
  on public.account_audit
  for all
  to authenticated, anon
  using (false)
  with check (false);

-- 12-month rolling purge. pg_cron is available on Supabase by default.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'account_audit_monthly_purge',
      '0 3 1 * *',
      $cron$
        delete from public.account_audit
        where created_at < now() - interval '12 months'
      $cron$
    );
  end if;
end
$$;
