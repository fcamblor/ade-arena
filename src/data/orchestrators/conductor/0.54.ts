import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';
import { META } from './_meta';
import { LATEST_KNOWN_FEATURES } from './_latest-known-features';

// Preview stub — released version added before a full feature-matrix refresh.
// Hidden from the default table because of `status: 'waiting-for-review'`;
// reachable via `?preview=conductor@0.54`.
const data: OrchestratorVersion = {
  ...META,
  version: '0.54',
  releaseDate: '2026-05-18',
  notes: 'Preview entry — feature matrix not yet reviewed for Conductor 0.54.',
  features: LATEST_KNOWN_FEATURES,
};

export default OrchestratorVersionSchema.parse(data);
