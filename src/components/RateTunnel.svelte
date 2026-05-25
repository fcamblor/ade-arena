<script lang="ts">
  import { onMount } from 'svelte';
  import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
  import type { Feature } from '../data/schema';
  import type { FeatureScreenshot } from '../lib/feature-screenshots';
  import { fetchMyRatings, upsertRating, type RatingMap } from '../lib/ratings';
  import { deleteSkip, fetchMySkips, upsertSkip, type SkipMap } from '../lib/skips';
  import { getSupabase, hasSupabaseConfig, type Database } from '../lib/supabase';
  import SignInButton from './SignInButton.svelte';
  import StarRating from './StarRating.svelte';
  import WhyImportantPopover from './WhyImportantPopover.svelte';
  import FeatureScreenshotGallery from './FeatureScreenshotGallery.svelte';
  import ConsentGate from './ConsentGate.svelte';

  export let features: Feature[] = [];
  export let screenshotsByFeature: Record<string, FeatureScreenshot[]> = {};

  let user: User | null = null;
  let ratings: RatingMap = {};
  let skips: SkipMap = {};
  let currentIndex = 0;
  let previousIndexes: number[] = [];
  let loading = true;
  let saving = false;
  let error = '';
  let consent = false;
  let celebration = '';
  let activeUserId = '';
  // Default: skip already-rated features, and ignore skipped ones while non-skipped remain.
  let reviewAll = false;

  $: ratedCount = Object.keys(ratings).length;
  $: currentFeature = features[currentIndex];
  $: complete = features.length > 0 && currentIndex >= features.length;
  $: progressPercent = features.length ? Math.round((ratedCount / features.length) * 100) : 0;
  $: canGoBack = !saving && (reviewAll ? currentIndex > 0 : previousIndexes.length > 0);
  $: currentSkipped = currentFeature ? Boolean(skips[currentFeature.id]) : false;

  async function applySession(supabase: SupabaseClient<Database>, session: Session | null) {
    user = session?.user ?? null;
    activeUserId = user?.id ?? '';
    if (!user) {
      ratings = {};
      skips = {};
      currentIndex = 0;
      previousIndexes = [];
      saving = false;
      celebration = '';
      return;
    }

    const userId = user.id;
    const [nextRatings, nextSkips] = await Promise.all([fetchMyRatings(supabase), fetchMySkips(supabase)]);
    if (activeUserId !== userId) return;
    ratings = nextRatings;
    skips = nextSkips;
    moveToNext(0, false);
  }

  onMount(() => {
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      if (!hasSupabaseConfig()) {
        loading = false;
        return;
      }
      const supabase = getSupabase();
      const { data } = await supabase.auth.getSession();
      await applySession(supabase, data.session);
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        void applySession(supabase, session);
      });
      unsubscribe = () => subscription.subscription.unsubscribe();
      loading = false;
    })();

    const keyHandler = (event: KeyboardEvent) => {
      if (!user || saving || event.defaultPrevented) return;
      const rating = Number(event.key);
      if (rating >= 1 && rating <= 5) void saveRating(rating);
    };
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('keydown', keyHandler);
      unsubscribe?.();
    };
  });

  function findFrom(from: number, predicate: (id: string) => boolean): number {
    for (let i = from; i < features.length; i += 1) {
      if (predicate(features[i].id)) return i;
    }
    return -1;
  }

  function moveToNext(from = 0, rememberCurrent = false) {
    if (rememberCurrent && currentFeature) {
      previousIndexes = [...previousIndexes, currentIndex];
    }
    if (reviewAll) {
      currentIndex = from < features.length ? from : features.length;
      return;
    }
    // 1. Prefer non-rated AND non-skipped (forward, then wrap).
    let next = findFrom(from, (id) => !ratings[id] && !skips[id]);
    if (next < 0) next = findFrom(0, (id) => !ratings[id] && !skips[id]);
    if (next >= 0) {
      currentIndex = next;
      return;
    }
    // 2. Fallback: only skipped (and not yet rated) remain — loop through them.
    next = findFrom(from, (id) => !ratings[id]);
    if (next < 0) next = findFrom(0, (id) => !ratings[id]);
    currentIndex = next >= 0 ? next : features.length;
  }

  function goBack() {
    if (reviewAll) {
      if (currentIndex <= 0) return;
      currentIndex = Math.min(currentIndex, features.length) - 1;
    } else {
      const previousIndex = previousIndexes.at(-1);
      if (previousIndex === undefined) return;
      previousIndexes = previousIndexes.slice(0, -1);
      currentIndex = previousIndex;
    }
    error = '';
    celebration = '';
  }

  async function saveRating(rating: number) {
    if (saving) return;
    if (!user || !currentFeature || !consent) return;
    saving = true;
    error = '';
    const featureId = currentFeature.id;
    try {
      await upsertRating(getSupabase(), user.id, featureId, rating);
      ratings = { ...ratings, [featureId]: rating };
      if (skips[featureId]) {
        try {
          await deleteSkip(getSupabase(), featureId);
        } catch (err) {
          // Non-fatal: rating succeeded; just log silently.
          console.warn('Failed to clear skip after rating', err);
        }
        const nextSkips = { ...skips };
        delete nextSkips[featureId];
        skips = nextSkips;
      }
      const nextCount = Object.keys(ratings).length;
      if (nextCount > 0 && nextCount % 10 === 0) {
        celebration = `${nextCount} down, ${features.length - nextCount} to go - your ranking is taking shape.`;
        window.setTimeout(() => (celebration = ''), 2800);
      }
      moveToNext(currentIndex + 1, true);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to save rating.';
    } finally {
      saving = false;
    }
  }

  async function skipOrKeep() {
    if (saving) return;
    if (!user || !currentFeature) return;
    const featureId = currentFeature.id;
    // If the feature already has a rating or a skip, just navigate forward — no DB write.
    if (ratings[featureId] || skips[featureId]) {
      moveToNext(currentIndex + 1, true);
      return;
    }
    // Writing a skip is a pseudonymised behavioural record — block it until the
    // user has acknowledged the privacy policy, just like saveRating does.
    if (!consent) {
      error = 'Check the privacy policy box above to enable skipping.';
      return;
    }
    saving = true;
    error = '';
    try {
      await upsertSkip(getSupabase(), user.id, featureId);
      skips = { ...skips, [featureId]: true };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to save skip.';
      return;
    } finally {
      saving = false;
    }
    moveToNext(currentIndex + 1, true);
  }

  function toggleReviewAll(event: Event) {
    reviewAll = (event.currentTarget as HTMLInputElement).checked;
    // Keep the user on the current feature; only the navigation mode changes.
    // History from the other mode no longer makes sense here.
    previousIndexes = [];
    if (complete) moveToNext(0, false);
  }
</script>

<section class="rate">
  {#if loading}
    <p class="rate__muted">Loading your rating session...</p>
  {:else if !hasSupabaseConfig()}
    <div class="rate__panel">
      <h2>Ratings are not configured yet</h2>
      <p>Add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` to enable GitHub sign-in and voting.</p>
    </div>
  {:else if !user}
    <div class="rate__panel rate__panel--intro">
      <p class="rate__eyebrow">Personal rating</p>
      <h2>Rate {features.length} features in about 8-10 minutes</h2>
      <p>1 star means totally useless to me. 5 stars means must-have. Rankings use 0, 1, 3, 6, and 10 points.</p>
      <p>Sign in with GitHub. Only your ratings are stored, pseudonymised. You can review or delete your data at any time from your <a href="/account">account page</a>.</p>
      <SignInButton variant="cta" label="Start rating" />
    </div>
  {:else if complete}
    <div class="rate__panel rate__panel--done">
      <p class="rate__eyebrow">Complete</p>
      <h2>Here is your personalized tool ranking</h2>
      <p>You rated {ratedCount} of {features.length} features.</p>
      <div class="rate__actions">
        <a class="rate__link" href="/compare?ranked=personal">See my ranking</a>
        <a class="rate__link rate__link--secondary" href="/compare?ranked=community">See community averages</a>
      </div>
    </div>
  {:else if currentFeature}
    <div class="rate__progress" aria-label={`${ratedCount} of ${features.length} rated`}>
      <span>{ratedCount} / {features.length} rated</span>
      <div><i style={`width: ${progressPercent}%`}></i></div>
    </div>
    <label class="rate__mode">
      <input type="checkbox" checked={reviewAll} on:change={toggleReviewAll} />
      <span>Review every feature (include already rated and skipped)</span>
    </label>
    {#if celebration}<p class="rate__celebration">{celebration}</p>{/if}
    <article class="rate__panel">
      <p class="rate__eyebrow">
        {currentFeature.category}
        {#if currentSkipped}<span class="rate__badge">Skipped</span>{/if}
      </p>
      <h2>{currentFeature.label}</h2>
      <p>{currentFeature.longDescription ?? currentFeature.shortDescription}</p>
      {#if currentFeature.whyImportant}
        <WhyImportantPopover short={currentFeature.whyImportant.short} long={currentFeature.whyImportant.long} />
      {/if}
      <section class="rate__vote" aria-label="Rate this feature">
        <ConsentGate bind:checked={consent} />
        {#key currentFeature.id}
          <StarRating
            value={ratings[currentFeature.id] ?? 0}
            disabled={saving || !consent}
            disabledReason={!consent ? 'Check the privacy policy box above to enable rating.' : saving ? 'Saving your rating...' : ''}
            on:change={(event) => saveRating(event.detail)}
          />
        {/key}
      </section>
      <FeatureScreenshotGallery screenshots={screenshotsByFeature[currentFeature.id] ?? []} />
      <div class="rate__actions">
        <button type="button" disabled={!canGoBack} on:click={goBack}>Previous rating</button>
        <button type="button" on:click={skipOrKeep} disabled={saving}>
          {#if ratings[currentFeature.id]}Keep rating{:else if currentSkipped}Keep skip{:else}Skip for now{/if}
        </button>
        <a class="rate__link rate__link--secondary" href="/">Save & continue later</a>
      </div>
      {#if error}<p class="rate__error">{error}</p>{/if}
    </article>
  {/if}
</section>

<style>
  .rate { max-width: min(1120px, 100%); margin: 0 auto; display: grid; gap: 18px; }
  .rate__panel {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-elev);
    padding: clamp(20px, 4vw, 34px);
    box-shadow: var(--shadow-card);
  }
  .rate__panel--intro, .rate__panel--done { text-align: center; }
  .rate__eyebrow {
    margin: 0 0 10px;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font: 700 0.75rem var(--font-display);
  }
  h2 { margin: 0 0 12px; font: 900 clamp(2rem, 6vw, 3.2rem)/0.95 var(--font-display); text-transform: uppercase; }
  p { color: var(--fg-soft); }
  button, .rate__link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    border: 1px solid var(--accent);
    border-radius: var(--radius-md);
    background: var(--accent);
    color: var(--bg);
    padding: 10px 14px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    text-decoration: none;
  }
  .rate__link--secondary, .rate__actions button { border-color: var(--border); background: var(--bg-row); color: var(--fg); }
  .rate__actions button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
  .rate__actions { margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .rate__vote {
    margin-top: 22px;
    display: grid;
    gap: 16px;
  }
  .rate__progress { display: grid; gap: 8px; color: var(--fg-soft); font-weight: 700; }
  .rate__progress div { height: 8px; border-radius: 999px; background: var(--bg-row); overflow: hidden; border: 1px solid var(--border); }
  .rate__progress i { display: block; height: 100%; background: var(--accent); }
  .rate__error { color: var(--cell-no-ink); }
  .rate__muted { text-align: center; color: var(--fg-muted); }
  .rate__celebration { margin: 0; padding: 10px 12px; border: 1px solid var(--cell-partial); border-radius: var(--radius-md); background: color-mix(in oklch, var(--cell-partial) 40%, transparent); color: var(--cell-partial-ink); }
  .rate__mode { display: inline-flex; gap: 8px; align-items: center; color: var(--fg-soft); font-size: 0.9rem; cursor: pointer; }
  .rate__mode input { width: 16px; height: 16px; cursor: pointer; }
  .rate__badge { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: var(--bg-row); border: 1px solid var(--border); color: var(--fg-soft); font-size: 0.7rem; letter-spacing: 0.12em; }
</style>
