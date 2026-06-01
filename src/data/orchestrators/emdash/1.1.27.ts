import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';
import { META } from './_meta';
import { LATEST_KNOWN_FEATURES } from './_latest-known-features';

// Preview entry — hidden from the default comparison table because of
// `status: 'waiting-for-review'`; reachable via `?preview=emdash@1.1.27`,
// `?preview=emdash`, or `?preview=*`. The feature matrix was researched from
// public sources but still needs a maintainer review pass (some rows are
// `unknown` pending evidence).
const data: OrchestratorVersion = {
  ...META,
  status: 'waiting-for-review',
  version: '1.1.27',
  releaseDate: '2026-05-31',
  notes:
    'Preview entry — feature matrix researched from public docs/changelog/README; pending maintainer review.',
  features: LATEST_KNOWN_FEATURES,
};

export default OrchestratorVersionSchema.parse(data);
