---
name: add-orchestrator-version
description: Bootstrap a brand-new orchestrator or add a new version to an existing one in the ADE Arena dataset. Asks the user for the orchestrator name and latest known version, infers the meta block from public sources when new, creates the version file, then hands off to `review-orchestrator-version` to walk the feature matrix interactively. Triggers: "add a new version", "new orchestrator version", "bump <tool> to <version>", "enrich arena".
---

# Skill — `add-orchestrator-version`

Goal: register a new orchestrator+version in the dataset and seed enough structure for `review-orchestrator-version` to take over and fill the feature matrix interactively. The skill is **strictly bootstrap-only** — it does **not** research feature support itself; that responsibility belongs to `review-orchestrator-version`.

## Portability note

This skill avoids vendor-specific bindings. Two host capabilities are used through portable concepts, not concrete tool names:

- **`AskUserQuestion`** — the host's structured-question primitive (single or multi-select, optional free-form fallback). Used whenever a closed set of options fits. If the host exposes it under a vendor-specific path (`mcp__<vendor>__AskUserQuestion`, a built-in `AskUserQuestion` tool, a slash command, etc.), use it. If not, fall back to a numbered plain-text prompt with the same semantics.
- **Subagent** — any general-purpose agent the host can spawn (sub-task, background agent, research helper…). Used for the research passes so the main agent's context stays lean.

No assumption is made about the surrounding ADE, IDE, or coding agent.

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

**First**, dispatch a research subagent (any general-purpose research agent the host can spawn — it should have web search and fetch capabilities) to **propose** a list of plausible tracking sources for this orchestrator. Search for at least:

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

**Second**, present the discovered candidates via `AskUserQuestion`:

- Use **one multi-select question** titled e.g. *"Which sources should be tracked for `<toolName>`?"*.
- Each candidate becomes one option, formatted as `"<kind> — <label> — <url>"` so the user sees the kind/URL at a glance.
- Do **not** add an "Other" option manually if the tool already exposes a free-form entry — the user can paste any number of custom URLs the agent missed. If the host's `AskUserQuestion` does not expose a free-form fallback, add an explicit "Other (add URLs)" option that, when selected, triggers a follow-up free-form prompt.
- Verified candidates are listed first; `unverified` ones are suffixed with ` (unverified)` so the user knows to double-check before selecting.

After the user answers:

1. Keep every option they selected.
2. Parse any free-form text they entered as additional URL(s) — accept newline-, space- or comma-separated lists. For each, ask a tight follow-up `AskUserQuestion` to assign a `kind` from the allowed set when the URL alone is ambiguous; otherwise infer the kind from the host (e.g. `github.com/.../releases` → `github-releases`, `twitter.com|x.com` → `twitter`, `youtube.com` → `youtube`, `*.rss|/feed` → `rss`).
3. Discard everything else (rejected candidates, unverified non-selected).

Persist the retained set into `trackingSources` as `{ kind, label, url, notes? }`.

### 2c. Infer meta fields from the confirmed sources (then ask only on gaps)

Do **not** prompt the user up-front for vendor / platforms / pricing / model restriction. Instead, dispatch a research subagent over the confirmed `trackingSources` to **infer** each field, with strict evidence requirements:

- **Vendor** — company / organization behind the tool. Evidence: an "About" / footer / docs mention; record the source URL even though the schema does not store it (use it to justify the value to the user).
- **Supported platforms** (subset of `macos | windows | linux | web`) — for each, capture a `sourceUrl` (typically the install / download / docs page) + a `sourceExtract` quote that names the platform. The Zod schema **requires** a `platformSources` entry for every listed platform.
- **Pricing model** (`free | freemium | paid | oss`) — with `pricingSource.sourceUrl` + `sourceExtract` quoting the pricing page or license.
- **Model restriction** — only populate when the tool drives a **closed set** of models/agents (e.g. "Claude Code + Codex only"). Tools with broad BYOK/multi-provider support must leave this empty — model breadth belongs to the `multi-model` feature row.

For each field, the subagent must return either:
- a value backed by a `sourceUrl` + `sourceExtract`, **or**
- `unknown` if no evidence was found.

The subagent must return its findings as a single compact JSON object so the main agent does not have to re-absorb the verbose research transcript.

After research, **only** ask the user about fields the subagent returned as `unknown` (or fields where the user explicitly wants to override the inference). Use `AskUserQuestion` whenever the answer is a closed enum (pricing model: single-select; platforms: multi-select). Use a free-form prompt for the rest. Show the user the inferred values + their sources before persisting, so they can spot mistakes.

### 2b. Create the orchestrator directory

Create three files under `src/data/orchestrators/<toolId>/`:

- `_meta.ts` — implements `OrchestratorMeta` (see `src/data/version-diff.ts`). Mandatory fields: `toolId`, `toolName`, `homepage`, `platforms`, `platformSources`. Optional but recommended: `vendor`, `pricing`, `pricingSource`, `modelRestriction`, `trackingSources`. Follow the existing examples (`src/data/orchestrators/cursor/_meta.ts`, `src/data/orchestrators/conductor/_meta.ts`).

- `_latest-known-features.ts` — seed with **one `unknown` entry per feature** in `src/data/features.ts`, in the canonical order. This gives `review-orchestrator-version` the full to-do list to walk through:
  ```ts
  import type { FeatureSupport } from '../../schema';

  export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
    { featureId: 'git-worktrees',     support: 'unknown', screenshots: [] },
    { featureId: 'sandbox-isolation', support: 'unknown', screenshots: [] },
    // …one per feature in FEATURES, same order…
  ];
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

## Step 4 — Hand off to `review-orchestrator-version`

This skill does **not** research feature support. Instead, it delegates to the dedicated review skill, which walks every uncovered feature with the user, dispatching a fresh research agent per feature and persisting only what the user confirms.

Briefly summarise to the user what was just bootstrapped (toolId, version, whether the orchestrator was newly created, count of `unknown` feature rows seeded), then **invoke the `review-orchestrator-version` skill** with arguments `<toolId>@<version> --only-unreviewed` (using whatever skill-invocation mechanism the host agent provides — a slash command, a Skill tool call, an inline include of its SKILL.md, etc.; the argument string is what matters).

The review skill takes over and:

- Skips its own selection step (the `<toolId>@<version>` argument is pre-filled).
- Walks only features whose `support` is `unknown` or missing — for a fresh bootstrap that's the entire matrix; for a known orchestrator with a new version, only the rows still flagged unknown.
- Validates (`pnpm exec tsc --noEmit`) and creates the final commit.

Stop the `add` skill **immediately** after handing off — do **not** run `tsc`, do **not** create a commit, do **not** print a coverage summary. All of that is the review skill's responsibility.

---

## Reference files

- Schema: `src/data/schema.ts`
- Meta type + diff helper: `src/data/version-diff.ts`
- Feature catalog: `src/data/features.ts`
- Example fully-populated orchestrator: `src/data/orchestrators/conductor/`
- Example preview stub (empty matrix): `src/data/orchestrators/codex-app/`
- Auto-loader (no manual registration needed): `src/data/index.ts`
