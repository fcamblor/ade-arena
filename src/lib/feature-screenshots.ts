import { ORCHESTRATORS, isDefaultVisible } from '../data';
import type { FeatureId } from '../data/schema';

export type FeatureScreenshot = {
  featureId: FeatureId;
  toolId: string;
  toolName: string;
  version: string;
  src: string;
  alt: string;
  caption?: string;
  support: 'yes' | 'partial';
};

export function getFeatureScreenshots(): Record<string, FeatureScreenshot[]> {
  const byFeature: Record<string, FeatureScreenshot[]> = {};

  for (const orchestrator of ORCHESTRATORS.filter(isDefaultVisible)) {
    for (const support of orchestrator.features) {
      if (support.support !== 'yes' && support.support !== 'partial') continue;
      for (const screenshot of support.screenshots ?? []) {
        (byFeature[support.featureId] ??= []).push({
          featureId: support.featureId,
          toolId: orchestrator.toolId,
          toolName: orchestrator.toolName,
          version: orchestrator.version,
          src: screenshot.src,
          alt: screenshot.alt,
          caption: screenshot.caption,
          support: support.support,
        });
      }
    }
  }

  return byFeature;
}
