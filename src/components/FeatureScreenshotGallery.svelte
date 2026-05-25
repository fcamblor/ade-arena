<script lang="ts">
  import type { FeatureScreenshot } from '../lib/feature-screenshots';

  export let screenshots: FeatureScreenshot[] = [];
  let selected: FeatureScreenshot | null = null;
  let activeIndex = 0;

  $: visibleScreenshots = screenshots.slice(0, 8);
  $: activeShot = visibleScreenshots[activeIndex] ?? null;
  $: if (activeIndex >= visibleScreenshots.length) activeIndex = Math.max(visibleScreenshots.length - 1, 0);

  function move(direction: -1 | 1) {
    if (visibleScreenshots.length <= 1) return;
    activeIndex = (activeIndex + direction + visibleScreenshots.length) % visibleScreenshots.length;
  }
</script>

{#if screenshots.length > 0}
  <section class="gallery" aria-label="Implementation examples">
    <div class="gallery__head">
      <p>Implementation examples</p>
      {#if visibleScreenshots.length > 1}
        <div class="gallery__controls" aria-label="Screenshot carousel controls">
          <button type="button" aria-label="Previous screenshot" on:click={() => move(-1)}>‹</button>
          <span>{activeIndex + 1} / {visibleScreenshots.length}</span>
          <button type="button" aria-label="Next screenshot" on:click={() => move(1)}>›</button>
        </div>
      {/if}
    </div>
    {#if activeShot}
      <figure class="gallery__slide">
        <button class="gallery__preview" type="button" on:click={() => (selected = activeShot)}>
          <img loading="lazy" src={activeShot.src} alt={activeShot.alt} />
        </button>
        <figcaption>
          <span>{activeShot.toolId}@{activeShot.version}</span>
          <small>{activeShot.caption ?? activeShot.alt}</small>
        </figcaption>
      </figure>
    {/if}
    {#if visibleScreenshots.length > 1}
      <div class="gallery__dots" aria-label="Choose screenshot">
        {#each visibleScreenshots as shot, index}
          <button
            class:active={index === activeIndex}
            type="button"
            aria-label={`Show screenshot ${index + 1}: ${shot.toolId}@${shot.version}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            on:click={() => (activeIndex = index)}
          ></button>
        {/each}
      </div>
    {/if}
  </section>
{/if}

{#if selected}
  <div class="lightbox" role="dialog" aria-modal="true" aria-label="Screenshot preview" tabindex="-1">
    <button class="lightbox__backdrop" type="button" aria-label="Close screenshot preview" on:click={() => (selected = null)}></button>
    <div class="lightbox__panel" role="document">
      <img src={selected.src} alt={selected.alt} />
      <p>{selected.caption ?? selected.alt} · {selected.toolName} v{selected.version}</p>
      <button type="button" on:click={() => (selected = null)}>Close</button>
    </div>
  </div>
{/if}

<style>
  .gallery { margin-top: 20px; display: grid; gap: 10px; }
  .gallery__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .gallery__head p {
    margin: 0;
    color: var(--fg-soft);
    font-weight: 800;
    font-size: 0.9rem;
  }
  .gallery__controls { display: flex; align-items: center; gap: 8px; }
  .gallery__controls button {
    width: 34px;
    height: 34px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-row);
    color: var(--fg);
    font-size: 1.35rem;
    line-height: 1;
    cursor: pointer;
  }
  .gallery__controls span {
    min-width: 42px;
    color: var(--fg-muted);
    font-size: 0.8rem;
    font-weight: 800;
    text-align: center;
  }
  .gallery__slide {
    margin: 0;
    display: grid;
    gap: 8px;
  }
  .gallery__preview {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg);
    padding: 10px;
    cursor: zoom-in;
    display: grid;
    place-items: center;
    min-height: clamp(220px, 42vw, 520px);
  }
  .gallery__preview:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .gallery__preview img {
    width: 100%;
    max-height: clamp(220px, 42vw, 520px);
    object-fit: contain;
    display: block;
    border-radius: var(--radius-sm);
  }
  .gallery__slide figcaption {
    display: grid;
    gap: 2px;
    color: var(--fg-muted);
    font-size: 0.78rem;
  }
  .gallery__slide figcaption span { color: var(--fg-soft); font-weight: 800; }
  .gallery__slide figcaption small {
    max-width: 72ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--fg-muted);
  }
  .gallery__dots {
    display: flex;
    justify-content: center;
    gap: 6px;
  }
  .gallery__dots button {
    width: 8px;
    height: 8px;
    border: 0;
    border-radius: 999px;
    background: var(--border-strong);
    padding: 0;
    cursor: pointer;
  }
  .gallery__dots button.active { background: var(--accent); }
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
    padding: 24px;
    background: oklch(0 0 0 / 0.72);
  }
  .lightbox__backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: transparent;
    cursor: zoom-out;
  }
  .lightbox__panel {
    position: relative;
    z-index: 1;
    max-width: min(980px, 96vw);
    max-height: 92vh;
    margin: 0;
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-elev);
  }
  .lightbox__panel img { max-width: 100%; max-height: 72vh; display: block; object-fit: contain; }
  .lightbox__panel p { margin: 10px 0 0; color: var(--fg-soft); }
  .lightbox__panel button { margin-top: 12px; }
  @media (max-width: 700px) {
    .gallery__controls button { width: 40px; height: 40px; }
    .gallery__preview { min-height: clamp(180px, 58vw, 320px); }
    .gallery__preview img { max-height: clamp(180px, 58vw, 320px); }
    .gallery__slide figcaption small { white-space: normal; }
  }
</style>
