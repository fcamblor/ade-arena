<script context="module" lang="ts">
  import type { Session, SupabaseClient } from '@supabase/supabase-js';
  import { fetchFeatureStats, fetchMyRatings, type RatingMap } from '../lib/ratings';
  import { getSupabase, hasSupabaseConfig, type Database, type FeatureStatsRow } from '../lib/supabase';

  type RatingContext = {
    ratings: RatingMap;
    stats: Record<string, FeatureStatsRow>;
    signedIn: boolean;
    userId: string;
  };

  let cache:
    | Promise<RatingContext>
    | null = null;

  function loadRatingContext() {
    if (!cache) {
      cache = (async () => {
        if (!hasSupabaseConfig()) return { ratings: {}, stats: {}, signedIn: false, userId: '' };
        const supabase = getSupabase();
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

  export let featureId = '';

  let personal: number | null = null;
  let avg: number | null = null;
  let votes = 0;
  let deltaLabel = '';
  let activeUserId = '';

  function applyContext(context: RatingContext) {
    if (context.userId !== activeUserId) return;
    personal = context.signedIn ? context.ratings[featureId] ?? null : null;
    const row = context.stats[featureId];
    avg = row?.avg_rating == null ? null : Number(row.avg_rating);
    votes = Number(row?.vote_count ?? 0);
    deltaLabel = '';
    if (personal != null && avg != null && Math.abs(personal - avg) > 1.5) {
      deltaLabel = personal > avg ? 'You value this more' : 'You value this less';
    }
  }

  async function refreshContext() {
    applyContext(await loadRatingContext());
  }

  async function applySession(supabase: SupabaseClient<Database>, session: Session | null) {
    activeUserId = session?.user.id ?? '';
    invalidateRatingContext();

    if (!session) {
      personal = null;
      deltaLabel = '';
      return;
    }

    const userId = session.user.id;
    const context = await loadRatingContext();
    if (activeUserId === userId) applyContext(context);
  }

  onMount(() => {
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      if (hasSupabaseConfig()) {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        activeUserId = data.session?.user.id ?? '';
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
          void applySession(supabase, session);
        });
        unsubscribe = () => subscription.subscription.unsubscribe();
      }
      await refreshContext();
    })();

    return () => {
      unsubscribe?.();
    };
  });
</script>

{#if personal || avg}
  <div class="feature-rating" aria-label="Feature rating summary">
    {#if personal}
      <span title="Your rating">{personal} ★ mine</span>
    {/if}
    {#if avg}
      <span title="Community average">{avg.toFixed(1)} ★ · {votes} vote{votes === 1 ? '' : 's'}</span>
    {/if}
    {#if deltaLabel}
      <strong>{deltaLabel}</strong>
    {/if}
  </div>
{/if}

<style>
  .feature-rating { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .feature-rating span, .feature-rating strong {
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
