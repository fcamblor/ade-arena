<script context="module" lang="ts">
  import type { Session, SupabaseClient } from '@supabase/supabase-js';
  import { fetchFeatureStats, fetchMyRatings, type RatingMap } from '../lib/ratings';
  import { getSupabase, hasStoredSession, hasSupabaseConfig, type Database, type FeatureStatsRow } from '../lib/supabase';

  type RatingContext = {
    ratings: RatingMap;
    stats: Record<string, FeatureStatsRow>;
    signedIn: boolean;
    userId: string;
  };

  let cache: Promise<RatingContext> | null = null;

  function loadRatingContext(): Promise<RatingContext> {
    if (!cache) {
      cache = (async () => {
        // Ratings (mine) and community stats are both auth-gated (ADR 003),
        // so anonymous visitors have nothing to show and don't need the SDK.
        if (!hasSupabaseConfig() || !hasStoredSession()) {
          return { ratings: {}, stats: {}, signedIn: false, userId: '' };
        }
        const supabase = await getSupabase();
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user.id ?? '';
        const signedIn = Boolean(userId);
        // Community stats are auth-gated (ADR 003); skip the call when anon.
        const [ratings, stats] = await Promise.all([
          signedIn ? fetchMyRatings(supabase) : Promise.resolve({}),
          signedIn ? fetchFeatureStats(supabase) : Promise.resolve({}),
        ]);
        return { ratings, stats, signedIn, userId };
      })();
    }
    return cache;
  }

  function invalidateRatingContext() {
    cache = null;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  type Slot = { el: HTMLElement; featureId: string };

  let slots: Slot[] = [];
  let activeUserId = '';

  function renderInto(slot: Slot, ctx: RatingContext) {
    const personal = ctx.signedIn ? ctx.ratings[slot.featureId] ?? null : null;
    const row = ctx.stats[slot.featureId];
    const avg = row?.avg_rating == null ? null : Number(row.avg_rating);
    const votes = Number(row?.vote_count ?? 0);

    // Empty state: collapse the slot completely so it leaves no spacing.
    if (!personal && !avg) {
      slot.el.replaceChildren();
      slot.el.classList.remove('feature-rating');
      slot.el.removeAttribute('aria-label');
      return;
    }

    let deltaLabel = '';
    if (personal != null && avg != null && Math.abs(personal - avg) > 1.5) {
      deltaLabel = personal > avg ? 'You value this more' : 'You value this less';
    }

    slot.el.classList.add('feature-rating');
    slot.el.setAttribute('aria-label', 'Feature rating summary');

    const children: HTMLElement[] = [];
    if (personal) {
      const s = document.createElement('span');
      s.title = 'Your rating';
      s.textContent = `${personal} ★ mine`;
      children.push(s);
    }
    if (avg != null) {
      const s = document.createElement('span');
      s.title = 'Community average';
      s.textContent = `${avg.toFixed(1)} ★ · ${votes} vote${votes === 1 ? '' : 's'}`;
      children.push(s);
    }
    if (deltaLabel) {
      const strong = document.createElement('strong');
      strong.textContent = deltaLabel;
      children.push(strong);
    }
    slot.el.replaceChildren(...children);
  }

  function applyContext(ctx: RatingContext) {
    // Stale-session guard: drop updates that belong to a previous identity
    // (e.g. user signs out mid-fetch).
    if (ctx.userId !== activeUserId) return;
    for (const slot of slots) renderInto(slot, ctx);
  }

  async function refresh() {
    applyContext(await loadRatingContext());
  }

  async function applySession(_supabase: SupabaseClient<Database>, session: Session | null) {
    activeUserId = session?.user.id ?? '';
    invalidateRatingContext();
    if (!session) {
      // Clear personal column without waiting on a fetch.
      const ctx: RatingContext = { ratings: {}, stats: {}, signedIn: false, userId: '' };
      applyContext(ctx);
      return;
    }
    const ctx = await loadRatingContext();
    applyContext(ctx);
  }

  onMount(() => {
    slots = Array.from(document.querySelectorAll<HTMLElement>('.feature-rating-slot')).map((el) => ({
      el,
      featureId: el.dataset.featureId ?? '',
    }));

    let unsubscribe: (() => void) | undefined;

    void (async () => {
      // Only wire the auth listener when there's already a session — for
      // anon visitors there's nothing to refresh, and skipping the
      // listener avoids fetching the SDK chunk on the home/compare page.
      if (hasSupabaseConfig() && hasStoredSession()) {
        const supabase = await getSupabase();
        const { data } = await supabase.auth.getSession();
        activeUserId = data.session?.user.id ?? '';
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
          void applySession(supabase, session);
        });
        unsubscribe = () => subscription.subscription.unsubscribe();
      }
      await refresh();
    })();

    return () => {
      unsubscribe?.();
    };
  });
</script>

<!--
  This island holds zero DOM of its own. It mounts once (client:idle from
  ComparisonTable), discovers every `.feature-rating-slot` placeholder in the
  page, and writes the rating chips imperatively into them. Replaces the prior
  per-feature `client:visible` approach which spawned ~56 IntersectionObservers
  + 56 Supabase auth subscriptions on a single page render.
-->

<style is:global>
  /* Hosted globally because the slots are owned by ComparisonTable.astro's
     SSR markup, not by this component — Svelte's scoped CSS wouldn't reach
     them. The class is added at runtime by `renderInto` only when there's
     actually a rating to display, so an empty slot collapses to nothing. */
  .feature-rating { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .feature-rating span,
  .feature-rating strong {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-soft);
    background: var(--bg-row);
    color: var(--fg-muted);
    font-size: 0.72rem;
    font-weight: 700;
  }
  .feature-rating strong {
    color: var(--cell-partial-ink);
    border-color: color-mix(in oklch, var(--cell-partial-ink) 45%, var(--border));
  }
</style>
