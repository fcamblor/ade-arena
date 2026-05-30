import type { FeatureId, Platform, SupportLevel } from '../../data/schema';

// Draft model for the in-browser "propose an orchestrator / version" tunnel.
//
// Everything lives device-side: the JSON draft in one IndexedDB store, the
// screenshot binaries (Blobs) in another. No server round-trip — the only
// outbound artefact is the ZIP the contributor downloads at the end and the
// GitHub issue they open from it.

export type ContributionMode = 'new-tool' | 'new-version';

// A screenshot attached to a feature. For freshly uploaded shots the binary is
// stored separately in the `blobs` IndexedDB store under `id`; this record only
// carries the metadata that ends up in the generated `Screenshot` entry.
//
// In `new-version` mode the list is pre-filled with the baseline's existing
// screenshots: those carry `baselineSrc` (the already-published public path,
// rendered directly — no Blob) and `inherited` (the original alt/caption, so
// the tunnel can show the baseline text once the contributor edits it).
export type DraftScreenshot = {
  id: string; // uuid — also the key of the Blob in the `blobs` store
  /** Generated, repo-convention filename: `<featureId>_<YYYYMMDD>_<n>.<ext>`. */
  filename: string;
  mimeType: string;
  /** Required `alt` text for the generated `Screenshot`. */
  alt: string;
  /** Optional `caption` for the generated `Screenshot`. */
  caption?: string;
  /**
   * Baseline-origin only: the existing public `src` to render directly. These
   * screenshots already live in the repo, so there is no Blob in IndexedDB and
   * nothing is re-added to the export ZIP.
   */
  baselineSrc?: string;
  /**
   * Baseline-origin only: the alt/caption the screenshot was inherited with, so
   * the tunnel can show the original text for reference once it is edited.
   */
  inherited?: { src: string; alt: string; caption?: string };
  /**
   * Baseline-origin only: marked for removal vs the baseline. Kept in the list
   * (not hard-deleted) so the diff against the baseline stays explicit in both
   * the UI and the generated override.
   */
  removed?: boolean;
};

// The baseline value a feature support was inherited from, in `new-version`
// mode. Kept on the draft so the tunnel can show "this changed" badges and so
// the generator can decide whether to emit an `override` diff entry.
export type InheritedSupport = {
  support: SupportLevel;
  note?: string;
  sourceUrl?: string;
  sourceExtract?: string;
  /** Count of screenshots carried by the baseline (display only). */
  screenshotCount: number;
};

// A baseline screenshot, as published in the existing dataset. Pre-filled into
// the draft (and rendered) so a `new-version` contributor edits/removes against
// the real screenshots rather than starting from an empty slate.
export type BaselineScreenshot = {
  src: string;
  alt: string;
  caption?: string;
};

// Per-feature support the contributor fills in. Maps closely onto the
// `FeatureSupport` schema, minus the binary handling.
export type DraftFeatureSupport = {
  featureId: FeatureId;
  support: SupportLevel;
  note?: string;
  sourceUrl?: string;
  sourceExtract?: string;
  screenshots: DraftScreenshot[];
  /** Present only in `new-version` mode — the latest-known baseline value. */
  inherited?: InheritedSupport;
  /** Set once the contributor has visited and confirmed this feature. */
  reviewed?: boolean;
};

// Tool-level metadata. Mirrors the editable fields of `OrchestratorMeta`.
// Source evidence (pricingSource, platformSources, …) is intentionally left
// to the maintainer integrating the PR — the tunnel keeps the contributor
// flow light and captures sources per-feature instead.
export type ContributionMeta = {
  toolId: string;
  toolName: string;
  homepage: string;
  vendor?: string;
  pricing?: 'free' | 'freemium' | 'paid' | 'oss';
  codebase?: 'open-source' | 'proprietary';
  platforms: Platform[];
  modelRestriction?: string;
};

export type ContributionDraft = {
  id: string;
  /** Bumped if the persisted shape changes, so we can migrate or discard. */
  schemaVersion: 1;
  mode: ContributionMode;
  meta: ContributionMeta;
  version: string;
  /** ISO `YYYY-MM-DD`. */
  releaseDate: string;
  /** `new-version` only: the existing tool this proposal extends. */
  baseToolId?: string;
  /** `new-version` only: the version the baseline was pre-filled from. */
  baseVersion?: string;
  /** Keyed by featureId. */
  features: Record<string, DraftFeatureSupport>;
  createdAt: string;
  updatedAt: string;
};

// Serializable snapshot the Astro page hands to the Svelte island so the
// tunnel can offer "new version of an existing tool" with pre-filled values
// without importing the whole data layer into the client bundle.
export type ToolBaseline = {
  toolId: string;
  toolName: string;
  homepage: string;
  vendor?: string;
  pricing?: 'free' | 'freemium' | 'paid' | 'oss';
  codebase?: 'open-source' | 'proprietary';
  platforms: Platform[];
  modelRestriction?: string;
  /** Latest known version — the baseline the new proposal diffs against. */
  baseVersion: string;
  features: Array<{
    featureId: FeatureId;
    support: SupportLevel;
    note?: string;
    sourceUrl?: string;
    sourceExtract?: string;
    /** The baseline's published screenshots, pre-filled into the draft. */
    screenshots: BaselineScreenshot[];
  }>;
};
