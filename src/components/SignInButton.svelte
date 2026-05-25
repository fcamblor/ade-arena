<script lang="ts">
  import { getAuthCallbackUrl, getSupabase } from '../lib/supabase';

  // 'header' — compact, GitHub-icon button for the site header
  // 'cta'    — prominent filled accent button (in-content call-to-action)
  // 'inline' — neutral button that blends with surrounding text/panels
  export let variant: 'header' | 'cta' | 'inline' = 'cta';
  // The path the user should land on once authenticated. Defaults to the
  // current pathname so a sign-in started anywhere returns to that page.
  export let redirectPath: string | undefined = undefined;
  // Override the default label. When omitted, sensible defaults per variant.
  export let label: string | undefined = undefined;

  let signingIn = false;
  let errorMessage = '';

  $: defaultLabel =
    variant === 'header' ? 'Sign in'
    : variant === 'inline' ? 'Sign in with GitHub'
    : 'Sign in with GitHub';
  $: resolvedLabel = label ?? defaultLabel;

  async function handleClick() {
    errorMessage = '';
    // Immediate visual feedback: the OAuth redirect chain (Supabase -> GitHub
    // -> Supabase -> /auth/callback) takes a few hundred ms, during which the
    // originating page would otherwise look frozen.
    signingIn = true;
    try {
      const supabase = getSupabase();
      const path = redirectPath ?? window.location.pathname;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: getAuthCallbackUrl(path) },
      });
      if (error) {
        errorMessage = error.message;
        signingIn = false;
      }
      // On success the browser is navigating away — keep `signingIn = true`
      // so the button stays in its loading state until unload.
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Unable to start GitHub sign-in.';
      signingIn = false;
    }
  }
</script>

<button
  type="button"
  class="signin signin--{variant}"
  class:signin--loading={signingIn}
  on:click={handleClick}
  disabled={signingIn}
  aria-busy={signingIn}
>
  {#if signingIn}
    <span class="signin__spinner" aria-hidden="true"></span>
    <span>Redirecting to GitHub…</span>
  {:else}
    {#if variant === 'header'}
      <svg class="signin__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    {/if}
    <span>{resolvedLabel}</span>
  {/if}
</button>
{#if errorMessage}<p class="signin__error">{errorMessage}</p>{/if}

<style>
  .signin {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: var(--radius-md);
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    transition: color .15s ease, border-color .15s ease, background .15s ease, opacity .15s ease;
  }
  .signin[disabled],
  .signin--loading {
    cursor: progress;
    opacity: 0.85;
  }

  /* ---- variant: header (compact, sits next to brand) ---- */
  .signin--header {
    height: 40px;
    padding: 0 14px;
    font-size: 0.85rem;
    color: var(--fg);
    background: color-mix(in oklch, var(--accent) 14%, transparent);
    border: 1px solid color-mix(in oklch, var(--accent) 40%, transparent);
  }
  .signin--header:hover:not([disabled]),
  .signin--header:focus-visible {
    background: color-mix(in oklch, var(--accent) 24%, transparent);
    border-color: var(--accent);
  }

  /* ---- variant: cta (in-content prominent button) ---- */
  .signin--cta {
    border: 0;
    padding: 10px 16px;
    font-size: 0.95rem;
    font-weight: 800;
    background: var(--accent);
    color: var(--bg);
  }
  .signin--cta:hover:not([disabled]),
  .signin--cta:focus-visible {
    opacity: 0.88;
    color: var(--bg);
  }

  /* ---- variant: inline (subtle, blends with body text) ---- */
  .signin--inline {
    padding: 10px 12px;
    font-weight: 800;
    background: var(--bg-row);
    color: var(--fg);
    border: 1px solid var(--border);
  }
  .signin--inline:hover:not([disabled]),
  .signin--inline:focus-visible {
    border-color: var(--border-strong);
    background: var(--bg-elev);
  }

  .signin__icon {
    flex-shrink: 0;
    color: currentColor;
  }
  .signin__spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid color-mix(in oklch, currentColor 25%, transparent);
    border-top-color: currentColor;
    animation: signin-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes signin-spin {
    to { transform: rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .signin__spinner { animation-duration: 1.5s; }
  }
  .signin__error {
    width: 100%;
    margin: 6px 0 0;
    color: var(--cell-no-ink);
    font-size: 0.8rem;
  }
</style>
