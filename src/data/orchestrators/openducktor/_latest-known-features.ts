import type { FeatureSupport } from '../../schema';

export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
  { 
    featureId: 'git-worktrees', 
    support: 'yes', 
    note: 'Each Builder task runs in a dedicated Git worktree to isolate implementation from the main checkout.',
    screenshots: [] 
  },
  { 
    featureId: 'sandbox-isolation', 
    support: 'no', 
    note: 'The orchestrator delegates execution to local runtimes (OpenCode, Codex) and does not natively wrap tools in a Docker/VM sandbox.',
    screenshots: [] 
  },
  { 
    featureId: 'remote-agent-execution', 
    support: 'no', 
    note: 'Focuses on local desktop and web runner executions.',
    screenshots: [] 
  },
  { 
    featureId: 'local-execution', 
    support: 'yes', 
    note: 'macOS desktop app and local web runner supported out of the box.',
    screenshots: [] 
  },
  { 
    featureId: 'multiple-model-families', 
    support: 'yes', 
    note: 'Supports OpenCode and Codex runtimes out of the box.',
    screenshots: [] 
  },
  { 
    featureId: 'pr-creation', 
    support: 'yes', 
    note: 'The approval flow includes a dedicated Builder session to generate the pull request (build_pull_request_generation).',
    screenshots: [] 
  },
  { 
    featureId: 'visual-task-management', 
    support: 'yes', 
    note: 'Task-first workflow with a Kanban board as the main operational view.',
    screenshots: [] 
  },
  { featureId: 'live-logs', support: 'unknown', screenshots: [] },
  { featureId: 'ui-commit', support: 'unknown', screenshots: [] },
  {
    featureId: 'diff-viewer',
    support: 'yes', 
    note: 'Built-in tools to inspect diffs and track Git state for the worktree.',
    screenshots: [] 
  },
  { featureId: 'diff-whitespace-toggle', support: 'unknown', screenshots: [] },
  { featureId: 'diff-multi-views', support: 'unknown', screenshots: [] },
  { 
    featureId: 'self-hosted', 
    support: 'yes', 
    note: 'Open source local application.',
    screenshots: [] 
  },
  { featureId: 'sound-notifications', support: 'unknown', screenshots: [] },
  { featureId: 'multi-sessions-per-worktree', support: 'unknown', screenshots: [] },
  { featureId: 'no-worktree-mode', support: 'unknown', screenshots: [] },
  { featureId: 'workflow-shell-hooks', support: 'unknown', screenshots: [] },
  { featureId: 'run-configurations', support: 'unknown', screenshots: [] },
  { featureId: 'worktree-port-env-vars', support: 'unknown', screenshots: [] },
  { featureId: 'diff-comments', support: 'unknown', screenshots: [] },
  { featureId: 'github-comment-sync', support: 'unknown', screenshots: [] },
  { featureId: 'terminal-in-worktree', support: 'unknown', screenshots: [] },
  { featureId: 'open-in-ide', support: 'unknown', screenshots: [] },
  { featureId: 'file-tree-browser', support: 'unknown', screenshots: [] },
  { featureId: 'inline-file-editing', support: 'unknown', screenshots: [] },
  { featureId: 'custom-ui-actions', support: 'unknown', screenshots: [] },
  { 
    featureId: 'session-handoff', 
    support: 'yes', 
    note: 'Context handoff occurs via task-linked documents (spec, implementation plan, QA reports) stored in the Beads issue tracker metadata instead of a traditional .context folder.',
    screenshots: [] 
  },
  { featureId: 'remote-plan-collaboration', support: 'unknown', screenshots: [] },
  { featureId: 'shared-config', support: 'unknown', screenshots: [] },
  { featureId: 'pr-status-sync', support: 'unknown', screenshots: [] },
  { featureId: 'remote-session-control', support: 'unknown', screenshots: [] },
  { featureId: 'context-fill-indicator', support: 'unknown', screenshots: [] },
  { featureId: 'switch-model-mid-session', support: 'unknown', screenshots: [] },
  { featureId: 'model-effort-support', support: 'unknown', screenshots: [] },
  { featureId: 'web-preview', support: 'unknown', screenshots: [] },
  { featureId: 'web-preview-annotation', support: 'unknown', screenshots: [] },
  { featureId: 'web-preview-element-inspector', support: 'unknown', screenshots: [] },
  { 
    featureId: 'plugin-system', 
    support: 'yes', 
    note: 'Built-in MCP server allows defining workflows, and it supports hooking into different runtimes via an adapter model.',
    screenshots: [] 
  },
  { featureId: 'quick-chat', support: 'unknown', screenshots: [] },
  { featureId: 'mission-control', support: 'unknown', screenshots: [] },
  { featureId: 'copy-from-origin-workspace', support: 'unknown', screenshots: [] },
  { featureId: 'symlink-from-origin-workspace', support: 'unknown', screenshots: [] },
  { 
    featureId: 'chat-user-questions', 
    support: 'yes', 
    note: 'The system intercepts MCP pending permissions and pending questions to expose them to the user.',
    screenshots: [] 
  },
  { featureId: 'chat-rewind', support: 'unknown', screenshots: [] },
  { 
    featureId: 'readonly-plan-research-mode', 
    support: 'yes', 
    note: 'Specifier and Planner roles are explicitly read-only and automatically reject mutating permissions.',
    screenshots: [] 
  },
  { 
    featureId: 'predefined-deterministic-workflows', 
    support: 'yes', 
    note: 'Follows a strict Specifier -> Planner -> Builder -> QA loop based on task transitions.',
    screenshots: [] 
  },
  { featureId: 'custom-deterministic-workflows', support: 'unknown', screenshots: [] },
  { featureId: 'shared-discussion-workflows', support: 'unknown', screenshots: [] },
  { featureId: 'fork-workspace', support: 'unknown', screenshots: [] },
  { featureId: 'in-app-voice-input', support: 'unknown', screenshots: [] },
  { featureId: 'local-target-branch-merge', support: 'unknown', screenshots: [] },
  { featureId: 'llm-assisted-merge-rebase', support: 'unknown', screenshots: [] },
  { featureId: 'chat-message-stacking', support: 'unknown', screenshots: [] },
  { featureId: 'multi-repository-view', support: 'unknown', screenshots: [] },
  { featureId: 'multi-repository-chat-targeting', support: 'unknown', screenshots: [] },
  { featureId: 'chat-turn-diff', support: 'unknown', screenshots: [] },
  { featureId: 'unarchive-worktree', support: 'unknown', screenshots: [] },
];
