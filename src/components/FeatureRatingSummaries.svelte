<script lang="ts">
  import { onMount } from 'svelte';
  import type { RatingMap } from '../lib/ratings';
  import type { FeatureStatsRow } from '../lib/supabase';
  import { ensureSessionData, getFeatureStats, getRatings, onSessionChange } from '../lib/session-data';

  type RatingContext = {
    ratings: RatingMap;
    stats: Record<string, FeatureStatsRow>;
    signedIn: boolean;
    userId: string;
  };

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
    if (personal != null && avg != null && Math.abs(personal - avg) >= 1.5) {
      deltaLabel = personal > avg ? 'You value this more' : 'You value this less';
    }

    slot.el.classList.add('feature-rating');
    slot.el.setAttribute('aria-label', 'Feature rating summary');

    // A single community vote that exists alongside a personal rating can only
    // be the user's own — surfacing both rows would just repeat the same value.
    const onlyVoteIsMine = personal != null && votes === 1;

    const children: HTMLElement[] = [];
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
    if (personal) {
      // The delta sits in the "You" row's meta slot — same column the
      // community row uses for "4.2 · N votes" — coloured like the "You" ink.
      const mineMeta = deltaLabel || (onlyVoteIsMine ? 'only vote so far' : '');
      children.push(
        starRow('mine', 'You', personal, mineMeta, 'Your rating', deltaLabel ? 'delta' : ''),
      );
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
    metaModifier = '',
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
      metaEl.className = metaModifier
        ? `feature-rating__meta feature-rating__meta--${metaModifier}`
        : 'feature-rating__meta';
      metaEl.textContent = meta;
      root.append(metaEl);
    }
    return root;
  }

  async function render() {
    const userId = activeUserId;
    // Both reads are deduplicated against the other islands through the shared
    // session-data layer, and resolve to empty data with no network call when
    // anonymous (ratings and community stats are auth-gated, ADR 003).
    const [ratings, stats] = await Promise.all([getRatings(), getFeatureStats()]);
    // Stale-session guard: drop updates that belong to a previous identity
    // (e.g. user signs out mid-fetch).
    if (activeUserId !== userId) return;
    const ctx: RatingContext = { ratings, stats, signedIn: Boolean(userId), userId };
    for (const slot of slots) renderInto(slot, ctx);
  }

  onMount(() => {
    slots = Array.from(document.querySelectorAll<HTMLElement>('.feature-rating-slot')).map((el) => ({
      el,
      featureId: el.dataset.featureId ?? '',
    }));

    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const snap = await ensureSessionData();
      activeUserId = snap.userId;
      await render();
      unsubscribe = onSessionChange((next) => {
        activeUserId = next.userId;
        void render();
      });
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

  /* The "You value this more/less" delta, shown in the "You" row's meta slot,
     picks up the same pale-green ink as the rest of that row. */
  .feature-rating__meta--delta {
    color: var(--rating-mine-ink);
    font-weight: 800;
  }
  }
</style>
