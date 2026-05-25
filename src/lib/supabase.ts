import type { Session, SupabaseClient } from '@supabase/supabase-js';

export type RatingRow = {
  user_id: string;
  feature_id: string;
  rating: number;
  updated_at: string;
};

export type FeatureStatsRow = {
  feature_id: string;
  avg_rating: number | string | null;
  vote_count: number;
  count_5: number;
  count_4: number;
  count_3: number;
  count_2: number;
  count_1: number;
};

export type CommunityVotersRow = {
  voter_count: number;
};

export type FeatureSkipRow = {
  user_id: string;
  feature_id: string;
  updated_at: string;
};

// `Relationships: []` is required by @supabase/postgrest-js GenericTable /
// GenericView. Leaving it off causes `from('ratings')` to resolve to
// `never`, which then forces `as any` casts on every call site.
export type Database = {
  public: {
    Tables: {
      ratings: {
        Row: RatingRow;
        Insert: { user_id: string; feature_id: string; rating: number; updated_at?: string };
        Update: { rating?: number; updated_at?: string };
        Relationships: [];
      };
      feature_skips: {
        Row: FeatureSkipRow;
        Insert: { user_id: string; feature_id: string; updated_at?: string };
        Update: { updated_at?: string };
        Relationships: [];
      };
    };
    Views: {
      feature_stats: {
        Row: FeatureStatsRow;
        Relationships: [];
      };
      community_voters: {
        Row: CommunityVotersRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
};

// Dynamic import lets Vite/Rollup code-split @supabase/supabase-js into its
// own chunk, so anonymous visitors browsing static pages never pay the
// ~44 KiB (gzipped) cost in the main bundle. The module promise is cached
// so concurrent callers all await the same fetch.
type SupabaseModule = typeof import('@supabase/supabase-js');
let modulePromise: Promise<SupabaseModule> | null = null;
let clientPromise: Promise<SupabaseClient<Database>> | null = null;

export function hasSupabaseConfig(): boolean {
  return Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
}

// Peek at localStorage for a persisted session without instantiating the
// Supabase client. Islands use it to skip the 55 KiB SDK fetch on first
// paint when the visitor is clearly anonymous; the SDK is still loaded
// later on sign-in click (via SignInButton) or after the OAuth callback
// page reloads with a token in storage.
export function hasStoredSession(): boolean {
  if (typeof localStorage === 'undefined') return false;
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  if (!url) return false;
  try {
    const host = new URL(url).host;
    const ref = host.split('.')[0];
    return localStorage.getItem(`sb-${ref}-auth-token`) !== null;
  } catch {
    return false;
  }
}

function loadSupabaseModule(): Promise<SupabaseModule> {
  if (!modulePromise) modulePromise = import('@supabase/supabase-js');
  return modulePromise;
}

export function getSupabase(): Promise<SupabaseClient<Database>> {
  if (!hasSupabaseConfig()) {
    throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY.');
  }
  if (!clientPromise) {
    clientPromise = loadSupabaseModule().then(({ createClient }) =>
      createClient<Database>(
        import.meta.env.PUBLIC_SUPABASE_URL!,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            // Force PKCE so the OAuth callback comes back as `?code=...` (handled
            // explicitly in AuthCallback.svelte). Without this the SDK can fall
            // back to the implicit flow, returning `#access_token=...` in the
            // fragment — which our callback page does not parse, surfacing as
            // "No auth code was returned. Please try signing in again."
            flowType: 'pkce',
            // `detectSessionInUrl: false` because only `/auth/callback` ever
            // sees a `?code=` query string, and that page handles the PKCE
            // exchange explicitly in `AuthCallback.svelte`. Leaving auto-detect
            // on raced the manual exchange (the SDK consumed the code first,
            // then `exchangeCodeForSession` failed with "invalid request").
            detectSessionInUrl: false,
          },
        },
      ),
    );
  }
  return clientPromise;
}

export function getSessionToken(session: Session | null): string | null {
  return session?.access_token ?? null;
}

export function getAuthCallbackUrl(returnTo = '/rate'): string {
  const callbackUrl = new URL('/auth/callback', window.location.origin);
  callbackUrl.searchParams.set('next', normalizeAuthReturnPath(returnTo));
  return callbackUrl.toString();
}

export function getAuthReturnPath(url: URL): string {
  return normalizeAuthReturnPath(url.searchParams.get('next') ?? '/rate');
}

// Restrict OAuth post-auth landings to known internal pages. Anything
// else (typo, phishing chain attempt, stale link) falls back to /rate.
const AUTH_RETURN_WHITELIST = ['/', '/rate', '/account', '/compare', '/privacy'] as const;

function normalizeAuthReturnPath(returnTo: string): string {
  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) return '/rate';
  // Strip query/fragment for the membership check, keep them on the return
  // value so deep-links survive.
  const [path] = returnTo.split(/[?#]/, 1);
  if (AUTH_RETURN_WHITELIST.includes(path as typeof AUTH_RETURN_WHITELIST[number])) return returnTo;
  return '/rate';
}
