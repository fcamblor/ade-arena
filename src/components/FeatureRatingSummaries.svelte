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

    // A single community vote that exists alongside a personal rating can only
    // be the user's own — surfacing both rows would just repeat the same value.
    const onlyVoteIsMine = personal != null && votes === 1;

    const children: HTMLElement[] = [];
    if (personal) {
      children.push(
        starRow('mine', 'You', personal, onlyVoteIsMine ? 'only vote so far' : '', 'Your rating'),
      );
    }
    if (avg != null && !onlyVoteIsMine) {
      children.push(
        starRow(
          'avg',
          'Community',
          avg,
          `${avg.toFixed(1)} · ${votes} vote${votes === 1 ? '' : 's'}`,
          'Community average',
        ),
      );
    }
    if (deltaLabel) {
      const strong = document.createElement('strong');
      strong.className = 'feature-rating__delta';
      strong.textContent = deltaLabel;
      children.push(strong);
    }
    slot.el.replaceChildren(...children);
  }

  const MAX_STARS = 5;

  // Builds a single labelled row of 5 stars where `value` (1–5, possibly
  // fractional for the community average) fills a coloured overlay clipped to
  // its proportional width over a muted empty track.
  function starRow(
    variant: 'mine' | 'avg',
    label: string,
    value: number,
    meta: string,
    title: string,
  ): HTMLElement {
    const root = document.createElement('span');
    root.className = `feature-rating__row feature-rating__row--${variant}`;
    root.title = title;

    const labelEl = document.createElement('span');
    labelEl.className = 'feature-rating__label';
    labelEl.textContent = label;

    const track = document.createElement('span');
    track.className = 'feature-rating__stars';
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', `${value.toFixed(1)} out of ${MAX_STARS} stars`);

    const base = document.createElement('span');
    base.className = 'feature-rating__stars-base';
    base.textContent = '★'.repeat(MAX_STARS);
    base.setAttribute('aria-hidden', 'true');

    const fill = document.createElement('span');
    fill.className = 'feature-rating__stars-fill';
    fill.textContent = '★'.repeat(MAX_STARS);
    fill.setAttribute('aria-hidden', 'true');
    const ratio = Math.max(0, Math.min(1, value / MAX_STARS));
    fill.style.width = `${(ratio * 100).toFixed(2)}%`;

    track.append(base, fill);
    root.append(labelEl, track);

    if (meta) {
      const metaEl = document.createElement('span');
      metaEl.className = 'feature-rating__meta';
      metaEl.textContent = meta;
      root.append(metaEl);
    }
    return root;
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
  page, and writes the rating rows imperatively into them. Replaces the prior
  per-feature `client:visible` approach which spawned ~56 IntersectionObservers
  + 56 Supabase auth subscriptions on a single page render.
-->

<style>
  /* Emitted as global CSS (Svelte `:global {}` block) because the slots are
     owned by ComparisonTable.astro's SSR markup, not by this component, and the
     rows are injected imperatively at runtime — Svelte's scoped class hash
     never lands on them, so scoped rules wouldn't match. The `.feature-rating`
     class is added by `renderInto` only when there's actually a rating to
     display, so an empty slot collapses to nothing. */
  :global {
  .feature-rating {
    --rating-mine-ink: var(--cell-yes-ink);
    --rating-avg-ink: var(--cell-partial-ink);
    display: grid;
    gap: 4px;
    margin-top: 10px;
  }

  /* One row = label + star track + numeric meta. */
  .feature-rating__row {
    display: grid;
    grid-template-columns: 4.5rem auto 1fr;
    align-items: center;
    gap: 8px;
  }
  .feature-rating__label {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--fg-muted);
  }
  .feature-rating__row--mine .feature-rating__label { color: var(--rating-mine-ink); }
  .feature-rating__row--avg .feature-rating__label { color: var(--rating-avg-ink); }

  /* Stars: a muted empty track with a coloured fill layer clipped to width. */
  .feature-rating__stars {
    position: relative;
    display: inline-block;
    font-size: 0.9rem;
    line-height: 1;
    letter-spacing: 1px;
    white-space: nowrap;
  }
  .feature-rating__stars-base { color: var(--border-strong); }
  .feature-rating__stars-fill {
    position: absolute;
    inset: 0;
    overflow: hidden;
    white-space: nowrap;
  }
  .feature-rating__row--mine .feature-rating__stars-fill { color: var(--rating-mine-ink); }
  .feature-rating__row--avg .feature-rating__stars-fill { color: var(--rating-avg-ink); }

  .feature-rating__meta {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--fg-muted);
  }

  .feature-rating__delta {
    justify-self: start;
    margin-top: 2px;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
    border: 1px solid color-mix(in oklch, var(--cell-partial-ink) 45%, var(--border));
    background: var(--bg-row);
    color: var(--cell-partial-ink);
    font-size: 0.7rem;
    font-weight: 700;
  }
  }
</style>
