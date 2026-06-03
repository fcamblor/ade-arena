<script lang="ts">
  import { onMount } from 'svelte';
  import { ensureSessionData, getRatings, getSessionUserId, onSessionChange } from '../lib/session-data';

  export let total = 0;
  let count = 0;
  let visible = false;

  // Scope the dismissal to the signed-in user so that signing out, or
  // another user signing in on the same browser, does not silently inherit
  // a "dismissed" state from the previous session.
  const dismissalKey = (userId: string) => `ade-rating-nudge-dismissed:${userId}`;

  async function refresh(userId: string) {
    if (!userId) {
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
    if (localStorage.getItem(dismissalKey(userId)) === '1') {
      visible = false;
      return;
    }
    // Shares the ratings fetch with the leaderboard / rating-summary islands
    // through the session-data layer, so it costs no extra network call.
    count = Object.keys(await getRatings()).length;
    visible = count > 0 && count < total;
  }

  onMount(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      // ensureSessionData resolves without loading the SDK for anon visitors,
      // so the nudge stays cheap when there's no session to act on.
      const snap = await ensureSessionData();
      if (cancelled) return;
      await refresh(snap.userId);
      if (cancelled) return;
      unsubscribe = onSessionChange((next) => {
        void refresh(next.userId);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  });

  function dismiss() {
    visible = false;
    const userId = getSessionUserId();
    if (userId) localStorage.setItem(dismissalKey(userId), '1');
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
