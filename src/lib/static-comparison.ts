import { ORCHESTRATORS } from '../data';
import { isApproved, isDefaultVisible } from '../data';
import type { OrchestratorVersion } from '../data/schema';
import { RATABLE_FEATURES } from './ratable-features';

export type RankingToolData = Pick<
  OrchestratorVersion,
  'toolId' | 'toolName' | 'version' | 'features' | 'platforms' | 'codebase'
> & {
  isDefaultVisible: boolean;
  status: 'approved' | 'waiting-for-review';
};

export function getRankingTools(): RankingToolData[] {
  const visibleFeatureIds = new Set(RATABLE_FEATURES.map((feature) => feature.id));

  return ORCHESTRATORS.map((tool) => ({
    toolId: tool.toolId,
    toolName: tool.toolName,
    version: tool.version,
    isDefaultVisible: isDefaultVisible(tool),
    status: isApproved(tool) ? 'approved' : 'waiting-for-review',
    platforms: tool.platforms,
    codebase: tool.codebase,
    features: tool.features
      .filter((feature) => visibleFeatureIds.has(feature.featureId))
      .map((feature) => ({
        featureId: feature.featureId,
        support: feature.support,
        note: feature.note,
        screenshots: [],
      })),
  }));
}
