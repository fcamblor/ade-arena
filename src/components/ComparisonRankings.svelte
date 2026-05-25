<script lang="ts">
  import { onMount } from 'svelte';
  import type { SupabaseClient, Session } from '@supabase/supabase-js';
  import type { RankingToolData } from '../lib/static-comparison';
  import { computeWeightedScores, fetchFeatureStats, fetchMyRatings, fetchUniqueVoterCount, type RatingMap } from '../lib/ratings';
  import { RATABLE_FEATURES } from '../lib/ratable-features';
  import { getSupabase, hasSupabaseConfig, type Database, type FeatureStatsRow } from '../lib/supabase';
  import SignInButton from './SignInButton.svelte';

  export let tools: RankingToolData[] = [];
  export let initialTab: 'objective' | 'personal' | 'community' = 'objective';

  const DEFAULT_VISIBLE_COUNT = 5;
  const PREVIEW_PARAM = 'preview';

  let tab = initialTab;
  let visibleTools: RankingToolData[] = tools.filter((tool) => tool.isDefaultVisible);
  let personalRatings: RatingMap = {};
  let communityStats: Record<string, FeatureStatsRow> = {};
  let uniqueVoterCount = 0;
  let signedIn = false;
  let ready = false;
  let activeUserId = '';
  let showAll = false;

  $: ratedFeatureCount = personalScores[0]?.ratedFeatureCount ?? 0;
  $: totalFeatureCount = RATABLE_FEATURES.length;
  $: hasStartedPersonalRatings = ratedFeatureCount > 0;
  $: hasUnratedPersonalFeatures = ratedFeatureCount < totalFeatureCount;
  $: objectiveScores = visibleTools
    .map((tool) => {
      const yes = tool.features.filter((f) => f.support === 'yes').length;
      const partial = tool.features.filter((f) => f.support === 'partial').length;
      const score = yes + partial * 0.5;
      const percent = tool.features.length ? Math.round((score / tool.features.length) * 1000) / 10 : 0;
      return { toolId: tool.toolId, toolName: tool.toolName, version: tool.version, percent, score, possible: tool.features.length, ratedFeatureCount: tool.features.length };
    })
    .sort((a, b) => b.percent - a.percent || a.toolName.localeCompare(b.toolName));
  $: personalScores = computeWeightedScores(visibleTools, personalRatings);
  $: communityScores = computeWeightedScores(
    visibleTools,
    Object.fromEntries(Object.entries(communityStats).map(([featureId, row]) => [featureId, Number(row.avg_rating ?? 0)])),
  );
  $: activeScores = tab === 'personal' ? personalScores : tab === 'community' ? communityScores : objectiveScores;
  $: visibleScores = showAll ? activeScores : activeScores.slice(0, DEFAULT_VISIBLE_COUNT);
  $: hasMoreScores = activeScores.length > DEFAULT_VISIBLE_COUNT;

  async function applySession(supabase: SupabaseClient<Database>, session: Session | null) {
    const wasSignedIn = signedIn;
    signedIn = Boolean(session);
    activeUserId = session?.user.id ?? '';
    if (!session) {
      personalRatings = {};
      if (wasSignedIn) await refreshCommunityStats(supabase);
      return;
    }

    const userId = session.user.id;
    const ratings = await fetchMyRatings(supabase);
    if (activeUserId === userId) personalRatings = ratings;
    if (!wasSignedIn) await refreshCommunityStats(supabase);
  }

  async function refreshCommunityStats(supabase: SupabaseClient<Database>) {
    // Community stats are auth-gated (see ADR 003). Bail out for anon
    // visitors so we don't hit a 401/403 every minute. Wrap fetches in a
    // try/catch in case the JWT silently expires between two polls.
    if (!signedIn) {
      communityStats = {};
      uniqueVoterCount = 0;
      return;
    }
    try {
      [communityStats, uniqueVoterCount] = await Promise.all([fetchFeatureStats(supabase), fetchUniqueVoterCount(supabase)]);
    } catch (err) {
      // Logged so a silently-expired JWT or a transient PostgREST error
      // doesn't just turn the leaderboard into a row of zeros without
      // any trail in the console.
      console.warn('refreshCommunityStats failed', err);
      communityStats = {};
      uniqueVoterCount = 0;
    }
  }

  function getPreviewToolSet(raw: string): Set<string> {
    const pendingByTool = new Map<string, RankingToolData[]>();
    for (const tool of tools) {
      if (tool.status !== 'waiting-for-review') continue;
      const versions = pendingByTool.get(tool.toolId) ?? [];
      versions.push(tool);
      pendingByTool.set(tool.toolId, versions);
    }

    const unlocked = new Set<string>();
    const entries = raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    for (const entry of entries) {
      if (entry === '*') {
        for (const versions of pendingByTool.values()) {
          for (const version of versions) unlocked.add(`${version.toolId}@${version.version}`);
        }
        continue;
      }

      if (!entry.includes('@')) {
        const versions = pendingByTool.get(entry);
        if (!versions) continue;
        for (const version of versions) unlocked.add(`${version.toolId}@${version.version}`);
        continue;
      }

      unlocked.add(entry);
    }

    return unlocked;
  }

  function applyPreviewParam(raw: string | null) {
    const unlocked = getPreviewToolSet(raw ?? '');
    const defaultByTool = new Map<string, RankingToolData>();
    const previewByTool = new Map<string, RankingToolData>();

    for (const tool of tools) {
      if (tool.isDefaultVisible) defaultByTool.set(tool.toolId, tool);
      if (tool.status === 'waiting-for-review' && unlocked.has(`${tool.toolId}@${tool.version}`) && !previewByTool.has(tool.toolId)) {
        previewByTool.set(tool.toolId, tool);
      }
    }

    const nextTools: RankingToolData[] = [];
    const toolIds = new Set([...defaultByTool.keys(), ...previewByTool.keys()]);
    for (const toolId of toolIds) {
      const tool = previewByTool.get(toolId) ?? defaultByTool.get(toolId);
      if (tool) nextTools.push(tool);
    }
    visibleTools = nextTools;
  }

  function isPreviewScore(score: { toolId: string; version: string }) {
    return visibleTools.some(
      (tool) =>
        tool.toolId === score.toolId &&
        tool.version === score.version &&
        tool.status === 'waiting-for-review',
    );
  }

  onMount(() => {
    let interval: number | undefined;
    let unsubscribe: (() => void) | undefined;

    const params = new URLSearchParams(window.location.search);
    const ranked = params.get('ranked');
    if (ranked === 'personal' || ranked === 'community') tab = ranked;
    applyPreviewParam(params.get(PREVIEW_PARAM));

    void (async () => {
      if (!hasSupabaseConfig()) {
        ready = true;
        return;
      }

      const supabase = getSupabase();
      const { data } = await supabase.auth.getSession();
      await applySession(supabase, data.session);
      await refreshCommunityStats(supabase);
      interval = window.setInterval(() => {
        void refreshCommunityStats(supabase);
      }, 60000);
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        void applySession(supabase, session);
      });
      unsubscribe = () => subscription.subscription.unsubscribe();
      ready = true;
    })();

    return () => {
      if (interval !== undefined) window.clearInterval(interval);
      unsubscribe?.();
    };
  });
</script>

<section class="lb" aria-labelledby="lb-title">
  <header class="lb__header">
    <span class="lb__head">
      <span class="lb__eyebrow" id="lb-title">
        <span class="lb__eyebrow-mark">Leaderboard</span>
      </span>
      <span class="lb__count">{activeScores.length} tools ranked</span>
    </span>
    <div class="lb__tabs" role="tablist" aria-label="Ranking mode">
      <button class:active={tab === 'objective'} type="button" role="tab" aria-selected={tab === 'objective'} on:click={() => (tab = 'objective')}>Coverage</button>
      <button class:active={tab === 'community'} type="button" role="tab" aria-selected={tab === 'community'} on:click={() => (tab = 'community')}>Community</button>
      <button class:active={tab === 'personal'} type="button" role="tab" aria-selected={tab === 'personal'} on:click={() => (tab = 'personal')}>Mine</button>
    </div>
  </header>

  <div class="lb__body">
    {#if tab === 'personal' && ready && !signedIn}
      <div class="lb__hint">
        <p class="lb__hint-text">Sign in to unlock your personal ranking — it's weighted by what you've voted matters most.</p>
        <SignInButton variant="cta" />
      </div>
    {:else if tab === 'community' && ready && !signedIn}
      <div class="lb__hint">
        <p class="lb__hint-text">Sign in to see how the community ranks these tools — voting and reading aggregates both require a GitHub account.</p>
        <SignInButton variant="cta" />
      </div>
    {:else if tab === 'personal' && ready && !hasStartedPersonalRatings}
      <div class="lb__hint">
        <p class="lb__hint-text">You haven't rated any features yet — rate a few to see how the ranking changes.</p>
        <a href="/rate" class="lb__hint-btn">Rate features</a>
      </div>
    {:else}
      {#if tab === 'community' && communityScores[0]?.ratedFeatureCount === 0}
        <p class="lb__notice">Community averages will appear once the first votes are saved.</p>
      {:else if tab === 'community' && uniqueVoterCount > 0}
        <p class="lb__voters">Based on <strong>{uniqueVoterCount}</strong> {uniqueVoterCount === 1 ? 'voter' : 'voters'}</p>
      {/if}
      <ol class="lb__list">
        {#each visibleScores as score, index}
          <li class="lb__row" class:lb__row--first={index === 0}>
            <span class="lb__rank">#{index + 1}</span>
            <span class="lb__name">
              {score.toolName}
              <small>v{score.version}</small>
              {#if isPreviewScore(score)}
                <span class="lb__preview-badge" title="Preview version" aria-label="Preview version">P</span>
              {/if}
            </span>
            <span class="lb__bar"><i style={`width: ${score.percent}%`}></i></span>
            <span class="lb__score">{score.percent}<small>%</small></span>
          </li>
        {/each}
      </ol>
      {#if hasMoreScores}
        <button type="button" class="lb__show-all" on:click={() => (showAll = !showAll)}>
          {showAll ? 'Show top 5' : `Show all ${activeScores.length}`}
        </button>
      {/if}
      {#if tab === 'personal' && ready && hasUnratedPersonalFeatures}
        <p class="lb__inline-note">
          You've scored {ratedFeatureCount} of {totalFeatureCount} features so far —
          <a href="/rate">keep going</a>.
        </p>
      {/if}
    {/if}
  </div>
</section>

<style>
  .lb {
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-lg);
    background: var(--bg-elev);
    overflow: hidden;
  }

  .lb__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    width: 100%;
    padding: var(--s-4);
    border-bottom: 1px solid var(--border-soft);
  }

  .lb__head { display: flex; flex-direction: column; gap: 6px; flex: 1 1 auto; min-width: 0; }
  .lb__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: 0.74rem;
    color: var(--fg-muted);
  }
  .lb__eyebrow-mark {
    color: var(--accent);
    border: 1px solid color-mix(in oklch, var(--accent) 50%, transparent);
    background: color-mix(in oklch, var(--accent) 10%, transparent);
    padding: 4px var(--s-2) 3px;
    border-radius: var(--radius-sm);
  }
  .lb__count {
    color: var(--fg-muted);
    font-size: 0.85rem;
  }

  .lb__body {
    padding: var(--s-4);
  }

  .lb__tabs {
    display: inline-flex;
    flex: 0 0 auto;
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--border-soft);
    border-radius: 999px;
    background: var(--bg);
  }
  .lb__tabs button {
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--fg-muted);
    padding: 6px 14px;
    font: inherit;
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 0.78rem;
    cursor: pointer;
    transition: color .15s ease, background .15s ease;
  }
  .lb__tabs button:hover { color: var(--fg); }
  .lb__tabs button.active {
    color: var(--fg);
    background: color-mix(in oklch, var(--accent) 22%, transparent);
  }

  .lb__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
  .lb__row {
    display: grid;
    grid-template-columns: 36px minmax(150px, 1.35fr) minmax(72px, 1fr) 60px;
    gap: var(--s-3);
    align-items: center;
    padding: 10px var(--s-3);
    border-radius: var(--radius-md);
    background: var(--bg-row);
    border: 1px solid transparent;
  }
  .lb__row--first {
    background: color-mix(in oklch, var(--accent) 8%, var(--bg-row));
    border-color: color-mix(in oklch, var(--accent) 40%, var(--border-soft));
  }
  .lb__rank {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 0.95rem;
    color: var(--fg-muted);
    letter-spacing: 0.02em;
  }
  .lb__row--first .lb__rank { color: var(--accent); }
  .lb__name {
    font-weight: 700;
    color: var(--fg);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .lb__name small { color: var(--fg-muted); font-weight: 500; margin-left: 4px; }
  .lb__preview-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25em;
    height: 1.15em;
    margin-left: 5px;
    border: 1px dashed color-mix(in oklch, #8b5cf6 72%, var(--border-soft));
    border-radius: 3px;
    background: color-mix(in oklch, #8b5cf6 18%, transparent);
    color: #a78bfa;
    font-family: var(--font-display);
    font-size: 0.68rem;
    font-weight: 900;
    line-height: 1;
    vertical-align: 0.08em;
  }
  .lb__bar {
    height: 6px;
    border-radius: 999px;
    background: var(--bg);
    overflow: hidden;
    border: 1px solid var(--border-soft);
  }
  .lb__bar i {
    display: block;
    height: 100%;
    background: var(--cell-yes-ink);
  }
  .lb__row--first .lb__bar i { background: var(--accent); }
  .lb__score {
    justify-self: end;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 1.05rem;
    color: var(--fg);
  }
  .lb__score small { color: var(--fg-muted); font-size: 0.7em; font-weight: 700; margin-left: 1px; }

  .lb__show-all {
    width: 100%;
    margin-top: var(--s-3);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-md);
    background: var(--bg);
    color: var(--fg);
    padding: 10px var(--s-3);
    font: inherit;
    font-family: var(--font-display);
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color .15s ease, background .15s ease;
  }
  .lb__show-all:hover,
  .lb__show-all:focus-visible {
    border-color: var(--border);
    background: color-mix(in oklch, var(--accent) 7%, var(--bg));
    outline: none;
  }

  .lb__hint {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    padding: var(--s-4);
    border: 1px dashed var(--border);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--accent) 4%, transparent);
  }
  .lb__hint-text { margin: 0; color: var(--fg-soft); font-size: 0.95rem; flex: 1 1 240px; }
  .lb__hint-btn {
    display: inline-block;
    border: 0;
    padding: 10px 16px;
    background: var(--accent);
    color: var(--bg);
    font: inherit;
    font-weight: 800;
    border-radius: var(--radius-md);
    cursor: pointer;
    text-decoration: none;
  }
  .lb__hint-btn:hover { opacity: 0.88; color: var(--bg); }
  .lb__notice { color: var(--fg-soft); margin: 0 0 var(--s-3); }
  .lb__voters { margin: 0 0 var(--s-3); color: var(--fg-muted); font-size: 0.85rem; }
  .lb__inline-note {
    margin: var(--s-3) 0 0;
    font-size: 0.85rem;
    color: var(--fg-muted);
  }
  .lb__inline-note a { color: var(--accent); }

  @media (max-width: 600px) {
    .lb__header { align-items: stretch; flex-direction: column; padding: var(--s-3); }
    .lb__body { padding: var(--s-3); }
    .lb__tabs { width: 100%; }
    .lb__tabs button { flex: 1 1 0; padding-inline: var(--s-2); }
    .lb__row { grid-template-columns: 30px minmax(0, 1fr) 54px; row-gap: 6px; }
    .lb__bar { grid-column: 1 / -1; grid-row: 2; }
    .lb__hint { flex-direction: column; align-items: stretch; text-align: left; }
  }
</style>
