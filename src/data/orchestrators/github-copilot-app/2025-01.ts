import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';

const data: OrchestratorVersion = {
  toolId: 'github-copilot-app',
  toolName: 'GitHub Copilot Coding Agent',
  version: '2025-01',
  homepage: 'https://github.com/features/copilot',
  vendor: 'GitHub',
  pricing: 'paid',
  features: [
    { featureId: 'parallel-agents', support: 'yes', screenshots: [] },
    { featureId: 'git-worktrees', support: 'no', screenshots: [] },
    { featureId: 'cloud-execution', support: 'yes', note: 'Runs on GitHub Actions.', screenshots: [] },
    { featureId: 'local-execution', support: 'no', screenshots: [] },
    { featureId: 'multi-model', support: 'yes', screenshots: [] },
    { featureId: 'pr-creation', support: 'yes', screenshots: [] },
    { featureId: 'kanban-board', support: 'partial', note: 'Through GitHub Projects.', screenshots: [] },
    { featureId: 'live-logs', support: 'yes', screenshots: [] },
    { featureId: 'diff-review', support: 'yes', note: 'Through the GitHub PR.', screenshots: [] },
    { featureId: 'oss', support: 'no', screenshots: [] },
    { featureId: 'free-tier', support: 'no', screenshots: [] },
    { featureId: 'self-hosted', support: 'no', screenshots: [] },
  ],
};

export default OrchestratorVersionSchema.parse(data);
