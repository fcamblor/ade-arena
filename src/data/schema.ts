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
});
export type FeatureSupport = z.infer<typeof FeatureSupportSchema>;

export const OrchestratorVersionSchema = z.object({
  toolId: z.string().regex(/^[a-z0-9-]+$/),
  toolName: z.string(),
  version: z.string(),
  releaseDate: z.string().optional(),
  homepage: z.string().url(),
  logo: z.string().optional(),
  vendor: z.string().optional(),
  pricing: z.enum(['free', 'freemium', 'paid', 'oss']).optional(),
  notes: z.string().optional(),
  features: z.array(FeatureSupportSchema),
});
export type OrchestratorVersion = z.infer<typeof OrchestratorVersionSchema>;
