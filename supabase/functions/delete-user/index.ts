import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) {
    console.error('delete-user: missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  // Distinguishing a missing Authorization header (client problem, 401)
  // from missing server-side env vars (server problem, 500) avoids burying
  // real 500s under a generic "Missing server configuration or auth header"
  // and lets alerting tell client misuse from operational incidents.
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  // Identity check on the anon client + Authorization header so PostgREST
  // resolves auth.uid() correctly inside the RPC. See secrets-and-encryption.md.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return jsonResponse({ error: 'Unauthorized' }, 401);

  // The RPC does the audit insert + auth.users delete in a single
  // transaction (see 20260523000003_delete_my_account_rpc.sql) — atomic,
  // and no service-role key needed in this function anymore.
  const { error: rpcError } = await userClient.rpc('delete_my_account');
  if (rpcError) {
    console.error('delete_my_account rpc failed', { userId: userData.user.id, rpcError });
    return jsonResponse({ error: 'Unable to delete account' }, 500);
  }

  return jsonResponse({ ok: true }, 200);
});
