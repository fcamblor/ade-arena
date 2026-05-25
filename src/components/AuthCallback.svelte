<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuthReturnPath, getSupabase, hasSupabaseConfig } from '../lib/supabase';

  // State machine for the callback screen. Default to "in progress" so the
  // first paint shows a spinner — never a transient error message.
  let status: 'pending' | 'error' = 'pending';
  let message = 'Signing you in…';

  onMount(async () => {
    if (!hasSupabaseConfig()) {
      status = 'error';
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
        status = 'error';
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

    status = 'error';
    message = 'No auth code was returned. Please try signing in again.';
  });
</script>

<div class="callback" role="status" aria-live="polite">
  {#if status === 'pending'}
    <span class="callback__spinner" aria-hidden="true"></span>
  {/if}
  <p class="callback__message" class:callback__message--error={status === 'error'}>
    {message}
  </p>
  {#if status === 'error'}
    <a class="callback__retry" href="/">Back to home</a>
  {/if}
</div>

<style>
  .callback {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
  }
  .callback__spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid color-mix(in oklch, var(--fg-muted) 30%, transparent);
    border-top-color: var(--accent);
    animation: callback-spin 0.7s linear infinite;
  }
  .callback__message {
    margin: 0;
    font-size: 0.95rem;
    color: var(--fg-muted);
    letter-spacing: 0.01em;
  }
  .callback__message--error {
    color: var(--fg);
  }
  .callback__retry {
    margin-top: 4px;
    font-size: 0.85rem;
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  @keyframes callback-spin {
    to { transform: rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .callback__spinner { animation-duration: 1.5s; }
  }
</style>
