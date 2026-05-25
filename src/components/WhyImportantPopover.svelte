<script lang="ts">
  export let short = '';
  export let long = '';
</script>

<section class="why" aria-label="Why does this matter?">
  <h3>Why does this matter?</h3>
  <div class="why__body">
    <p class="why__short">{short}</p>
    <p>{long}</p>
  </div>
</section>

<style>
  .why {
    width: 100%;
    margin-top: 18px;
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-row);
  }
  .why h3 {
    margin: 0 0 10px;
    color: var(--fg);
    font: 900 0.86rem var(--font-display);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .why__body {
    display: grid;
    gap: 8px;
    color: var(--fg-soft);
  }
  .why__body p { margin: 0; }
  .why__short { color: var(--fg); font-weight: 700; }
</style>
