// Canonical list of feature ids, declared as a `const` tuple so TypeScript
// derives a literal union (`FeatureId`) from it. The union is wired into the
// zod schemas in `schema.ts` (via `z.enum(FEATURE_IDS)`), which is what makes
// every `featureId` reference in orchestrator/version data fail `astro check`
// when the id does not exist here.
//
// This file intentionally has no dependency on `schema.ts` to avoid a circular
// import — `schema.ts` consumes FEATURE_IDS at module-init time.
//
// Ordering mirrors `features.ts`: features are grouped by category in the same
// order the comparison table renders them (workflow → ux → integrations →
// observability → collaboration → platform). The order is purely for
// readability — only membership in this tuple is semantically meaningful.
export const FEATURE_IDS = [
  // workflow
  'git-worktrees',
  'sandbox-isolation',
  'no-worktree-mode',
  'multi-sessions-per-worktree',
  'workflow-shell-hooks',
  'worktree-port-env-vars',
  'copy-from-origin-workspace',
  'symlink-from-origin-workspace',
  'session-handoff',
  'readonly-plan-research-mode',
  'predefined-deterministic-workflows',
  'custom-deterministic-workflows',
  'fork-workspace',
  'unarchive-worktree',
  'local-target-branch-merge',
  'llm-assisted-merge-rebase',
  'multi-repository-view',
  'multi-repository-chat-targeting',
  // ux
  'visual-task-management',
  'mission-control',
  'file-tree-browser',
  'inline-file-editing',
  'terminal-in-worktree',
  'run-configurations',
  'custom-ui-actions',
  'ui-commit',
  'diff-viewer',
  'diff-whitespace-toggle',
  'diff-multi-views',
  'chat-turn-diff',
  'diff-comments',
  'chat-user-questions',
  'chat-rewind',
  'chat-message-stacking',
  'in-app-voice-input',
  'quick-chat',
  'web-preview',
  'web-preview-annotation',
  'web-preview-element-inspector',
  // integrations
  'multiple-model-families',
  'model-effort-support',
  'switch-model-mid-session',
  'open-in-ide',
  'pr-creation',
  'pr-status-sync',
  'github-comment-sync',
  // observability
  'live-logs',
  'context-fill-indicator',
  'sound-notifications',
  'chat-transcript-export',
  // collaboration
  'remote-plan-collaboration',
  'shared-config',
  'shared-discussion-workflows',
  // platform
  'remote-agent-execution',
  'local-execution',
  'self-hosted',
  'plugin-system',
  'remote-session-control',
] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];
