import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase, hasStoredSession, hasSupabaseConfig, type Database, type FeatureStatsRow } from './supabase';
import { fetchFeatureStats, fetchMyRatings, fetchUniqueVoterCount, type RatingMap } from './ratings';
import { fetchMySkips, type SkipMap } from './skips';
import { EMPTY_PREFERENCES, fetchMyPreferences, type UserPreferences } from './preferences';

// Shared, per-page session-data layer consumed by every island that reads the
// signed-in user's ratings/preferences and the auth-gated community stats
// (ComparisonRankings, FeatureRatingSummaries, ProgressNudge, …).
//
// Why this exists: each island used to run its own `getSession()` +
// `onAuthStateChange` + fetch pipeline. Because the SDK replays an
// `INITIAL_SESSION` event the instant you subscribe, every island fetched its
// data twice on first paint, and three islands fetching the same rows meant a
// single home render fired 6× /ratings, 4× /feature_stats, 2× /user_preferences
// and 2× /community_voters. This module collapses all of that into a single
// auth subscription and one in-flight promise per resource, shared across
// islands and invalidated only when the signed-in identity actually changes.

export type SessionSnapshot = {
  signedIn: boolean;
  /** Empty string when anonymous. */
  userId: string;
};

export type CommunityStats = {
  stats: Record<string, FeatureStatsRow>;
  voterCount: number;
};

type Listener = (snapshot: SessionSnapshot) => void;

let currentUserId = '';
const listeners = new Set<Listener>();

// One memoized in-flight promise per resource, keyed implicitly by the current
// identity: `invalidate()` drops them all whenever the identity changes, so a
// stale promise can never leak across a sign-in/sign-out boundary.
let ratingsPromise: Promise<RatingMap> | null = null;
let skipsPromise: Promise<SkipMap> | null = null;
let preferencesPromise: Promise<UserPreferences> | null = null;
let featureStatsPromise: Promise<Record<string, FeatureStatsRow>> | null = null;
let voterCountPromise: Promise<number> | null = null;

// Resolves once the single auth subscription has delivered its first
// (INITIAL_SESSION) event, exposing the initial identity. Memoized so every
// island awaiting it shares the one subscription.
let readyPromise: Promise<SessionSnapshot> | null = null;

function invalidate(): void {
  ratingsPromise = null;
  skipsPromise = null;
  preferencesPromise = null;
  featureStatsPromise = null;
  voterCountPromise = null;
}

/**
 * Drop the cached per-user data (ratings, skips, preferences) after a mutation
 * so any later read on the same page sees fresh values. Community stats are
 * left intact — they aren't written from the client. Callers that keep their
 * own optimistic local copy still call this to keep the shared cache honest.
 */
export function invalidateUserData(): void {
  ratingsPromise = null;
  skipsPromise = null;
  preferencesPromise = null;
}

function notify(snapshot: SessionSnapshot): void {
  for (const listener of listeners) listener(snapshot);
}

function snapshot(): SessionSnapshot {
  return { signedIn: Boolean(currentUserId), userId: currentUserId };
}

/**
 * Resolve (and lazily wire) the shared session layer. Returns the current
 * identity. Anonymous visitors — no Supabase config or no persisted token —
 * resolve immediately WITHOUT instantiating the SDK, preserving the
 * "don't ship 55 KiB to anon" optimization the islands relied on.
 */
export function ensureSessionData(): Promise<SessionSnapshot> {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    if (!hasSupabaseConfig() || !hasStoredSession()) {
      currentUserId = '';
      return snapshot();
    }
    const supabase = await getSupabase();
    return await subscribe(supabase);
  })();
  return readyPromise;
}

function subscribe(supabase: SupabaseClient<Database>): Promise<SessionSnapshot> {
  return new Promise<SessionSnapshot>((resolve) => {
    let resolved = false;
    supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? '';
      if (!resolved) {
        // INITIAL_SESSION: seed the identity and unblock awaiting islands.
        // No `notify()` here — islands render off this resolved snapshot.
        resolved = true;
        currentUserId = userId;
        resolve(snapshot());
        return;
      }
      // Subsequent events. Ignore same-identity churn (TOKEN_REFRESHED,
      // duplicate SIGNED_IN) so a token refresh never re-fetches anything.
      if (userId === currentUserId) return;
      currentUserId = userId;
      invalidate();
      notify(snapshot());
    });
  });
}

/**
 * Subscribe to identity changes (sign-in as a different user, sign-out). The
 * caller's data caches have already been invalidated by the time the listener
 * fires, so it can re-read via the accessors below and get fresh values.
 * Returns an unsubscribe function.
 */
export function onSessionChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSessionUserId(): string {
  return currentUserId;
}

export function getRatings(): Promise<RatingMap> {
  if (!currentUserId) return Promise.resolve({});
  if (!ratingsPromise) {
    ratingsPromise = getSupabase().then(fetchMyRatings);
  }
  return ratingsPromise;
}

export function getSkips(): Promise<SkipMap> {
  if (!currentUserId) return Promise.resolve({});
  if (!skipsPromise) {
    skipsPromise = getSupabase().then(fetchMySkips);
  }
  return skipsPromise;
}

export function getPreferences(): Promise<UserPreferences> {
  if (!currentUserId) return Promise.resolve({ ...EMPTY_PREFERENCES });
  if (!preferencesPromise) {
    preferencesPromise = getSupabase().then(fetchMyPreferences);
  }
  return preferencesPromise;
}

// Community stats are auth-gated (ADR 003): anonymous visitors get empty data
// with no network call. Loaded once per page; a reload picks up newer numbers.
export function getFeatureStats(): Promise<Record<string, FeatureStatsRow>> {
  if (!currentUserId) return Promise.resolve({});
  if (!featureStatsPromise) {
    featureStatsPromise = getSupabase()
      .then(fetchFeatureStats)
      .catch((err) => {
        // A silently-expired JWT or transient PostgREST error shouldn't turn
        // the leaderboard into a row of zeros without any console trail.
        console.warn('fetchFeatureStats failed', err);
        return {} as Record<string, FeatureStatsRow>;
      });
  }
  return featureStatsPromise;
}

export function getVoterCount(): Promise<number> {
  if (!currentUserId) return Promise.resolve(0);
  if (!voterCountPromise) {
    voterCountPromise = getSupabase().then(fetchUniqueVoterCount);
  }
  return voterCountPromise;
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const [stats, voterCount] = await Promise.all([getFeatureStats(), getVoterCount()]);
  return { stats, voterCount };
}
