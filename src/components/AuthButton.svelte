<script lang="ts">
  import { onMount } from 'svelte';
  import type { User } from '@supabase/supabase-js';
  import { getAuthCallbackUrl, getSupabase, hasSupabaseConfig } from '../lib/supabase';

  let user: User | null = null;
  let ready = false;
  let error = '';

  onMount(() => {
    ready = true;
    if (!hasSupabaseConfig()) return;

    let unsubscribe: (() => void) | undefined;
    void (async () => {
      const supabase = getSupabase();
      const { data } = await supabase.auth.getSession();
      user = data.session?.user ?? null;
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        user = session?.user ?? null;
      });
      unsubscribe = () => subscription.subscription.unsubscribe();
    })();

    return () => {
      unsubscribe?.();
    };
  });

  async function signIn() {
    error = '';
    try {
      const supabase = getSupabase();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: getAuthCallbackUrl(window.location.pathname) },
      });
      if (signInError) error = signInError.message;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to start GitHub sign-in.';
    }
  }

  async function signOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    user = null;
  }
</script>

<div class="auth">
  {#if !ready}
    <span class="auth__muted">Loading session</span>
  {:else if !hasSupabaseConfig()}
    <span class="auth__muted">Ratings disabled</span>
  {:else if user}
    <a class="auth__account" href="/account" title="Account">
      {#if user.user_metadata?.avatar_url}
        <img class="auth__avatar" src={user.user_metadata.avatar_url} alt="" width="22" height="22" />
      {/if}
      <span>{user.user_metadata?.user_name ?? user.email ?? 'Account'}</span>
    </a>
    <button class="auth__button auth__button--ghost" type="button" on:click={signOut}>Sign out</button>
  {:else}
    <button class="auth__button" type="button" on:click={signIn}>
      <svg class="auth__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      <span>Sign in</span>
    </button>
  {/if}
  {#if error}<p class="auth__error">{error}</p>{/if}
</div>

<style>
  .auth {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .auth__button,
  .auth__account {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 14px;
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--fg);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: color .15s ease, border-color .15s ease, background .15s ease;
  }
  .auth__button {
    background: color-mix(in oklch, var(--accent) 14%, transparent);
    border-color: color-mix(in oklch, var(--accent) 40%, transparent);
  }
  .auth__button:hover,
  .auth__button:focus-visible {
    background: color-mix(in oklch, var(--accent) 24%, transparent);
    border-color: var(--accent);
    color: var(--fg);
  }
  .auth__account:hover,
  .auth__account:focus-visible {
    border-color: var(--border-strong);
    background: var(--bg-elev);
    color: var(--fg);
  }
  .auth__button--ghost {
    color: var(--fg-muted);
    background: transparent;
    border-color: var(--border-soft);
  }
  .auth__button--ghost:hover { color: var(--fg); background: var(--bg-elev); }
  .auth__icon { flex-shrink: 0; color: var(--fg-soft); }
  .auth__button .auth__icon { color: currentColor; }
  .auth__avatar {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    object-fit: cover;
    flex-shrink: 0;
  }
  .auth__muted {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 12px;
    color: var(--fg-muted);
    font-size: 0.8rem;
  }
  .auth__error { width: 100%; margin: 0; color: var(--cell-no-ink); font-size: 0.8rem; }
</style>
