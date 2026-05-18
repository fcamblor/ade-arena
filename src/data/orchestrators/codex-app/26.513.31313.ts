import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';
import { META } from './_meta';
import { LATEST_KNOWN_FEATURES } from './_latest-known-features';

// Preview stub — data to be filled in by the next data-refresh pass. Hidden
// from the default table because of `status: 'waiting-for-review'`; reachable
// via `?preview=codex-app@26.513.31313`.
const data: OrchestratorVersion = {
  ...META,
  status: 'waiting-for-review',
  version: '26.513.31313',
  versionDetails: {
    buildHash: '2867',
  },
  releaseDate: '2026-05-18',
  notes: 'Preview entry — feature matrix not yet populated.',
  features: LATEST_KNOWN_FEATURES,
};

export default OrchestratorVersionSchema.parse(data);
