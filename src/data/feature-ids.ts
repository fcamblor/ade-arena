// Canonical list of feature ids, declared as a `const` tuple so TypeScript
// derives a literal union (`FeatureId`) from it. The union is wired into the
// zod schemas in `schema.ts` (via `z.enum(FEATURE_IDS)`), which is what makes
// every `featureId` reference in orchestrator/version data fail `astro check`
// when the id does not exist here.
//
// This file intentionally has no dependency on `schema.ts` to avoid a circular
// import — `schema.ts` consumes FEATURE_IDS at module-init time.
export const FEATURE_IDS = [
  'git-worktrees',
  'sandbox-isolation',
  'cloud-execution',
  'local-execution',
  'multiple-model-families',
  'pr-creation',
  'visual-task-management',
  'live-logs',
  'diff-viewer',
  'diff-whitespace-toggle',
  'diff-multi-views',
  'self-hosted',
  'sound-notifications',
  'multi-sessions-per-worktree',
  'no-worktree-mode',
  'workflow-shell-hooks',
  'run-configurations',
  'worktree-port-env-vars',
  'supported-assistants',
  'diff-comments',
  'github-comment-sync',
  'terminal-in-worktree',
  'open-in-ide',
  'file-tree-browser',
  'inline-file-editing',
  'custom-ui-actions',
  'session-handoff',
  'remote-file-sharing',
  'shared-config',
  'pr-status-sync',
  'remote-session-control',
  'context-fill-indicator',
  'switch-model-mid-session',
  'model-effort-support',
  'web-preview',
  'plugin-system',
  'quick-chat',
  'mission-control',
  'copy-from-origin-workspace',
  'symlink-from-origin-workspace',
  'chat-user-questions',
  'chat-rewind',
  'predefined-workflows-sessions',
  'custom-discussion-workflows',
  'shared-discussion-workflows',
  'fork-workspace',
] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];
