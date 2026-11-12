import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';
import { META } from './_meta';
import { LATEST_KNOWN_FEATURES } from './_latest-known-features';

const data: OrchestratorVersion = {
  ...META,
  status: 'waiting-for-review',
  version: '0.3.1',
  versionDetails: {
    buildHash: '33af45509cbcf32b5eb4553966386f67290c7063',
  },
  releaseDate: '2026-11-06',
  features: LATEST_KNOWN_FEATURES,
};

export default OrchestratorVersionSchema.parse(data);
