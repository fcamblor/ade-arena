<script lang="ts">
  // Renders the real Evidence ("Proof") popover for a single feature, fed from
  // the contribution tunnel's current draft state. It owns only the `<details>`
  // + trigger pill; the card body is the shared <EvidenceCard>, and the visual
  // styling + open/close/carousel behaviour come from Evidence.astro's global
  // stylesheet + delegated script (loaded once on the page via a hidden
  // <Evidence/> instance). Keeping this in its own component avoids inheriting
  // ContributeTunnel's bare-element styles (`button {…}`, `input {…}`), which
  // would otherwise leak onto `.evidence__close`, the carousel arrows, etc.

  import EvidenceCard from './EvidenceCard.svelte';

  export let refLabel: string;
  export let shots: Array<{ src: string; alt: string; caption?: string }> = [];
  export let sourceUrl = '';
  export let sourceExtract = '';
</script>

<details class="evidence evidence--inline" name="proof">
  <summary class="evidence__trigger proof-trigger" aria-label="Preview the proof popup for this feature">
    <span>Preview proof popup</span>
  </summary>
  <EvidenceCard {refLabel} {sourceUrl} {sourceExtract} screenshots={shots} />
</details>

<style>
  /* Only the trigger pill is styled here. Everything inside the card is owned
     by Evidence's global stylesheet. */
  .proof-trigger {
    display: inline-flex;
    align-items: center;
    flex: none;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-row);
    color: var(--fg-soft);
    font: 700 0.78rem var(--font-display);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .proof-trigger:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
</style>
