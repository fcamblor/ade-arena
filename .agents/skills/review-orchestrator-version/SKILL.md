---
name: review-orchestrator-version
description: Interactive review of every feature row for one orchestrator+version in the ADE Showdown dataset. Lets the user pick a version (latest by default, with a drill-down into older ones), then walks feature by feature — showing the currently persisted support state, delegating a fresh research pass to a per-feature subagent, and asking the user to confirm/override with sources or screenshots. Persists every accepted change (including screenshot assets) and ends with a commit. Triggers: "review a version", "review feature matrix", "challenge orchestrator data", "audit <tool>@<version>", "fact-check the showdown".
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

**Everything else — current-state display, fresh research, user dialog, sub-questions, screenshot ingestion, file copying, and edits to `_latest-known-features.ts` — happens inside the subagent.** This is critical: screenshots loaded into the main agent's context would quickly exhaust its window. They must stay confined to subagent contexts (which are discarded once the subagent returns).

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

  HARD RULE: you MUST emit the two display blocks below (steps 1 and 3) as
  plain text BEFORE calling AskUserQuestion in step 4. Never ask the user to
  decide without first showing both the current state and the research
  outcome — that is the entire point of this skill. If you skip either
  block, the review is invalid.

  1. Display the currently persisted state as a fenced text block titled
     "Current persisted state". Include verbatim:
        - support
        - note (or "—" if empty)
        - sourceUrl (or "—")
        - sourceExtract (truncate to 240 chars with "…" if longer, or "—")
        - screenshots: list of basenames (or "none")
     If the entry is missing entirely, render the block with the single line
     "(no entry yet — feature has never been reviewed for this orchestrator)".

  2. Re-investigate the tracking sources to challenge the entry. Decide a
     verdict:
       - "confirm" : current entry stands; provide a fresh verbatim quote.
       - "revise"  : propose a corrected FeatureSupport object.
       - "unknown" : evidence is missing or ambiguous.
     Never guess. If you can't quote a source verbatim, verdict = "unknown".

  3. Display the research outcome as a fenced text block titled
     "Research outcome". Include verbatim:
        - verdict: confirm | revise | unknown
        - sources consulted: short list of URLs actually fetched
        - proposed support (only when verdict = revise)
        - proposed note (only when verdict = revise, if any)
        - proposed sourceUrl + verbatim sourceExtract (≤ 240 chars,
          mandatory for confirm and for revise when support ∈ {yes, partial})
        - 1–3 line rationale explaining why the verdict differs from (or
          confirms) the persisted state
     Keep the whole block under ~12 lines.

  4. ONLY AFTER both blocks above are displayed, ask the user via
     AskUserQuestion (single-select):
       1. Keep current
       2. Accept research proposal
       3. Edit manually
       4. Mark unknown
       5. Skip for now
       6. Request prior-decisions recap (then re-ask)

  5. If "Edit manually" or if the user wants to attach screenshots/sources,
     collect (one sub-question at a time, AskUserQuestion for closed enums):
       - support (yes/partial/no/unknown)
       - note (free-form, ≤ 280 chars, optional)
       - sourceUrl (free-form, URL, required when support ∈ {yes, partial})
       - sourceExtract (free-form, verbatim, required when support ∈ {yes, partial})
       - "Any screenshots to attach? Paste absolute paths (one per line) or leave blank."

  6. For each screenshot path the user provides:
       a. Verify the file exists (Read it to confirm — this DOES load image bytes
          into YOUR context, which is fine: this context will be discarded when
          you return).
       b. Ask three sub-questions:
            - problématique (optional slug ^[a-z0-9-]+$, empty = none)
            - alt text (required, short)
            - caption (optional)
       c. Compute filename: <featureId>[_<problematique>]_<YYYYMMDD>_<n>.<ext>
            - segments separated by UNDERSCORE; dashes only inside slug segments
            - <YYYYMMDD> = today's date
            - <n> starts at 1, increments against files with the EXACT same prefix
              already in public/screenshots/<toolId>/ — so live-logs_20260518_1 and
              live-logs_error-toast_20260518_1 are independent scopes
       d. mkdir -p public/screenshots/<toolId>/, then create the symlink if missing.
       e. Copy the file into public/screenshots/<toolId>/<computed-filename>.
          Never overwrite an existing file. Never rename/delete existing files
          (orphaned shots are cheap; broken src refs are not).
       f. Add { src: "/screenshots/<toolId>/<computed-filename>", alt, caption? }
          to the entry's screenshots array.

  7. Persist the change in src/data/orchestrators/<toolId>/_latest-known-features.ts:
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
  "screenshotsAdded": ["<filename1>", "<filename2>", …]  // basenames only, may be []
}

Examples:
{ "outcome": "changed",
  "summary": "live-logs → support=yes (source refreshed, +1 screenshot)",
  "recapLine": "- live-logs   yes   \"Live logs now stream bash output line-by-line.\" (cursor.com/changelog/05-07-26)",
  "screenshotsAdded": ["live-logs_20260518_1.png"] }

{ "outcome": "kept",
  "summary": "live-logs — no change",
  "recapLine": "- live-logs   yes   (unchanged)",
  "screenshotsAdded": [] }
```

### 3b. Main agent: absorb the result

When the subagent returns, the main agent:

1. Prints the `summary` line (one line, prefixed with an indicator: `✔` for `changed`, `=` for `kept`, `?` for `marked-unknown`, `↷` for `skipped`, `⏸` for `paused`).
2. Appends `recapLine` to the rolling recap memo (skipping `paused` outcomes).
3. Tracks `screenshotsAdded` in a session-wide list (used in Step 4 to stage screenshots for commit).
4. If `outcome === "paused"`, breaks out of the loop and proceeds to Step 4 with what's already persisted.
5. Otherwise, moves to the next feature.

The main agent does **not** re-read `_latest-known-features.ts` between iterations. It already knew which feature was being reviewed; the subagent has authoritatively persisted the change. Re-reading would only refresh the entry that was just touched, which the main agent doesn't need to reason about further.

### 3c. Guard rails

- Never batch multiple features into a single subagent — one subagent per feature, sequentially. (Parallel review would race on writes to `_latest-known-features.ts`.)
- Never invent a `sourceExtract`. Subagents that cannot quote a source verbatim must produce `support: 'unknown'`.
- Subagent prompts must not include the user's prior screenshots verbatim — only the count, filenames, and `src` references already in the entry.
- **Display-before-ask invariant.** A subagent MUST emit the "Current persisted state" and "Research outcome" blocks (Step 4 of the subagent prompt, items 1 and 3) before triggering `AskUserQuestion`. If the main agent observes a subagent returning `outcome` other than `paused` without those blocks having reached the user, it must flag the result to the user, discard the persisted change for that feature (revert the file edit if needed), and re-dispatch the subagent with an explicit reminder of the invariant.

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
