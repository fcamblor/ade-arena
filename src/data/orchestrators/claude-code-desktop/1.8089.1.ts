import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';
import { META } from './_meta';
import { LATEST_KNOWN_FEATURES } from './_latest-known-features';

const data: OrchestratorVersion = {
  ...META,
  version: '1.8089.1',
  releaseDate: '2026-05-19',
  versionDetails: {
    buildHash: 'b98a06',
    buildDate: '2026-05-19T18:28:48.000Z',
  },
  features: LATEST_KNOWN_FEATURES,
};

export default OrchestratorVersionSchema.parse(data);
