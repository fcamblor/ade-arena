import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) {
    console.error('export-ratings: missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  // 401 for a missing Authorization header (client problem) vs 500 for the
  // server-side env var case above — keeps alerts and access logs honest.
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return jsonResponse({ error: 'Unauthorized' }, 401);

  const [{ data: ratings, error: ratingsError }, { data: skips, error: skipsError }] = await Promise.all([
    supabase
      .from('ratings')
      .select('feature_id, rating, updated_at')
      .order('feature_id', { ascending: true }),
    supabase
      .from('feature_skips')
      .select('feature_id, updated_at')
      .order('feature_id', { ascending: true }),
  ]);
  if (ratingsError || skipsError) {
    console.error('export-ratings query failed', { ratingsError, skipsError });
    return jsonResponse({ error: 'Unable to export your data right now' }, 500);
  }

  // Full GDPR-style "subject access" payload. The previous version
  // returned only ratings + skips, which under-promised against the
  // user's right of access (Art. 15 GDPR). We now also surface the
  // account metadata we hold in auth.users, picking explicit fields
  // rather than spreading the whole user object so future Supabase
  // additions don't leak data we didn't intend to expose.
  const user = userData.user;
  const account = {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    created_at: user.created_at ?? null,
    last_sign_in_at: user.last_sign_in_at ?? null,
    confirmed_at: user.confirmed_at ?? null,
    app_metadata: user.app_metadata ?? {},
    user_metadata: user.user_metadata ?? {},
    identities: (user.identities ?? []).map((identity) => ({
      provider: identity.provider,
      identity_id: identity.identity_id,
      created_at: identity.created_at ?? null,
      last_sign_in_at: identity.last_sign_in_at ?? null,
    })),
  };

  return jsonResponse(
    {
      exported_at: new Date().toISOString(),
      account,
      ratings: ratings ?? [],
      skips: skips ?? [],
    },
    200,
    {
      'Content-Disposition': 'attachment; filename="ade-arena-export.json"',
    },
  );
});
