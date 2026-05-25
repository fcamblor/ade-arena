<script lang="ts">
  export let checked = false;
</script>

<label class="consent">
  <input bind:checked type="checkbox" />
  <span>I agree to the <a href="/privacy">privacy policy</a> before saving my first vote.</span>
</label>

<style>
  .consent {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-row);
    color: var(--fg-soft);
  }
  .consent input { margin-top: 4px; accent-color: var(--accent); }
</style>
