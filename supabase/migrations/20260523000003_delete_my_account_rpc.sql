-- Atomic account deletion: insert the GDPR audit row and delete the
-- auth.users row in a single transaction. Replaces the two-step approach
-- in the delete-user Edge Function, which left a window where an audit
-- row could persist for a deletion that ultimately failed (or, if we
-- reversed the order, a successful deletion without any audit trail).
--
-- `security definer` because the function reads/writes auth.users (which
-- a normal authenticated role cannot touch) and writes account_audit
-- (RLS-locked with no grants). It is only callable by `authenticated`
-- and resolves the target user from `auth.uid()` — never from a
-- parameter — so a caller can only delete themselves.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'delete_my_account requires an authenticated session'
      using errcode = '42501';
  end if;

  insert into public.account_audit (user_id, action)
  values (uid, 'account_deleted');

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
