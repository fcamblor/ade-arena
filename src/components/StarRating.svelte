<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let value = 0;
  export let disabled = false;
  export let disabledReason = '';

  let preview = 0;
  const labels = ['useless', 'low priority', 'useful', 'important', 'must-have'];
  const points = [0, 1, 3, 6, 10];
  const dispatch = createEventDispatcher<{ change: number }>();

  function choose(rating: number) {
    if (disabled) return;
    value = rating;
    dispatch('change', rating);
  }

  function showPreview(rating: number) {
    if (disabled) return;
    preview = rating;
  }
</script>

<div class:stars--disabled={disabled} class="stars-wrap" title={disabledReason}>
  <div class="stars" role="radiogroup" aria-label="Feature importance">
    {#each labels as label, index}
      {@const rating = index + 1}
      <div class="stars__item">
        <button
          class:active={(preview || value) >= rating}
          class="stars__button"
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating} star${rating > 1 ? 's' : ''}: ${label}${disabledReason ? `. ${disabledReason}` : ''}`}
          disabled={disabled}
          on:mouseenter={() => showPreview(rating)}
          on:mouseleave={() => (preview = 0)}
          on:focus={() => showPreview(rating)}
          on:blur={() => (preview = 0)}
          on:click={() => choose(rating)}
        >★</button>
        <!-- The legend mirrors the button as a click target so the whole
             option (star + label) feels interactive; the button above keeps
             keyboard/AT semantics, hence aria-hidden here. -->
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <span
          class="stars__legend"
          aria-hidden="true"
          on:mouseenter={() => showPreview(rating)}
          on:mouseleave={() => (preview = 0)}
          on:click={() => choose(rating)}
        >
          <span>{rating}★</span>
          <strong>{label}</strong>
          <em>{points[index]} point{points[index] === 1 ? '' : 's'}</em>
        </span>
      </div>
    {/each}
  </div>
  {#if disabledReason}
    <p class="stars__disabled-note">{disabledReason}</p>
  {/if}
</div>

<style>
  .stars-wrap {
    display: grid;
    gap: 8px;
  }
  .stars {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }
  .stars__item {
    min-width: 0;
    display: grid;
    justify-items: center;
    gap: 8px;
  }
  .stars__button {
    width: 48px;
    height: 48px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-row);
    color: var(--fg-faint);
    font-size: 1.75rem;
    line-height: 1;
    cursor: pointer;
  }
  .stars__button.active { color: var(--cell-partial-ink); border-color: color-mix(in oklch, var(--cell-partial-ink) 65%, var(--border)); }
  .stars__button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .stars__button:disabled { cursor: not-allowed; opacity: 0.58; }
  .stars-wrap.stars--disabled .stars__legend { opacity: 0.72; }
  .stars__disabled-note {
    margin: 0;
    padding: 9px 11px;
    border: 1px solid color-mix(in oklch, var(--accent) 35%, var(--border));
    border-radius: var(--radius-sm);
    background: color-mix(in oklch, var(--accent) 10%, var(--bg-row));
    color: var(--fg-soft);
    font-size: 0.82rem;
    line-height: 1.35;
  }
  .stars__legend {
    width: 100%;
    min-width: 0;
    display: grid;
    gap: 1px;
    padding: 6px;
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-sm);
    background: var(--bg-row);
    color: var(--fg-muted);
    font-size: 0.74rem;
    text-align: center;
    cursor: pointer;
  }
  .stars-wrap.stars--disabled .stars__legend { cursor: not-allowed; }
  .stars__legend span,
  .stars__legend strong,
  .stars__legend em {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .stars__legend span { color: var(--cell-partial-ink); font-weight: 900; }
  .stars__legend strong { color: var(--fg-soft); font-size: 0.72rem; line-height: 1.1; }
  .stars__legend em { color: var(--fg-muted); font-style: normal; font-size: 0.7rem; }
  @media (max-width: 640px) {
    .stars { grid-template-columns: 1fr; }
    .stars__item {
      grid-template-columns: 48px 1fr;
      align-items: center;
      justify-items: stretch;
    }
    .stars__legend {
      grid-template-columns: 34px 1fr auto;
      align-items: center;
      gap: 8px;
      text-align: left;
    }
  }
</style>
