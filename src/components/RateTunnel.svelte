<script lang="ts">
  import { onMount } from 'svelte';
  import type { Feature } from '../data/schema';
  import type { FeatureScreenshot } from '../lib/feature-screenshots';
  import { upsertRating, type RatingMap } from '../lib/ratings';
  import { deleteSkip, upsertSkip, type SkipMap } from '../lib/skips';
  import {
    DAILY_OS_OPTIONS,
    EMPTY_PREFERENCES,
    upsertPreferences,
    type DailyOs,
    type UserPreferences,
  } from '../lib/preferences';
  import { getSupabase, hasSupabaseConfig } from '../lib/supabase';
  import {
    ensureSessionData,
    getPreferences,
    getRatings,
    getSkips,
    invalidateUserData,
    onSessionChange,
  } from '../lib/session-data';
  import SignInButton from './SignInButton.svelte';
  import StarRating from './StarRating.svelte';
  import WhyImportantPopover from './WhyImportantPopover.svelte';
  import FeatureScreenshotGallery from './FeatureScreenshotGallery.svelte';
  import ConsentGate from './ConsentGate.svelte';

  export let features: Feature[] = [];
  export let screenshotsByFeature: Record<string, FeatureScreenshot[]> = {};

  let ratings: RatingMap = {};
  let skips: SkipMap = {};
  let prefs: UserPreferences = { ...EMPTY_PREFERENCES };
  // The tunnel opens on the preference questions, then moves on to features.
  let phase: 'prefs' | 'features' = 'prefs';
  let prefStep = 0;
  let currentIndex = 0;
  let loading = true;
  let saving = false;
  let error = '';
  let consent = false;
  let celebration = '';
  let activeUserId = '';

  // The three preference steps shown before the feature tunnel, in order.
  const PREF_STEPS = ['os', 'opensource', 'pay'] as const;

  $: ratedCount = Object.keys(ratings).length;
  $: currentFeature = features[currentIndex];
  $: complete = phase === 'features' && features.length > 0 && currentIndex >= features.length;
  $: progressPercent = features.length ? Math.round((ratedCount / features.length) * 100) : 0;
  // In the preferences phase only the first step has nothing before it. In the
  // features phase "Previous" can always step back — eventually into prefs.
  $: canGoBack = !saving && (phase === 'prefs' ? prefStep > 0 : true);
  // Forward browsing stops on the last feature; reaching the "complete" screen
  // is reserved for the smart auto-advance once nothing is left to rate.
  $: atLastFeature = currentIndex >= features.length - 1;
  $: currentSkipped = currentFeature ? Boolean(skips[currentFeature.id]) : false;

  async function loadSession(userId: string) {
    activeUserId = userId;
    if (!userId) {
      ratings = {};
      skips = {};
      prefs = { ...EMPTY_PREFERENCES };
      phase = 'prefs';
      prefStep = 0;
      currentIndex = 0;
      saving = false;
      celebration = '';
      return;
    }

    // All three reads go through the shared session-data layer, so they are
    // deduplicated with the other islands on the page (e.g. ProgressNudge) and
    // not refetched on the SDK's redundant INITIAL_SESSION replay.
    const [nextRatings, nextSkips, nextPrefs] = await Promise.all([
      getRatings(),
      getSkips(),
      getPreferences(),
    ]);
    if (activeUserId !== userId) return;
    ratings = nextRatings;
    skips = nextSkips;
    prefs = nextPrefs;
    // Returning users who already went through the preference questions jump
    // straight to the features; newcomers start on the preferences. They can
    // still revisit prefs via "Previous" from the first feature.
    if (prefsAnswered(nextPrefs)) {
      phase = 'features';
      prefStep = 0;
      moveToNext(0);
    } else {
      phase = 'prefs';
      prefStep = 0;
    }
  }

  function prefsAnswered(value: UserPreferences): boolean {
    return value.dailyOs.length > 0 || value.opensourceImportance !== null || value.willingToPay !== null;
  }

  onMount(() => {
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      if (!hasSupabaseConfig()) {
        loading = false;
        return;
      }
      const snap = await ensureSessionData();
      await loadSession(snap.userId);
      unsubscribe = onSessionChange((next) => {
        void loadSession(next.userId);
      });
      loading = false;
    })();

    const keyHandler = (event: KeyboardEvent) => {
      if (!activeUserId || saving || event.defaultPrevented || phase !== 'features') return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goBack();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goForward();
        return;
      }
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

  // Smart auto-advance used by rating/skip: jump to the next feature that still
  // needs attention. Manual browsing (Prev/Next) is linear and lives elsewhere.
  function moveToNext(from = 0) {
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

  function backToLastPrefStep() {
    phase = 'prefs';
    prefStep = PREF_STEPS.length - 1;
  }

  // Linear backward browse: step one feature back, falling into the last
  // preference step once we walk off the start of the list.
  function goBack() {
    if (phase === 'prefs') {
      if (prefStep > 0) prefStep -= 1;
      error = '';
      celebration = '';
      return;
    }
    if (currentIndex <= 0) {
      backToLastPrefStep();
    } else {
      currentIndex = Math.min(currentIndex, features.length - 1) - 1;
    }
    error = '';
    celebration = '';
  }

  // Linear forward browse: step one feature forward, clamped to the last one so
  // browsing never short-circuits to the completion screen.
  function goForward() {
    if (phase !== 'features' || !features.length) return;
    currentIndex = Math.min(currentIndex + 1, features.length - 1);
    error = '';
    celebration = '';
  }

  async function savePreferences(next: UserPreferences) {
    prefs = next;
    if (!activeUserId) return;
    if (!consent) {
      error = 'Check the privacy policy box above to save your preferences.';
      return;
    }
    error = '';
    try {
      const supabase = await getSupabase();
      await upsertPreferences(supabase, activeUserId, next);
      invalidateUserData();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to save your preferences.';
    }
  }

  function toggleDailyOs(os: DailyOs) {
    const nextOs = prefs.dailyOs.includes(os)
      ? prefs.dailyOs.filter((value) => value !== os)
      : [...prefs.dailyOs, os];
    void savePreferences({ ...prefs, dailyOs: nextOs });
  }

  function setOpensourceImportance(rating: number) {
    void savePreferences({ ...prefs, opensourceImportance: rating });
  }

  function setWillingToPay(value: boolean) {
    const next = prefs.willingToPay === value ? null : value;
    void savePreferences({ ...prefs, willingToPay: next });
  }

  function prefNext() {
    error = '';
    if (prefStep < PREF_STEPS.length - 1) {
      prefStep += 1;
      return;
    }
    phase = 'features';
    moveToNext(0);
  }

  async function saveRating(rating: number) {
    if (saving) return;
    if (!activeUserId || !currentFeature || !consent) return;
    saving = true;
    error = '';
    const featureId = currentFeature.id;
    try {
      const supabase = await getSupabase();
      await upsertRating(supabase, activeUserId, featureId, rating);
      ratings = { ...ratings, [featureId]: rating };
      if (skips[featureId]) {
        try {
          await deleteSkip(supabase, featureId);
        } catch (err) {
          // Non-fatal: rating succeeded; just log silently.
          console.warn('Failed to clear skip after rating', err);
        }
        const nextSkips = { ...skips };
        delete nextSkips[featureId];
        skips = nextSkips;
      }
      // Keep the shared cache honest for any later reader on this page; the
      // local `ratings`/`skips` above already drive this island's own UI.
      invalidateUserData();
      const nextCount = Object.keys(ratings).length;
      if (nextCount > 0 && nextCount % 10 === 0) {
        celebration = `${nextCount} down, ${features.length - nextCount} to go - your ranking is taking shape.`;
        window.setTimeout(() => (celebration = ''), 2800);
      }
      moveToNext(currentIndex + 1);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to save rating.';
    } finally {
      saving = false;
    }
  }

  async function skipOrKeep() {
    if (saving) return;
    if (!activeUserId || !currentFeature) return;
    const featureId = currentFeature.id;
    // If the feature already has a rating or a skip, just navigate forward — no DB write.
    if (ratings[featureId] || skips[featureId]) {
      moveToNext(currentIndex + 1);
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
      const supabase = await getSupabase();
      await upsertSkip(supabase, activeUserId, featureId);
      skips = { ...skips, [featureId]: true };
      invalidateUserData();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to save skip.';
      return;
    } finally {
      saving = false;
    }
    moveToNext(currentIndex + 1);
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
  {:else if !activeUserId}
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
  {:else if phase === 'prefs'}
    <div class="rate__progress" aria-label={`Preference question ${prefStep + 1} of ${PREF_STEPS.length}`}>
      <span>Preferences · step {prefStep + 1} / {PREF_STEPS.length}</span>
      <div><i style={`width: ${Math.round(((prefStep + 1) / PREF_STEPS.length) * 100)}%`}></i></div>
    </div>
    <article class="rate__panel">
      <p class="rate__eyebrow">About you</p>
      <ConsentGate bind:checked={consent} />
      {#if PREF_STEPS[prefStep] === 'os'}
        <h2>Which OS do you use daily?</h2>
        <p>
          Tools that don't support <strong>all</strong> the OS you pick are dropped from your personal ranking.
          A web-based tool always counts. Leave everything unchecked to keep every tool.
        </p>
        <div class="rate__choices" role="group" aria-label="Daily operating systems">
          {#each DAILY_OS_OPTIONS as option}
            <label class="rate__choice" class:rate__choice--on={prefs.dailyOs.includes(option.value)}>
              <input
                type="checkbox"
                checked={prefs.dailyOs.includes(option.value)}
                disabled={!consent}
                on:change={() => toggleDailyOs(option.value)}
              />
              <span>{option.label}</span>
            </label>
          {/each}
        </div>
      {:else if PREF_STEPS[prefStep] === 'opensource'}
        <h2>How much do you value an open-source codebase?</h2>
        <p>This weights an open-source bonus in your personal ranking, exactly like a feature you rate.</p>
        <section class="rate__vote" aria-label="Open-source importance">
          <StarRating
            value={prefs.opensourceImportance ?? 0}
            disabled={!consent}
            disabledReason={!consent ? 'Check the privacy policy box above to enable this.' : ''}
            on:change={(event) => setOpensourceImportance(event.detail)}
          />
        </section>
      {:else}
        <h2>Would you be willing to pay for an ADE?</h2>
        <p>This is counted on the side — it does not change any tool's score.</p>
        <div class="rate__choices" role="group" aria-label="Willingness to pay">
          <button
            type="button"
            class="rate__toggle"
            class:rate__toggle--on={prefs.willingToPay === true}
            disabled={!consent}
            aria-pressed={prefs.willingToPay === true}
            on:click={() => setWillingToPay(true)}
          >Yes</button>
          <button
            type="button"
            class="rate__toggle"
            class:rate__toggle--on={prefs.willingToPay === false}
            disabled={!consent}
            aria-pressed={prefs.willingToPay === false}
            on:click={() => setWillingToPay(false)}
          >No</button>
        </div>
      {/if}
      <div class="rate__actions">
        <button type="button" disabled={!canGoBack} on:click={goBack}>Previous</button>
        <button type="button" on:click={prefNext}>
          {#if prefStep < PREF_STEPS.length - 1}Next{:else}Start rating features{/if}
        </button>
        <a class="rate__link rate__link--secondary" href="/">Save & continue later</a>
      </div>
      {#if error}<p class="rate__error">{error}</p>{/if}
    </article>
  {:else if currentFeature}
    <div class="rate__progress" aria-label={`${ratedCount} of ${features.length} rated`}>
      <div class="rate__progress-head">
        <span>{ratedCount} / {features.length} rated</span>
        <nav class="rate__nav" aria-label="Browse features">
          <button
            type="button"
            class="rate__step"
            on:click={goBack}
            disabled={!canGoBack}
            aria-label="Previous feature"
          >‹</button>
          <span class="rate__pos"><span class="rate__pos-hash">#</span>{currentIndex + 1}</span>
          <button
            type="button"
            class="rate__step"
            on:click={goForward}
            disabled={saving || atLastFeature}
            aria-label="Next feature"
          >›</button>
        </nav>
      </div>
      <div class="rate__bar"><i style={`width: ${progressPercent}%`}></i></div>
    </div>
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
  .rate__progress-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .rate__bar { height: 8px; border-radius: 999px; background: var(--bg-row); overflow: hidden; border: 1px solid var(--border); }
  .rate__bar i { display: block; height: 100%; background: var(--accent); transition: width 320ms cubic-bezier(0.22, 1, 0.36, 1); }
  .rate__nav { display: inline-flex; align-items: center; gap: 4px; }
  .rate__pos {
    min-width: 3.5ch;
    text-align: center;
    font-variant-numeric: tabular-nums;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    color: var(--fg-muted);
  }
  .rate__pos-hash { opacity: 0.5; }
  .rate__step {
    min-height: 30px;
    min-width: 30px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-row);
    color: var(--fg);
    font: 700 1.1rem/1 var(--font-display);
    cursor: pointer;
    transition: border-color 140ms ease, color 140ms ease, transform 140ms ease;
  }
  .rate__step:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .rate__step:active:not(:disabled) { transform: translateY(1px); }
  .rate__step:disabled { cursor: not-allowed; opacity: 0.35; }
  .rate__choices { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 10px; }
  .rate__choice {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-row);
    color: var(--fg);
    font-weight: 700;
    cursor: pointer;
  }
  .rate__choice input { width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; }
  .rate__choice--on { border-color: var(--accent); background: color-mix(in oklch, var(--accent) 12%, var(--bg-row)); }
  .rate__choice:has(input:disabled) { cursor: not-allowed; opacity: 0.55; }
  .rate__toggle {
    min-width: 92px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-row);
    color: var(--fg);
    padding: 12px 18px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }
  .rate__toggle--on { border-color: var(--accent); background: color-mix(in oklch, var(--accent) 18%, var(--bg-row)); }
  .rate__toggle:disabled { cursor: not-allowed; opacity: 0.55; }
  .rate__error { color: var(--cell-no-ink); }
  .rate__muted { text-align: center; color: var(--fg-muted); }
  .rate__celebration { margin: 0; padding: 10px 12px; border: 1px solid var(--cell-partial); border-radius: var(--radius-md); background: color-mix(in oklch, var(--cell-partial) 40%, transparent); color: var(--cell-partial-ink); }
  .rate__badge { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: var(--bg-row); border: 1px solid var(--border); color: var(--fg-soft); font-size: 0.7rem; letter-spacing: 0.12em; }
</style>
