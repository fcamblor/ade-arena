<script lang="ts">
  import { onMount } from 'svelte';
  import type { User } from '@supabase/supabase-js';
  import { getSupabase, hasSupabaseConfig } from '../lib/supabase';
  import SignInButton from './SignInButton.svelte';

  let user: User | null = null;
  let ready = false;

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
    <SignInButton variant="header" />
  {/if}
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
</style>
