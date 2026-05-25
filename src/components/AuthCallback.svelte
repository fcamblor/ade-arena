<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuthReturnPath, getSupabase, hasSupabaseConfig } from '../lib/supabase';

  let message = 'Completing GitHub sign-in...';

  onMount(async () => {
    if (!hasSupabaseConfig()) {
      message = 'Supabase is not configured.';
      return;
    }
    const supabase = getSupabase();

    const url = new URL(window.location.href);
    const returnPath = getAuthReturnPath(url);
    const code = url.searchParams.get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        message = error.message;
        return;
      }
      window.location.replace(returnPath);
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      window.location.replace(returnPath);
      return;
    }

    message = 'No auth code was returned. Please try signing in again.';
  });
</script>

<p>{message}</p>
