import { z } from 'zod';
import { FEATURE_IDS, type FeatureId } from './feature-ids';

export { FEATURE_IDS, type FeatureId };

export const FeatureIdSchema = z.enum(FEATURE_IDS);

export const FeatureCategorySchema = z.enum([
  'workflow',
  'collaboration',
  'integrations',
  'observability',
  'pricing',
  'ux',
  'platform',
]);
export type FeatureCategory = z.infer<typeof FeatureCategorySchema>;

export const FeatureSchema = z.object({
  id: FeatureIdSchema,
  label: z.string(),
  category: FeatureCategorySchema,
  /** Defaults to 'approved'. Waiting-for-review features stay in data files
   *  but are excluded from the public comparison table and score counts. */
  status: z.enum(['approved', 'waiting-for-review']).optional(),
  shortDescription: z.string(),
  longDescription: z.string().optional(),
  whyImportant: z
    .object({
      short: z.string(),
      long: z.string(),
    })
    .optional(),
});
export type Feature = z.infer<typeof FeatureSchema>;

export const SupportLevelSchema = z.enum(['yes', 'partial', 'no', 'unknown']);
export type SupportLevel = z.infer<typeof SupportLevelSchema>;

export const ScreenshotSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

export const FeatureSupportSchema = z.object({
  featureId: FeatureIdSchema,
  support: SupportLevelSchema,
  note: z.string().max(280).optional(),
  screenshots: z.array(ScreenshotSchema).default([]),
  sourceUrl: z.string().url().optional(),
  sourceExtract: z.string().optional(),
});
export type FeatureSupport = z.infer<typeof FeatureSupportSchema>;

export const PlatformSchema = z.enum(['macos', 'windows', 'linux', 'web']);
export type Platform = z.infer<typeof PlatformSchema>;

// A single piece of evidence backing a meta-field (pricing, platform, …).
// Same shape as the source fields on FeatureSupport, hoisted here so it can
// be attached to orchestrator-level metadata.
export const MetaSourceSchema = z.object({
  sourceUrl: z.string().url(),
  sourceExtract: z.string(),
});
export type MetaSource = z.infer<typeof MetaSourceSchema>;

// Where to watch for new versions / feature changes. Primarily consumed by
// the agent refreshing this dataset for a new version: instead of re-hunting
// for changelogs, blogs and docs each cycle, the curated source list is the
// starting point. Also surfaced to readers in a section under the table.
export const TrackingSourceKindSchema = z.enum([
  'release-notes',
  'changelog',
  'blog',
  'docs',
  'docs-diff',
  'rss',
  'github-releases',
  'github-commits',
  'discord',
  'twitter',
  'youtube',
  'other',
]);
export type TrackingSourceKind = z.infer<typeof TrackingSourceKindSchema>;

export const TrackingSourceSchema = z.object({
  kind: TrackingSourceKindSchema,
  label: z.string(),
  url: z.string().url(),
  notes: z.string().optional(),
});
export type TrackingSource = z.infer<typeof TrackingSourceSchema>;

// Lifecycle status of a version entry. Approved versions are part of the
// public table by default. Waiting-for-review versions are hidden until a
// reviewer opts in via the preview query param (`<toolId>@<version>`,
// `<toolId>`, or `*`, comma-separated). This lets PRs share a preview link
// without shipping unvetted data to every visitor.
export const VersionStatusSchema = z.enum(['approved', 'waiting-for-review']);
export type VersionStatus = z.infer<typeof VersionStatusSchema>;

// How a single vendor's models are wired into the orchestrator. Used to be a
// feature row (`multi-model-integration`) but it's really a property of the
// orchestrator-to-vendor binding, not a feature on its own.
export const ModelIntegrationKindSchema = z.enum([
  'provider-sdk',
  'cli-subprocess',
  'app-server-jsonrpc',
  'acp',
  'openai-compatible-api',
  'mcp',
  'other',
  'unknown',
]);
export type ModelIntegrationKind = z.infer<typeof ModelIntegrationKindSchema>;

export const ModelIntegrationSchema = z.object({
  vendor: z.string(),
  kind: ModelIntegrationKindSchema,
  notes: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  sourceExtract: z.string().optional(),
});
export type ModelIntegration = z.infer<typeof ModelIntegrationSchema>;

export const OrchestratorVersionSchema = z.object({
  toolId: z.string().regex(/^[a-z0-9-]+$/),
  toolName: z.string(),
  version: z.string(),
  /** Defaults to 'approved' when omitted — see VersionStatusSchema. */
  status: VersionStatusSchema.optional(),
  versionDetails: z
    .object({
      buildHash: z.string().optional(),
      buildDate: z.string().optional(),
    })
    .optional(),
  releaseDate: z.string(),
  homepage: z.string().url(),
  logo: z.string().optional(),
  vendor: z.string().optional(),
  pricing: z.enum(['free', 'freemium', 'paid', 'oss']).optional(),
  pricingSource: MetaSourceSchema.optional(),
  /** Whether the source code is publicly available, surfaced in the header
   *  as a pill next to the pricing one. Kept independent from `pricing` so
   *  that e.g. an open-source codebase can still ship as a paid SaaS, or a
   *  free tool can stay proprietary. */
  codebase: z.enum(['open-source', 'proprietary']).optional(),
  codebaseSource: MetaSourceSchema.optional(),
  platforms: z.array(PlatformSchema).min(1),
  platformSources: z.record(PlatformSchema, MetaSourceSchema),
  /** Strong restriction on the underlying model/agent the ADE can drive — only
   *  populated when meaningful (single vendor / closed set). Rendered as a
   *  warning notice in the header. Tools that broadly support BYOK or many
   *  providers should leave this empty: model details belong to the
   *  multi-model feature row. */
  modelRestriction: z
    .object({
      message: z.string(),
      sourceUrl: z.string().url().optional(),
    })
    .optional(),
  notes: z.string().optional(),
  /** How each supported vendor's models are wired into the orchestrator —
   *  provider SDK, CLI subprocess, app-server JSON-RPC, ACP, OpenAI-compatible
   *  HTTP, MCP… Surfaces under the table header as a meta detail; not a
   *  feature row. */
  modelIntegrations: z.array(ModelIntegrationSchema).optional(),
  trackingSources: z.array(TrackingSourceSchema).optional(),
  misc: z
    .object({
      message: z.string(),
      sourceUrl: z.string().url().optional(),
    })
    .optional(),
  features: z.array(FeatureSupportSchema),
}).superRefine((data, ctx) => {
  for (const platform of data.platforms) {
    if (!data.platformSources[platform]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['platformSources', platform],
        message: `Missing platformSources entry for platform "${platform}". Every supported platform must be backed by a sourceUrl + sourceExtract.`,
      });
    }
  }
});
export type OrchestratorVersion = z.infer<typeof OrchestratorVersionSchema>;
