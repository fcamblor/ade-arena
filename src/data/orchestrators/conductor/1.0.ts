import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';

const data: OrchestratorVersion = {
  toolId: 'conductor',
  toolName: 'Conductor',
  version: '1.0',
  homepage: 'https://conductor.build',
  vendor: 'Melty Labs',
  pricing: 'paid',
  features: [
    { featureId: 'parallel-agents', support: 'yes', note: 'Native parallel workspaces.', screenshots: [] },
    { featureId: 'git-worktrees', support: 'yes', screenshots: [] },
    { featureId: 'cloud-execution', support: 'no', screenshots: [] },
    { featureId: 'local-execution', support: 'yes', screenshots: [] },
    { featureId: 'multi-model', support: 'partial', note: 'Mostly Claude.', screenshots: [] },
    { featureId: 'pr-creation', support: 'yes', screenshots: [] },
    { featureId: 'kanban-board', support: 'no', screenshots: [] },
    { featureId: 'live-logs', support: 'yes', screenshots: [] },
    { featureId: 'diff-review', support: 'yes', screenshots: [] },
    { featureId: 'oss', support: 'no', screenshots: [] },
    { featureId: 'free-tier', support: 'yes', screenshots: [] },
    { featureId: 'self-hosted', support: 'no', screenshots: [] },
  ],
};

export default OrchestratorVersionSchema.parse(data);
