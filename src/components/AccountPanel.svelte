<script lang="ts">
  import { onMount } from 'svelte';
  import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
  import { fetchMyRatings } from '../lib/ratings';
  import { getSessionToken, getSupabase, hasSupabaseConfig, type Database } from '../lib/supabase';
  import SignInButton from './SignInButton.svelte';

  let user: User | null = null;
  let ratingCount = 0;
  let status = '';
  let busy = false;
  let activeUserId = '';

  async function applySession(supabase: SupabaseClient<Database>, session: Session | null) {
    user = session?.user ?? null;
    activeUserId = user?.id ?? '';
    if (!user) {
      ratingCount = 0;
      return;
    }

    const userId = user.id;
    const ratings = await fetchMyRatings(supabase);
    if (activeUserId === userId) ratingCount = Object.keys(ratings).length;
  }

  onMount(() => {
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      if (!hasSupabaseConfig()) return;
      const supabase = await getSupabase();
      const { data } = await supabase.auth.getSession();
      await applySession(supabase, data.session);
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        void applySession(supabase, session);
      });
      unsubscribe = () => subscription.subscription.unsubscribe();
    })();

    return () => {
      unsubscribe?.();
    };
  });

  async function exportRatings() {
    const supabase = await getSupabase();
    const { data } = await supabase.auth.getSession();
    const token = getSessionToken(data.session);
    if (!token) return;
    const { data: result, error } = await supabase.functions.invoke('export-ratings', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (error) {
      console.error('export-ratings failed', error);
      status = 'Unable to export your data right now. Please try again later.';
      return;
    }
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ade-arena-export.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (!confirm('Delete your account and all ratings? This cannot be undone.')) return;
    busy = true;
    status = '';
    const supabase = await getSupabase();
    const { error } = await supabase.functions.invoke('delete-user', { method: 'POST' });
    if (error) {
      console.error('delete-user failed', error);
      status = 'Unable to delete your account right now. Please try again later.';
      busy = false;
      return;
    }
    await supabase.auth.signOut();
    window.location.replace('/');
  }
</script>

<section class="account">
  {#if !hasSupabaseConfig()}
    <p>Supabase is not configured.</p>
  {:else if !user}
    <p class="account__signin">
      <SignInButton variant="inline" redirectPath="/account" />
      <span>to manage your account.</span>
    </p>
  {:else}
    <p class="account__meta">Signed in as {user.user_metadata?.user_name ?? user.email ?? user.id}. You have {ratingCount} saved ratings.</p>
    <div class="account__actions">
      <button type="button" on:click={exportRatings}>Export my ratings</button>
      <button class="account__danger" type="button" disabled={busy} on:click={deleteAccount}>Delete my account and all my ratings</button>
    </div>
  {/if}
  {#if status}<p class="account__status">{status}</p>{/if}
</section>

<style>
  .account {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-elev);
    padding: 24px;
  }
  .account__meta { color: var(--fg-soft); }
  .account__actions { display: flex; flex-wrap: wrap; gap: 10px; }
  .account__signin { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  button {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-row);
    color: var(--fg);
    padding: 10px 12px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }
  .account__danger { border-color: var(--cell-no-ink); color: var(--cell-no-ink); }
  .account__status { color: var(--cell-no-ink); }
</style>
