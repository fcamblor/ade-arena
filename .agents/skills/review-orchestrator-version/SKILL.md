---
name: review-orchestrator-version
description: Interactive review of every feature row for one orchestrator+version in the ADE Arena dataset. Lets the user pick a version (latest by default, with a drill-down into older ones), then walks feature by feature — showing the currently persisted support state, delegating a fresh research pass to a per-feature subagent, and asking the user to confirm/override with sources or screenshots. Persists every accepted change (including screenshot assets) and ends with a commit. Triggers: "review a version", "review feature matrix", "challenge orchestrator data", "audit <tool>@<version>", "fact-check the arena".
---

# Skill — `review-orchestrator-version`

Goal: catch stale or incorrect feature rows by going through them **one at a time** with the user, backed by a fresh research pass. The skill is strictly **interactive** — never silently overwrite data; every change is validated by the user.

The skill edits `src/data/orchestrators/<toolId>/_latest-known-features.ts` (which the target version file consumes via `LATEST_KNOWN_FEATURES`) and stores screenshot assets under `public/screenshots/<toolId>/` — **shared across every version of that orchestrator**, since most screenshots remain valid across versions.

For ergonomic editing, the skill also ensures a symlink exists at `src/data/orchestrators/<toolId>/screenshots` → `../../../../public/screenshots/<toolId>` so assets show up next to the data file in the IDE. Astro keeps serving them exclusively from `public/`.

## Portability note

This skill avoids vendor-specific bindings. Two host capabilities are used through portable concepts, not concrete tool names:

- **`AskUserQuestion`** — the host's structured-question primitive (single or multi-select, optional free-form fallback). Used whenever a closed set of options fits. If the host exposes it under a vendor-specific path (`mcp__<vendor>__AskUserQuestion`, a built-in `AskUserQuestion` tool, a slash command, etc.), use it. If not, fall back to a numbered plain-text prompt with the same semantics.
- **Subagent** — any general-purpose agent the host can spawn (sub-task, background agent, research helper…). Used for the per-feature research pass so the main agent's context stays lean.

No assumption is made about the surrounding ADE, IDE, or coding agent.

---

## Optional arguments

The skill accepts two optional arguments (whitespace-separated, any order):

- `<toolId>@<version>` — pre-selects the orchestrator + version and **skips Step 1 entirely**. Example: `cursor@3.4.17`. The target file `src/data/orchestrators/<toolId>/<version>.ts` must already exist; otherwise the skill aborts with an error pointing the user at `add-orchestrator-version`.
- `--only-unreviewed` (or `scope=unreviewed` in args) — restricts the per-feature loop to entries whose `support` is `unknown` or whose `featureId` is missing from `_latest-known-features.ts`. Default: walk every feature.

Both arguments are independent and can be combined. `add-orchestrator-version` invokes this skill with both set after bootstrapping a new orchestrator.

---

## Step 1 — Pick the orchestrator and version

**Skip this entire step** when a `<toolId>@<version>` argument was provided. Just record `toolId` / `version`, resolve `toolName` from `_meta.ts`, and continue with Step 2.

Otherwise, use `AskUserQuestion` for each selection (single-select). Prefer one question at a time; never bundle the orchestrator and version selections together. Fall back to a numbered plain-text prompt if `AskUserQuestion` is not available.

### 1a. Pick the orchestrator

List every directory under `src/data/orchestrators/` (the `toolId` set). Read each `_meta.ts` to grab `toolName` for nicer labels. Present them as the options of a single-select `AskUserQuestion` (labelled with `toolName`).

### 1b. Pick the version

For the chosen `toolId`:

- List every `*.ts` file under `src/data/orchestrators/<toolId>/` **excluding** files starting with `_` (so skip `_meta.ts`, `_latest-known-features.ts`).
- Each remaining file's basename is a version string.
- For each version, read its file to extract `version`, `releaseDate`, and `status` (defaults to `approved` when missing).
- **Sort by `releaseDate` descending**, then by version string descending.

Show the user **the 3 most recent versions** in a single-select `AskUserQuestion`, each option formatted as `"<version> — <releaseDate> — <status>"`. Add one extra option labelled **"Show older versions…"**.

- If the user picks a version → continue with Step 2.
- If the user picks "Show older versions…" → re-issue an `AskUserQuestion` listing every remaining (older) version, single-select, same formatting.

If only one version exists, skip the question but confirm the target with the user before proceeding.

Once chosen, remember:

- `toolId`, `toolName`
- `version` (exact string, file basename)
- Path: `src/data/orchestrators/<toolId>/<version>.ts`
- Features file: `src/data/orchestrators/<toolId>/_latest-known-features.ts`
- `trackingSources` from `_meta.ts` (Step 3 uses them)

---

## Step 2 — Load context once

Read into the **main agent's** memory:

1. `src/data/features.ts` — the canonical `FEATURES` list (order matters for persistence).
2. `src/data/schema.ts` — `FeatureSupportSchema` + `ScreenshotSchema` contract (recap below).
3. The orchestrator's `_meta.ts` (for `trackingSources`).
4. The orchestrator's `_latest-known-features.ts` (the array being reviewed).
5. The target version file (so the final report can mention flipping `status: 'waiting-for-review' → 'approved'`).

`FeatureSupport` schema recap (must hold after every edit):

```ts
{
  featureId: string,
  support: 'yes' | 'partial' | 'no' | 'unknown',
  note?: string,                 // max 280 chars
  screenshots: Screenshot[],     // default []
  sourceUrl?: string,            // URL
  sourceExtract?: string,        // verbatim quote
}
// Screenshot = { src: string, alt: string, caption?: string }
```

Rule of thumb (matches the rest of the dataset): when `support` is `yes` or `partial`, **require** a `sourceUrl` + `sourceExtract`. When `support` is `no`, a `note` explaining *why not* is strongly recommended.

### Rolling recap memo

The main agent also maintains a **rolling recap memo** — a compact list of decisions taken during this run, one line per reviewed feature, e.g.:

```
- live-logs            yes      "Live logs now stream bash output line-by-line." (cursor.com/changelog/05-07-26)
- sandbox-isolation    no       host-permission tools, no Docker/VM
```

This memo lives only in the main agent's context. It is **not** persisted to disk. It is used in Step 3b to pass cross-cutting context to subsequent subagents.

---

## Step 3 — Per-feature review loop

Iterate **in the order of `FEATURES`** in `src/data/features.ts`. When `--only-unreviewed` was passed, skip any feature whose current entry exists with `support ∈ {'yes', 'partial', 'no'}` — only walk the ones at `support: 'unknown'` or missing entirely.

### Context-isolation principle

The main agent's job in this loop is **strictly orchestration**:

- It prints a one-line header per feature (`[i/total] Reviewing <featureId>…`).
- It spawns a single subagent per feature with all needed inputs.
- It receives **one compact JSON object** back from each subagent (no images, no source extracts, no transcript).
- It updates its rolling recap memo and moves to the next feature.

**Everything — current-state display, fresh research, user dialog, sub-questions, screenshot ingestion, file copying, and edits to `_latest-known-features.ts` — happens inside the subagent.** This is critical: across 40+ features, image bytes loaded into the main agent's context would quickly exhaust its window. They must stay confined to subagent contexts (which are discarded once the subagent returns).

**Hard rule for screenshot ingestion: handled by the main agent, never the subagent.** Subagents cannot receive an image the user pastes inline — only the host's main turn can. To keep paste-support available, the subagent NEVER asks for screenshots; it just reports `screenshotPromptNeeded` in its return value, and the main agent then prompts the user in Step 3b-bis (accepting either an inline-pasted image OR file paths). This also avoids the double-prompt bug where both the subagent and the main agent would ask separately.

### 3a. Main agent: dispatch the per-feature subagent

For each feature kept by the filter, print one header line and spawn a subagent. Wait for it to complete before moving on.

**Optional cross-feature hint.** Before launching, the main agent decides whether prior decisions are relevant to this feature (e.g. reviewing `multi-model` after having locked `local-execution` and `cloud-execution`). When yes, include a 2–5-line excerpt of the rolling recap memo in the subagent's prompt under a clearly-labeled "Prior decisions from this run" section. When no, omit it — most features are independent.

**Subagent prompt (template):**

```
You are reviewing ONE feature row in a third-party feature matrix, end-to-end.

ORCHESTRATOR: <toolId> (<toolName>), version <version>, released <releaseDate>.
FEATURE INDEX: [i/total]

FEATURE TO REVIEW:
  id: <featureId>
  label: <label>
  category: <category>
  short: <shortDescription>
  long: <longDescription or "—">

CURRENTLY PERSISTED ENTRY (verbatim, may be stale):
  <JSON of the FeatureSupport entry, or "missing">

TRACKING SOURCES (use these as primary evidence):
  <list of { kind, label, url } from _meta.ts>

PRIOR DECISIONS FROM THIS RUN (optional, may be empty):
  <0-5 lines from the rolling recap, when relevant>

FILESYSTEM CONTEXT:
  features file : src/data/orchestrators/<toolId>/_latest-known-features.ts
  screenshots dir: public/screenshots/<toolId>/         (create if missing)
  screenshots symlink: src/data/orchestrators/<toolId>/screenshots
                       → ../../../../public/screenshots/<toolId>
                       (create if missing — git stores it as mode 120000)

SCHEMA RECAP (must hold after persistence):
  FeatureSupport = {
    featureId: string,
    support: 'yes' | 'partial' | 'no' | 'unknown',
    note?: string (≤ 280 chars),
    screenshots: { src, alt, caption? }[] (default []),
    sourceUrl?: URL,
    sourceExtract?: string (verbatim quote)
  }
  Rule: when support ∈ {yes, partial}, sourceUrl + sourceExtract are REQUIRED.

YOUR JOB (do all of this yourself; the main agent will not intervene):

  CRITICAL HOST CONSTRAINT — READ CAREFULLY:
  Your `text` messages are NOT relayed to the end user; they stay in your
  internal log. The ONLY user-visible surface from a subagent is the
  `question` field of AskUserQuestion. Therefore the two mandatory display
  blocks below MUST be embedded inside that `question` field, otherwise the
  user sees only the multiple-choice options with no context — which is the
  exact bug this skill is fixing.

  Additional AskUserQuestion limits (host-enforced):
    - At most 4 options per question (the host rejects 5+).
    - The `question` field accepts multi-line text — use it.

  STEPS:

  1. Compute TWO blocks that will be embedded in the question text in step 4.

     1a. "Feature" block — recap the feature being reviewed so the user does
         not have to remember what `<featureId>` covers. Format:
            Feature
            -------
            id      : <featureId>
            label   : <label>
            category: <category>
            short   : <short>
            long    : <long or —, truncate to 240 chars with "…" if longer>

     1b. "Current persisted state" block. Format:
            Current persisted state
            -----------------------
            support      : <value>
            note         : <value or —>
            sourceUrl    : <value or —>
            sourceExtract: <verbatim, truncate to 240 chars with "…" if longer, or —>
            screenshots  : <comma-separated basenames or "none">
         If the entry is missing entirely, replace the body with the single line
         "(no entry yet — feature has never been reviewed for this orchestrator)".

  2. Re-investigate the tracking sources to challenge the entry. Decide a
     verdict:
       - "confirm" : current entry stands; provide a fresh verbatim quote.
       - "revise"  : propose a corrected FeatureSupport object.
       - "unknown" : evidence is missing or ambiguous.
     Never guess. If you can't quote a source verbatim, verdict = "unknown".

  3. Compute the "Research outcome" block (also embedded in step 4, after
     the Feature and Current persisted state blocks). Format:
        Research outcome
        ----------------
        verdict       : <confirm | revise | unknown>
        sources       : <short list of URLs actually fetched>
        proposed      : <support [+ note] — only when verdict = revise>
        sourceUrl     : <proposed/refreshed URL>
        sourceExtract : <verbatim, ≤ 240 chars, mandatory for confirm and for
                        revise when support ∈ {yes, partial}>
        rationale     : <1–3 lines>
     Keep the whole block under ~12 lines.

  4. Call AskUserQuestion with a SINGLE question whose `question` field is
     the concatenation of the THREE blocks computed above (Feature, then
     Current persisted state, then Research outcome), each wrapped in a
     triple-backtick fence, separated by blank lines, prefixed by a header
     line and followed by an action prompt:

       "[<i>/<total>] <featureId> — how to resolve?\n\n```\n<featureBlock>\n```\n\n```\n<persistedBlock>\n```\n\n```\n<researchBlock>\n```\n\nChoose an action:"

     Use these 4 options (single-select, AT MOST 4):
       1. Keep current
       2. Accept research proposal
       3. Edit manually
       4. Other (skip / mark unknown / recap)

     If the user picks option 4, follow up with a second AskUserQuestion
     (also ≤4 options) to pick between: Skip for now / Mark unknown /
     Request prior-decisions recap (then re-ask) / Pause.

  5. If "Edit manually", collect (one sub-question at a time,
     AskUserQuestion for closed enums):
       - support (yes/partial/no/unknown)
       - note (free-form, ≤ 280 chars, optional)
       - sourceUrl (free-form, URL, required when support ∈ {yes, partial})
       - sourceExtract (free-form, verbatim, required when support ∈ {yes, partial})

     Otherwise ("Keep current" or "Accept research proposal"), the
     FeatureSupport object is already determined — no extra fields to
     collect at this point.

  6. DO NOT prompt the user for screenshots — that is the main agent's job
     (Step 3b-bis of the skill). Screenshot ingestion happens AFTER you
     return, so the user can paste an image inline if they want; you
     cannot receive pasted bytes. Just compute `screenshotPromptNeeded`
     correctly in your return value (true iff final support ∈ {yes,
     partial} and outcome ≠ "paused") and stop there for screenshots.

  7. Persist the support-field change (no screenshot changes — those are
     appended later by the main agent) in
     src/data/orchestrators/<toolId>/_latest-known-features.ts:
       - If the entry exists, replace it in place; preserve untouched screenshots
         and merge new ones (no duplicate src values).
       - If missing, insert it at the position matching the feature's order in
         FEATURES.
       - Validate the schema mentally before writing.

  8. Honor pause: if the user says "stop", "pause", "later" at any prompt, return
     immediately with outcome: "paused" and persist nothing for this feature.

OUTPUT (return as a single compact JSON object — NO prose, NO source extracts,
NO image data; the main agent must see only this):

{
  "outcome": "changed" | "kept" | "skipped" | "marked-unknown" | "paused",
  "summary": "<≤120 chars: one-line human-readable result>",
  "recapLine": "<≤140 chars: terse line for the rolling memo>",
  "finalSupport": "yes" | "partial" | "no" | "unknown",  // resolved support after the user's decision
  "screenshotPromptNeeded": true | false                  // true iff finalSupport ∈ {yes, partial} and outcome ≠ "paused"
}

Examples:
{ "outcome": "changed",
  "summary": "live-logs → support=yes (source refreshed)",
  "recapLine": "- live-logs   yes   \"Live logs now stream bash output line-by-line.\" (cursor.com/changelog/05-07-26)",
  "finalSupport": "yes",
  "screenshotPromptNeeded": true }

{ "outcome": "kept",
  "summary": "live-logs — no change",
  "recapLine": "- live-logs   yes   (unchanged)",
  "finalSupport": "yes",
  "screenshotPromptNeeded": true }
```

### 3b. Main agent: absorb the result + collect screenshots

When the subagent returns, the main agent:

1. Prints the `summary` line (one line, prefixed with an indicator: `✔` for `changed`, `=` for `kept`, `?` for `marked-unknown`, `↷` for `skipped`, `⏸` for `paused`).
2. Appends `recapLine` to the rolling recap memo (skipping `paused` outcomes).
3. **Screenshot collection** (only when `screenshotPromptNeeded === true`) — see Step 3b-bis below.
4. Tracks any screenshots added in a session-wide list (used in Step 4 to stage them for commit).
5. If `outcome === "paused"`, breaks out of the loop and proceeds to Step 4 with what's already persisted.
6. Otherwise, moves to the next feature.

The main agent does **not** re-read `_latest-known-features.ts` between iterations except in step 3b-bis, where it must rewrite the screenshots array for the current featureId.

### 3b-bis. Main agent: screenshot ingestion (when `screenshotPromptNeeded`)

This step runs in the **main agent**, never in a subagent. The reason is structural: the host can only deliver a pasted image (or attach a temp file path) to the agent that is currently holding the turn — i.e. the main agent. A subagent that asks the user "paste a screenshot" cannot receive it.

Procedure:

1. Ask the user via `AskUserQuestion` (single question, free-form fallback expected). Phrase it explicitly so the user knows BOTH paste and file paths are accepted:

   > "Screenshots à attacher pour `<featureId>` (support=<finalSupport>) ?
   >  Vous pouvez **coller une image directement** dans votre prochaine réponse,
   >  ou bien fournir un/des chemin(s) de fichier absolus (un par ligne).
   >  Laissez vide pour passer."
   >
   > Options:
   >   1. Pas de screenshot — passer
   >   2. Je colle / je fournis un chemin (utilisez "Other" pour répondre librement)

   (Phrase in the language the user has been using in this session. The example
   above is French because that's the most common case for this project; switch
   to English if the session is in English.)

2. If the user picks "Pas de screenshot" or replies with a blank free-form, move on to the next feature.

3. Otherwise, parse the user's reply:
   - If it contains one or more file paths (one per line, or comma-separated), use those.
   - If the host delivered a pasted image as a temp file path in the user's message, use that path.
   - If the user typed something else, ask again until you have at least one path or a clear "skip".

4. For each resolved path, gather metadata via `AskUserQuestion`, one question at a time:
   - `problématique` — optional slug `^[a-z0-9-]+$`, blank = none
   - `alt` — **required**, short, **always in English** regardless of the session language (for dataset accessibility / SEO consistency). If the user provides it in another language, translate it before persisting and mention the translation in the next AskUserQuestion so they can override.
   - `caption` — optional, **also in English** for the same reason

5. Compute the destination filename:

   `<featureId>[_<problematique>]_<YYYYMMDD>_<n>.<ext>`

   - segments separated by UNDERSCORE; dashes only inside slug segments
   - `<YYYYMMDD>` = today's date
   - `<n>` starts at 1, increments against files with the EXACT same prefix already in `public/screenshots/<toolId>/` — `live-logs_20260518_1` and `live-logs_error-toast_20260518_1` are independent scopes
   - `<ext>` from the source file extension (preserve case-insensitively, lowercase recommended)

6. **Do NOT `Read` the screenshot file in the main agent's context.** Use Bash only:
   - `test -f "<src-path>"` to verify existence
   - `mkdir -p public/screenshots/<toolId>/`
   - Create the symlink `src/data/orchestrators/<toolId>/screenshots → ../../../../public/screenshots/<toolId>` if missing
   - `cp -n "<src-path>" "public/screenshots/<toolId>/<computed-filename>"` (the `-n` guards against overwrite)

7. `Edit` `src/data/orchestrators/<toolId>/_latest-known-features.ts` to append `{ src: "/screenshots/<toolId>/<computed-filename>", alt, caption? }` to the entry's `screenshots` array. Preserve any pre-existing screenshots; never delete or rename.

8. Append the new filename to the session-wide screenshots list for Step 4 staging.

**Why the main agent owns this step, in one line:** subagents cannot receive pasted images, and the only reliable way to support the user pasting a screenshot is to handle ingestion on the turn the host is actually delivering bytes to — which is the main agent's.

### 3c. Guard rails

- Never batch multiple features into a single subagent — one subagent per feature, sequentially. (Parallel review would race on writes to `_latest-known-features.ts`.)
- Never invent a `sourceExtract`. Subagents that cannot quote a source verbatim must produce `support: 'unknown'`.
- Subagent prompts must not include the user's prior screenshots verbatim — only the count, filenames, and `src` references already in the entry.
- **Display-inside-question invariant.** Subagent `text` messages are NOT relayed to the user — only the `question` field of `AskUserQuestion` reaches them. The "Current persisted state" and "Research outcome" blocks MUST therefore be embedded inside the `question` text passed to `AskUserQuestion`, not merely emitted as assistant prose. The subagent prompt enforces this explicitly; the main agent does not need to re-validate, but if the user reports missing context the first thing to check is whether a subagent reverted to the old "print blocks then ask a short question" pattern.
- **AskUserQuestion option cap.** The host's `AskUserQuestion` rejects more than 4 options per question. The subagent prompt is already capped at 4; if you ever extend it, split into a follow-up question rather than growing the list.
- **Screenshot opportunity invariant.** Whenever the final verdict has `support ∈ {yes, partial}`, the user MUST be asked for screenshot paths — regardless of whether the verdict was Kept, Accepted, or Edited. A blank answer skips. The prompt is fired by the **main agent** in Step 3b-bis (driven by `screenshotPromptNeeded` from the subagent's return value), never by the subagent itself, because subagents cannot receive pasted images.
- **English-only invariant for alt/caption.** Screenshot `alt` (and optional `caption`) MUST be persisted in English regardless of the session language. The dataset is published with English alt text for accessibility / SEO consistency. The main agent translates any French (or other-language) input from the user into English before writing it to the file. The May 2026 conductor@0.52.3 run shipped a French alt — that is the bug this rule fixes.
- **Single screenshot prompt.** The screenshot prompt is fired EXACTLY ONCE per feature, by the main agent in Step 3b-bis. The subagent must NOT ask for screenshots itself — doing so would (a) duplicate the prompt and (b) prevent the user from pasting an image inline (which only works on the main agent's turn). The subagent only signals intent via `screenshotPromptNeeded`.

---

## Step 4 — Finalise & commit

Once the loop ends (all features done **or** user paused):

1. **Status flip** — if every feature was reviewed (none `unknown`, none skipped) and the version file currently has `status: 'waiting-for-review'`, ask the user via `AskUserQuestion` (yes/no) whether to flip it to `'approved'`. Apply if yes (edit the version file to drop the `status` line or set it to `'approved'`).

2. **Validate** — run:

   ```sh
   pnpm exec tsc --noEmit
   ```

   Fix any Zod / TypeScript error before reporting success.

3. **Summary report** — print:
   - Counts: reviewed / changed / skipped / still-unknown.
   - Per-feature diff lines for every changed entry (`featureId: oldSupport → newSupport`).
   - List of screenshot files added under `public/screenshots/<toolId>/`.
   - The preview URL hint: `?preview=<toolId>@<version>`.

4. **Commit** — create a git commit including both the updated `.ts` files and any new screenshot binaries. Stage them explicitly (avoid `git add -A`):
   - `src/data/orchestrators/<toolId>/_latest-known-features.ts`
   - `src/data/orchestrators/<toolId>/<version>.ts` (only when `status` was flipped)
   - `public/screenshots/<toolId>/*` (only the files actually added during this run)
   - `src/data/orchestrators/<toolId>/screenshots` (only when the symlink was just created)

   Suggested conventional-commit subject: `chore(review): refresh <toolId>@<version> feature matrix`.

   If the host agent exposes a project-specific commit helper / skill / slash-command, the user is free to use it instead — the requirement is just *a clean, conventional-commit-style commit that stages the listed paths*.

---

## Reference files

- Schema: `src/data/schema.ts`
- Feature catalog: `src/data/features.ts`
- Meta type: `src/data/version-diff.ts`
- Auto-loader: `src/data/index.ts`
- Sibling skill (creates versions): `.agents/skills/add-orchestrator-version/SKILL.md`
