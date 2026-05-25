<script lang="ts">
  import { onMount } from 'svelte';
  import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
  import type { Feature } from '../data/schema';
  import { deleteRating, fetchMyRatings, upsertRating, type RatingMap } from '../lib/ratings';
  import { deleteSkip, fetchMySkips, type SkipMap } from '../lib/skips';
  import { getSupabase, hasSupabaseConfig, type Database } from '../lib/supabase';
  import StarRating from './StarRating.svelte';

  export let features: Feature[] = [];

  let user: User | null = null;
  let ratings: RatingMap = {};
  let skips: SkipMap = {};
  let loading = true;
  let error = '';
  let activeUserId = '';

  async function applySession(supabase: SupabaseClient<Database>, session: Session | null) {
    user = session?.user ?? null;
    activeUserId = user?.id ?? '';
    if (!user) {
      ratings = {};
      skips = {};
      return;
    }

    const userId = user.id;
    const [nextRatings, nextSkips] = await Promise.all([fetchMyRatings(supabase), fetchMySkips(supabase)]);
    if (activeUserId === userId) {
      ratings = nextRatings;
      skips = nextSkips;
    }
  }

  onMount(() => {
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      if (!hasSupabaseConfig()) {
        loading = false;
        return;
      }
      const supabase = await getSupabase();
      const { data } = await supabase.auth.getSession();
      await applySession(supabase, data.session);
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        void applySession(supabase, session);
      });
      unsubscribe = () => subscription.subscription.unsubscribe();
      loading = false;
    })();

    return () => {
      unsubscribe?.();
    };
  });

  async function setRating(featureId: string, rating: number) {
    if (!user) return;
    const supabase = await getSupabase();
    await upsertRating(supabase, user.id, featureId, rating);
    ratings = { ...ratings, [featureId]: rating };
    if (skips[featureId]) {
      try {
        await deleteSkip(supabase, featureId);
      } catch (err) {
        console.warn('Failed to clear skip after rating', err);
      }
      const next = { ...skips };
      delete next[featureId];
      skips = next;
    }
  }

  async function clearSkip(featureId: string) {
    await deleteSkip(await getSupabase(), featureId);
    const next = { ...skips };
    delete next[featureId];
    skips = next;
  }

  async function clearRating(featureId: string) {
    await deleteRating(await getSupabase(), featureId);
    const next = { ...ratings };
    delete next[featureId];
    ratings = next;
  }
</script>

<section class="manage">
  <header>
    <p class="manage__eyebrow">Edit ratings</p>
    <h2>Your feature weights</h2>
    <p>{Object.keys(ratings).length} / {features.length} rated</p>
  </header>

  {#if loading}
    <p>Loading...</p>
  {:else if !hasSupabaseConfig()}
    <p>Supabase is not configured.</p>
  {:else if !user}
    <p><a href="/rate">Sign in on the rating page</a> to manage your votes.</p>
  {:else}
    <div class="manage__list">
      {#each features as feature}
        <article class="manage__row">
          <div>
            <h3>
              {feature.label}
              {#if skips[feature.id]}<span class="manage__badge">Skipped</span>{/if}
            </h3>
            <p>{feature.shortDescription}</p>
          </div>
          <div class="manage__controls">
            <StarRating value={ratings[feature.id] ?? 0} on:change={(event) => setRating(feature.id, event.detail)} />
            {#if ratings[feature.id]}
              <button type="button" on:click={() => clearRating(feature.id)}>Clear</button>
            {:else if skips[feature.id]}
              <button type="button" on:click={() => clearSkip(feature.id)}>Unskip</button>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {/if}
  {#if error}<p class="manage__error">{error}</p>{/if}
</section>

<style>
  .manage { max-width: 980px; margin: 0 auto; }
  .manage__eyebrow { margin: 0 0 8px; color: var(--accent); text-transform: uppercase; letter-spacing: 0.18em; font: 700 0.75rem var(--font-display); }
  h2 { margin: 0; font: 900 clamp(2rem, 5vw, 3rem)/1 var(--font-display); text-transform: uppercase; }
  .manage__list { display: grid; gap: 12px; margin-top: 24px; }
  .manage__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-elev);
    padding: 16px;
  }
  h3 { margin: 0 0 6px; }
  p { margin: 0; color: var(--fg-soft); }
  .manage__controls { display: grid; gap: 8px; justify-items: end; }
  button { border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-row); color: var(--fg); padding: 8px 10px; cursor: pointer; }
  .manage__error { color: var(--cell-no-ink); }
  .manage__badge { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: var(--bg-row); border: 1px solid var(--border); color: var(--fg-soft); font-size: 0.7rem; letter-spacing: 0.12em; vertical-align: middle; }
  @media (max-width: 760px) {
    .manage__row { grid-template-columns: 1fr; }
    .manage__controls { justify-items: start; }
  }
</style>
