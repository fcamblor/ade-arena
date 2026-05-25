# ADR 004 — Audit log for account deletion and GDPR compliance

- **Status**: Accepted
- **Date**: 2026-05-22
- **Deciders**: @fcamblor

## Context

The `delete-user` Edge Function (`supabase/functions/delete-user/index.ts`) irreversibly deletes a user account (cascading on `ratings` and `feature_skips` via `on delete cascade`).

No audit trail is left. Consequences:
- Impossible to answer "how many deletions happened during period X?" for internal reporting.
- Impossible to detect an abnormal spike in deletions (potential attack).
- If an attacker obtains a JWT and deletes an account, no trace remains.

## GDPR analysis

Logging a deletion event raises the question: *am I keeping personal data about a person who just requested its erasure?*

A Supabase **UUID** of a deleted account becomes an **anonymized** identifier within the meaning of GDPR:
- The account no longer exists → no way to trace the UUID back to an identifiable natural person, even for the data controller.
- The UUID is random (uuid v4), not derived from a personal identifier.

Therefore logging `{ user_id: uuid, action: 'account_deleted', created_at: timestamp }` is **GDPR-compliant** — it is anonymous data.

Conversely, logging **email**, **GitHub user_name**, **IP**, or **User-Agent** would be PII and would trigger:
- A legal basis (legitimate interest — security).
- Mention in the privacy notice.
- A bounded, minimized retention.
- An applicable right to erasure (paradox: we would have to delete a deletion log on request…).

## Options considered

1. **No audit log**: status quo, simple, no GDPR question.
2. **Anonymized audit log** (`user_id` UUID + action + timestamp) in an `account_audit` table.
3. **Full audit log** (email, IP, etc.) in `account_audit` with heavy GDPR handling.
4. **Native Supabase Logs (Logflare)** with automatic per-plan retention (7d Pro, 28d Team).

## Decision

**Option 2 — anonymized audit log**, plus a **12-month retention** as a security best practice (not a GDPR obligation here).

Implementation:
- Migration `supabase/migrations/<timestamp>_account_audit.sql`:
  ```sql
  create table public.account_audit (
    user_id uuid not null,
    action text not null check (action in ('account_deleted')),
    created_at timestamptz not null default now()
  );
  create index account_audit_created_at_idx on public.account_audit(created_at);
  -- RLS: no grant to anon or authenticated. Read via service-role only.
  alter table public.account_audit enable row level security;
  ```
- In `supabase/functions/delete-user/index.ts`, **before** `auth.admin.deleteUser`, insert the audit row (using the `adminClient` service-role).
- Monthly `pg_cron` job: `delete from public.account_audit where created_at < now() - interval '12 months'`.
- Mention in `src/pages/privacy.astro`:
  > When you delete your account, an anonymized log containing only a technical identifier and a timestamp is retained for 12 months for security and abuse-detection purposes. This log contains neither email, IP address, nor any other data that could identify you.

## Consequences

- ✅ Anomaly detection becomes possible (daily counts, alert on spike).
- ✅ No personal data retained → no tension with the right to erasure.
- ✅ Bounded retention → data minimization preserved even if the scope ever drifted into PII.
- ⚠️ If we later add other `action` values (login, export, etc.) with identifying data, we must either spin up a new table or revise the retention. **Do not extend `account_audit` to PII without a new ADR.**
- ⚠️ The `account_audit` table is not exposed in the TypeScript `Database` client type (`src/lib/supabase.ts:32-56`) — intentional, it must not surface to the frontend.
- 🔄 **Re-evaluate** if security requirements ever mandate logging IP (forensics) — create a dedicated ADR with a full GDPR analysis.

## Links

- Edge Function: `supabase/functions/delete-user/index.ts`.
- Privacy page: `src/pages/privacy.astro`.
- CNIL — anonymization vs pseudonymization: https://www.cnil.fr/en/anonymisation-personal-data
