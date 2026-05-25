<script lang="ts">
  import { onMount } from 'svelte';
  import type { Session } from '@supabase/supabase-js';
  import { fetchMyRatings } from '../lib/ratings';
  import { getSupabase, hasStoredSession, hasSupabaseConfig } from '../lib/supabase';

  export let total = 0;
  let count = 0;
  let visible = false;

  // Scope the dismissal to the signed-in user so that signing out, or
  // another user signing in on the same browser, does not silently inherit
  // a "dismissed" state from the previous session.
  const dismissalKey = (userId: string) => `ade-rating-nudge-dismissed:${userId}`;

  async function refresh(session: Session | null) {
    if (!session) {
      // Signed out: clear nudge state and any per-user dismissal flag.
      count = 0;
      visible = false;
      try {
        localStorage.removeItem('ade-rating-nudge-dismissed');
      } catch {
        // ignore storage errors
      }
      return;
    }
    if (localStorage.getItem(dismissalKey(session.user.id)) === '1') {
      visible = false;
      return;
    }
    const supabase = await getSupabase();
    count = Object.keys(await fetchMyRatings(supabase)).length;
    visible = count > 0 && count < total;
  }

  onMount(() => {
    if (!hasSupabaseConfig()) return;
    // Nudge is only useful for signed-in users; skip the SDK load entirely
    // for anonymous visitors.
    if (!hasStoredSession()) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const supabase = await getSupabase();
      if (cancelled) return;
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await refresh(data.session);
      if (cancelled) return;
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        void refresh(session);
      });
      unsubscribe = () => subscription.subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  });

  function dismiss() {
    visible = false;
    void (async () => {
      const supabase = await getSupabase();
      const { data } = await supabase.auth.getSession();
      if (data.session) localStorage.setItem(dismissalKey(data.session.user.id), '1');
    })();
  }
</script>

{#if visible}
  <aside class="nudge">
    <span>You've rated {count}/{total} features - finish to unlock your personal ranking.</span>
    <a href="/rate">Continue</a>
    <button type="button" aria-label="Dismiss rating progress banner" on:click={dismiss}>×</button>
  </aside>
{/if}

<style>
  .nudge {
    position: sticky;
    bottom: 14px;
    z-index: 80;
    width: min(720px, calc(100% - 28px));
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--accent);
    border-radius: var(--radius-md);
    background: var(--bg-elev);
    box-shadow: var(--shadow-card);
    color: var(--fg-soft);
  }
  .nudge a { font-weight: 800; }
  .nudge button { margin-left: auto; border: 0; background: transparent; color: var(--fg-muted); font-size: 1.4rem; cursor: pointer; }
</style>
