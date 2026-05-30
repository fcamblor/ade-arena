<script lang="ts">
  // Shared markup for the Evidence ("Proof") popover card — the backdrop + the
  // `.evidence__card` body (header, lazy-mounted gallery, source quote, footer).
  //
  // This is the single source of truth for that markup, rendered both:
  //   - server-side by `Evidence.astro` (the homepage / comparison table), and
  //   - client-side by `ProofPreview.svelte` (the contribution tunnel preview),
  // so the two can never drift. The surrounding `<details>` + `<summary>`
  // trigger, the global `.evidence__*` stylesheet and the delegated behaviour
  // script all live in `Evidence.astro` and are reused as-is.
  //
  // IMPORTANT: this component intentionally has NO <style> block. It must not
  // introduce a scope class nor any element styling — every `.evidence__*` rule
  // comes from Evidence.astro's global stylesheet. It also must render the
  // backdrop and card as *direct* children of the host <details>, because the
  // global CSS targets them with `.evidence[open] > .evidence__card` etc.

  export let refLabel: string;
  export let sourceUrl: string | undefined = undefined;
  export let sourceExtract: string | undefined = undefined;
  export let screenshots: Array<{ src: string; alt: string; caption?: string }> = [];
  export let ariaLabel: string | undefined = undefined;

  function prettyUrl(u: string): string {
    try {
      const url = new URL(u);
      const host = url.hostname.replace(/^www\./, '');
      const path = url.pathname.replace(/\/$/, '');
      return path && path.length > 1 ? `${host}${path}` : host;
    } catch {
      return u;
    }
  }

  $: shots = screenshots.filter((s) => s && s.src);
  $: hasShots = shots.length > 0;
  $: hasQuote = Boolean(sourceUrl && sourceExtract);
</script>

<div class="evidence__backdrop" data-close aria-hidden="true"></div>
<div
  class="evidence__card{hasShots ? ' evidence__card--wide' : ''}"
  role="dialog"
  aria-modal="true"
  aria-label={ariaLabel ?? `Proof — ${refLabel}`}
>
  <header class="evidence__head">
    <span class="evidence__kicker">On record</span>
    <span class="evidence__ref">{refLabel}</span>
  </header>
  <button type="button" class="evidence__close" data-close aria-label="Close proof" title="Close">
    <span aria-hidden="true">×</span>
  </button>

  {#if hasShots}
    <div
      class="evidence__gallery{shots.length > 1 ? ' evidence__gallery--carousel' : ''}"
      data-count={shots.length}
      data-index="0"
      data-shots={JSON.stringify(shots)}
      tabindex={shots.length > 1 ? 0 : undefined}
    ></div>
  {/if}

  {#if hasQuote}
    <blockquote class="evidence__quote">
      <span class="evidence__quote-mark" aria-hidden="true">“</span>
      <p>{sourceExtract}</p>
    </blockquote>
  {/if}
  {#if sourceUrl}
    <footer class="evidence__foot">
      <span class="evidence__foot-label">Filed at</span>
      <a class="evidence__foot-link" href={sourceUrl} target="_blank" rel="noreferrer">{prettyUrl(sourceUrl)}</a>
    </footer>
  {/if}
</div>
