import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';

const data: OrchestratorVersion = {
  toolId: 'vibe-kanban',
  toolName: 'Vibe Kanban',
  version: '0.5',
  homepage: 'https://www.vibekanban.com',
  pricing: 'oss',
  features: [
    { featureId: 'parallel-agents', support: 'yes', screenshots: [] },
    { featureId: 'git-worktrees', support: 'yes', screenshots: [] },
    { featureId: 'cloud-execution', support: 'no', screenshots: [] },
    { featureId: 'local-execution', support: 'yes', screenshots: [] },
    { featureId: 'multi-model', support: 'yes', note: 'Claude Code, Codex, Gemini, Aider…', screenshots: [] },
    { featureId: 'pr-creation', support: 'yes', screenshots: [] },
    { featureId: 'kanban-board', support: 'yes', screenshots: [] },
    { featureId: 'live-logs', support: 'yes', screenshots: [] },
    { featureId: 'diff-review', support: 'yes', screenshots: [] },
    { featureId: 'oss', support: 'yes', screenshots: [] },
    { featureId: 'free-tier', support: 'yes', screenshots: [] },
    { featureId: 'self-hosted', support: 'yes', screenshots: [] },
  ],
};

export default OrchestratorVersionSchema.parse(data);
