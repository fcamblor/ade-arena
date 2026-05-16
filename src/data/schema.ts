import { z } from 'zod';

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
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string(),
  category: FeatureCategorySchema,
  shortDescription: z.string(),
  longDescription: z.string().optional(),
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
  featureId: z.string(),
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

export const OrchestratorVersionSchema = z.object({
  toolId: z.string().regex(/^[a-z0-9-]+$/),
  toolName: z.string(),
  version: z.string(),
  versionDetails: z
    .object({
      buildHash: z.string().optional(),
      buildDate: z.string().optional(),
    })
    .optional(),
  releaseDate: z.string().optional(),
  homepage: z.string().url(),
  logo: z.string().optional(),
  vendor: z.string().optional(),
  pricing: z.enum(['free', 'freemium', 'paid', 'oss']).optional(),
  pricingSource: MetaSourceSchema.optional(),
  platforms: z.array(PlatformSchema).optional(),
  platformSources: z.record(PlatformSchema, MetaSourceSchema).optional(),
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
  misc: z
    .object({
      message: z.string(),
      sourceUrl: z.string().url().optional(),
    })
    .optional(),
  features: z.array(FeatureSupportSchema),
});
export type OrchestratorVersion = z.infer<typeof OrchestratorVersionSchema>;
