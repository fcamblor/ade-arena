<script lang="ts">
  // Inline word-level patch view for a single text field that diverged from the
  // baseline (new-version mode). Renders a two-line diff — a `−` line for the
  // baseline value and a `+` line for the current value — with the words that
  // actually changed outlined and tinted, reusing the homepage's support-cell
  // palette (red = removed, green = added) so the contribution tunnel stays
  // visually coherent with the comparison grid.

  export let baseline: string | undefined = '';
  export let current: string | undefined = '';
  // Short header, e.g. "vs baseline (1.4.0)".
  export let label: string = '';

  type Token = { text: string; type: 'equal' | 'add' | 'del' };

  // Tokenise into runs of whitespace and runs of non-whitespace so a word diff
  // keeps spacing intact and only flags the substrings that really moved.
  function tokenize(s: string): string[] {
    return s.match(/\s+|\S+/g) ?? [];
  }

  // Classic LCS backtrack over tokens → a flat add/del/equal token stream.
  function diffTokens(a: string, b: string): Token[] {
    const aw = tokenize(a);
    const bw = tokenize(b);
    const n = aw.length;
    const m = bw.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i -= 1) {
      for (let j = m - 1; j >= 0; j -= 1) {
        dp[i][j] = aw[i] === bw[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const out: Token[] = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (aw[i] === bw[j]) {
        out.push({ text: aw[i], type: 'equal' });
        i += 1;
        j += 1;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        out.push({ text: aw[i], type: 'del' });
        i += 1;
      } else {
        out.push({ text: bw[j], type: 'add' });
        j += 1;
      }
    }
    while (i < n) out.push({ text: aw[i++], type: 'del' });
    while (j < m) out.push({ text: bw[j++], type: 'add' });
    return out;
  }

  $: base = baseline ?? '';
  $: cur = current ?? '';
  $: tokens = diffTokens(base, cur);
  $: delTokens = tokens.filter((t) => t.type !== 'add');
  $: addTokens = tokens.filter((t) => t.type !== 'del');
  $: hasBaseline = base.trim().length > 0;
  $: hasCurrent = cur.trim().length > 0;

  // Only outline tokens that carry actual content — a flagged whitespace run
  // renders plain to avoid stray coloured gaps.
  const lit = (t: Token, kind: 'add' | 'del') => t.type === kind && /\S/.test(t.text);
</script>

<div class="diff" role="group" aria-label={label || 'Change from baseline'}>
  {#if label}<span class="diff__label">{label}</span>{/if}
  <div class="diff__line diff__line--del">
    <span class="diff__sign" aria-hidden="true">−</span>
    <span class="diff__text">
      {#if !hasBaseline}
        <span class="diff__empty">(empty)</span>
      {:else}
        {#each delTokens as t}{#if lit(t, 'del')}<del class="diff__w diff__w--del">{t.text}</del>{:else}<span>{t.text}</span>{/if}{/each}
      {/if}
    </span>
  </div>
  <div class="diff__line diff__line--add">
    <span class="diff__sign" aria-hidden="true">+</span>
    <span class="diff__text">
      {#if !hasCurrent}
        <span class="diff__empty">(empty)</span>
      {:else}
        {#each addTokens as t}{#if lit(t, 'add')}<ins class="diff__w diff__w--add">{t.text}</ins>{:else}<span>{t.text}</span>{/if}{/each}
      {/if}
    </span>
  </div>
</div>

<style>
  .diff {
    display: grid;
    gap: 2px;
    margin-top: 2px;
    padding: 8px 10px;
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-sm);
    background: color-mix(in oklch, var(--bg) 70%, transparent);
    font: 0.76rem/1.5 ui-monospace, 'SFMono-Regular', 'Menlo', 'Consolas', monospace;
  }
  .diff__label {
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-muted);
    margin-bottom: 4px;
  }
  .diff__line {
    display: grid;
    grid-template-columns: 1.4ch 1fr;
    gap: 8px;
    padding: 1px 4px;
    border-radius: 3px;
  }
  .diff__line--del { background: color-mix(in oklch, var(--cell-no) 18%, transparent); }
  .diff__line--add { background: color-mix(in oklch, var(--cell-yes) 18%, transparent); }
  .diff__sign {
    font-weight: 800;
    text-align: center;
    user-select: none;
  }
  .diff__line--del .diff__sign { color: var(--cell-no-ink); }
  .diff__line--add .diff__sign { color: var(--cell-yes-ink); }
  .diff__text {
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--fg-soft);
  }
  .diff__empty {
    font-style: italic;
    color: var(--fg-faint);
  }
  .diff__w {
    border-radius: 3px;
    padding: 0 1px;
    text-decoration: none;
  }
  .diff__w--del {
    color: var(--cell-no-ink);
    background: color-mix(in oklch, var(--cell-no) 50%, transparent);
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--cell-no-ink) 55%, transparent);
    text-decoration: line-through;
    text-decoration-color: color-mix(in oklch, var(--cell-no-ink) 70%, transparent);
  }
  .diff__w--add {
    color: var(--cell-yes-ink);
    background: color-mix(in oklch, var(--cell-yes) 50%, transparent);
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--cell-yes-ink) 55%, transparent);
  }
</style>
