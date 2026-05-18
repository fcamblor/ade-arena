---
name: add-orchestrator-version
description: Add a new orchestrator version (or bootstrap a brand-new orchestrator) to the ADE Showdown dataset. Asks the user for the orchestrator name and latest known version, bootstraps the directory + `_meta.ts` + `_latest-known-features.ts` when the orchestrator is unknown, then creates the version file and dispatches research agents on the tracked sources to fill the feature matrix. Triggers: "add a new version", "new orchestrator version", "bump <tool> to <version>", "enrich showdown", "refresh feature matrix".
---

# Skill — `add-orchestrator-version`

Goal: enrich the ADE Showdown dataset with a new orchestrator version. The skill is **interactive** — never invent data; always ask the user when something is unknown.

## Optional argument

`--full-recheck` (or `recheck=true` in args) — when set, re-runs research on **every** feature, even ones already covered. Default: only research features whose `support` is `unknown` or missing for that orchestrator.

---

## Step 1 — Collect identity

Ask the user, in a single message:

1. **Orchestrator name** (human-readable, e.g. "Cursor", "Conductor").
2. **Latest known version string** (e.g. `0.52.3`, `26.513.31313`).
3. *(optional)* Release date in ISO format (`YYYY-MM-DD`). If unknown, fall back to `currentDate` from the user-provided context.

From the name, derive the `toolId`:
- Slugify: lowercase, ASCII, words joined by `-`, must match `^[a-z0-9-]+$`.
- Look up `src/data/orchestrators/<toolId>/`. If it exists → **known orchestrator**, jump to Step 3. Otherwise → **new orchestrator**, go to Step 2.

---

## Step 2 — Bootstrap a new orchestrator

When `src/data/orchestrators/<toolId>/` does not exist:

### 2a. Auto-discover tracking sources, then confirm with the user

**First**, dispatch a research agent (`general-purpose` or `WebSearch` + `WebFetch` directly) to **propose** a list of plausible tracking sources for this orchestrator. Search for at least:

- Official homepage
- Documentation site
- Public changelog / release notes
- Blog
- GitHub organization/repository (releases + commits)
- Pricing page
- Social media accounts announcing releases (X/Twitter, Bluesky, Mastodon, LinkedIn)
- Discord / forum / community
- YouTube channel
- RSS feeds
- Product Hunt / Hacker News announcement threads

The agent must return **candidates with URLs verified to resolve** (HTTP 200), and a short note per candidate explaining why it is relevant. When the agent is uncertain a URL belongs to the right vendor (name collisions, parked domains…), it must flag it as `unverified` rather than asserting.

**Second**, present the discovered candidates via `AskUserQuestion` (the `mcp__conductor__AskUserQuestion` tool):

- Use **one multi-select question** (`multiSelect: true`) titled e.g. *"Which sources should be tracked for `<toolName>`?"*.
- Each candidate becomes one option, formatted as `"<kind> — <label> — <url>"` so the user sees the kind/URL at a glance.
- Do **not** add an "Other" option manually — the tool already exposes a free-form entry so the user can paste any number of custom URLs the agent missed.
- Verified candidates are listed first; `unverified` ones are suffixed with ` (unverified)` so the user knows to double-check before selecting.

After the user answers:

1. Keep every option they selected.
2. Parse any free-form text they entered as additional URL(s) — accept newline-, space- or comma-separated lists. For each, ask a tight follow-up `AskUserQuestion` to assign a `kind` from the allowed set when the URL alone is ambiguous; otherwise infer the kind from the host (e.g. `github.com/.../releases` → `github-releases`, `twitter.com|x.com` → `twitter`, `youtube.com` → `youtube`, `*.rss|/feed` → `rss`).
3. Discard everything else (rejected candidates, unverified non-selected).

Persist the retained set into `trackingSources` as `{ kind, label, url, notes? }`.

### 2c. Infer meta fields from the confirmed sources (then ask only on gaps)

Do **not** prompt the user up-front for vendor / platforms / pricing / model restriction. Instead, dispatch a research agent over the confirmed `trackingSources` to **infer** each field, with strict evidence requirements:

- **Vendor** — company / organization behind the tool. Evidence: an "About" / footer / docs mention; record the source URL even though the schema does not store it (use it to justify the value to the user).
- **Supported platforms** (subset of `macos | windows | linux | web`) — for each, capture a `sourceUrl` (typically the install / download / docs page) + a `sourceExtract` quote that names the platform. The Zod schema **requires** a `platformSources` entry for every listed platform.
- **Pricing model** (`free | freemium | paid | oss`) — with `pricingSource.sourceUrl` + `sourceExtract` quoting the pricing page or license.
- **Model restriction** — only populate when the tool drives a **closed set** of models/agents (e.g. "Claude Code + Codex only"). Tools with broad BYOK/multi-provider support must leave this empty — model breadth belongs to the `multi-model` feature row.

For each field, the agent must return either:
- a value backed by a `sourceUrl` + `sourceExtract`, **or**
- `unknown` if no evidence was found.

After research, **only** ask the user about fields the agent returned as `unknown` (or fields where the user explicitly wants to override the inference). Use `AskUserQuestion` whenever a closed enum is involved (pricing model, platforms) and free-form text otherwise. Show the user the inferred values + their sources before persisting, so they can spot mistakes.

### 2b. Create the orchestrator directory

Create three files under `src/data/orchestrators/<toolId>/`:

- `_meta.ts` — implements `OrchestratorMeta` (see `src/data/version-diff.ts`). Mandatory fields: `toolId`, `toolName`, `homepage`, `platforms`, `platformSources`. Optional but recommended: `vendor`, `pricing`, `pricingSource`, `modelRestriction`, `trackingSources`. Follow the existing examples (`src/data/orchestrators/cursor/_meta.ts`, `src/data/orchestrators/conductor/_meta.ts`).

- `_latest-known-features.ts` — **must export an empty array** at bootstrap:
  ```ts
  import type { FeatureSupport } from '../../schema';

  // Preview stub — feature matrix not yet populated.
  export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [];
  ```

- Skip creating the version file at this stage — Step 3 does it.

---

## Step 3 — Create the version file

File path: `src/data/orchestrators/<toolId>/<version>.ts` (use the exact version string the user provided; dots are fine).

Template:

```ts
import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';
import { META } from './_meta';
import { LATEST_KNOWN_FEATURES } from './_latest-known-features';

const data: OrchestratorVersion = {
  ...META,
  status: 'waiting-for-review',
  version: '<version>',
  releaseDate: '<YYYY-MM-DD>',
  features: LATEST_KNOWN_FEATURES,
};

export default OrchestratorVersionSchema.parse(data);
```

- Always set `status: 'waiting-for-review'` for a freshly-added version. The reviewer flips it to `'approved'` (or removes the field) once vetted.
- If the user did not give a release date, use today's date (the harness exposes it in the user context).

---

## Step 4 — Research feature support

Goal: populate `_latest-known-features.ts` with one `FeatureSupport` entry per `FEATURES` in `src/data/features.ts`.

### 4a. Determine the scope

Load the current contents of `<toolId>/_latest-known-features.ts`. For each feature in `src/data/features.ts`:

- If `--full-recheck` → **research it**.
- Else if no entry exists for that `featureId` → **research it**.
- Else if `support === 'unknown'` → **research it**.
- Else if `support === 'partial'` AND the entry lacks `sourceUrl`+`sourceExtract` → **research it** (coverage is partial).
- Otherwise → **skip**, keep the existing entry verbatim.

### 4b. Dispatch research agents (parallel)

Group the to-research features into a handful of batches (max ~6–8 features per agent to keep prompts focused). For each batch, launch one `Explore` or `general-purpose` agent **in parallel** (single message, multiple `Agent` tool calls) with:

- The list of features to investigate (id + label + shortDescription + longDescription).
- The orchestrator's `trackingSources` URLs from `_meta.ts`.
- The `FeatureSupport` schema contract (`featureId`, `support: yes|partial|no|unknown`, optional `note ≤ 280 chars`, optional `sourceUrl`, optional `sourceExtract`).
- Explicit instructions:
  - Use `WebFetch` / `WebSearch` against the provided tracking sources.
  - For each feature, return a strict JSON object matching `FeatureSupport`.
  - When evidence is missing or ambiguous, return `support: 'unknown'` rather than guessing.
  - When `support` is `yes` or `partial`, **require** a `sourceUrl` + `sourceExtract` quote.
  - `note` is optional and capped at 280 chars; use it for caveats only.
  - Do not write files; just return the JSON.

### 4c. Merge results

Collect the JSON returned by each agent and assemble the final `FeatureSupport[]` array, preserving the feature ordering used by existing orchestrators (the order in `src/data/features.ts`). Write it to `_latest-known-features.ts`:

```ts
import type { FeatureSupport } from '../../schema';

export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
  // …entries…
];
```

For features that remained `unknown` after research, still include the entry with `support: 'unknown'` — do not omit them.

---

## Step 5 — Validate

Run validation before reporting completion:

```sh
pnpm exec tsc --noEmit
```

(If a `pnpm validate` or `pnpm check` script exists, prefer that.)

The Zod schemas (`OrchestratorVersionSchema`) will fail loudly on schema violations — fix any issues reported.

---

## Step 6 — Report

Summarise to the user:
- Whether the orchestrator was newly bootstrapped or pre-existing.
- The created/updated files.
- A short feature-coverage breakdown: counts of `yes` / `partial` / `no` / `unknown`.
- The preview URL hint: `?preview=<toolId>@<version>`.
- Any features that stayed `unknown` so the user can fill them in manually.

---

## Reference files

- Schema: `src/data/schema.ts`
- Meta type + diff helper: `src/data/version-diff.ts`
- Feature catalog: `src/data/features.ts`
- Example fully-populated orchestrator: `src/data/orchestrators/conductor/`
- Example preview stub (empty matrix): `src/data/orchestrators/codex-app/`
- Auto-loader (no manual registration needed): `src/data/index.ts`
