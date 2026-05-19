import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';
import { deriveVersionFeatures, type FeatureDiff } from '../../version-diff';
import { META } from './_meta';
import { LATEST_KNOWN_FEATURES } from './_latest-known-features';

const diffs: readonly FeatureDiff[] = [
  {
    override: 'diff-whitespace-toggle',
    with: {
      support: 'no',
      note: 'Ignore-whitespace toggle was not supported before Conductor 0.54.',
      screenshots: [],
    },
  },
];

const data: OrchestratorVersion = {
  ...META,
  version: '0.52.3',
  releaseDate: '2026-05-07',
  features: deriveVersionFeatures(LATEST_KNOWN_FEATURES, diffs),
};

export default OrchestratorVersionSchema.parse(data);
