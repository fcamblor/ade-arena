import type { FeatureSupport } from '../../schema';

export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
  {
    featureId: 'git-worktrees',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/creating-workspaces',
    sourceExtract:
      'Vibe Kanban creates a git worktree — a separate working directory with its own branch.',
  },
  {
    featureId: 'sandbox-isolation',
    support: 'no',
    note: 'No orchestrator-managed sandbox: agent CLIs run with the host user’s permissions inside the worktree. Any confinement is whatever the underlying agent provides.',
    screenshots: [],
  },
  { featureId: 'remote-agent-execution', support: 'no', screenshots: [] },
  {
    featureId: 'local-execution',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/getting-started',
    sourceExtract:
      'Then in your terminal run: npx vibe-kanban. This launches the Vibe Kanban client and opens the UI in your browser.',
  },
  {
    featureId: 'multiple-model-families',
    support: 'yes',
    note: '10+ coding agents from multiple vendor families: Anthropic (Claude Code), OpenAI (Codex), Google (Gemini), GitHub (Copilot), Cursor, Sourcegraph (Amp), Alibaba (Qwen Code), and more.',
    screenshots: [],
    sourceUrl: 'https://github.com/BloopAI/vibe-kanban',
    sourceExtract:
      'Switch between 10+ coding agents — Claude Code, Codex, Gemini CLI, GitHub Copilot, Amp, Cursor, OpenCode, Droid, CCR, and Qwen Code.',
  },
  {
    featureId: 'pr-creation',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/integrations/github-integration',
    sourceExtract:
      'Once the GitHub CLI is ready, you can create pull requests directly from a task. Click the Create PR button.',
  },
  {
    featureId: 'visual-task-management',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://github.com/BloopAI/vibe-kanban',
    sourceExtract:
      'Plan with kanban issues — create, prioritise, and assign issues on a kanban board.',
  },
  {
    featureId: 'live-logs',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/interface',
    sourceExtract:
      'Logs panel shows process execution logs. Process tabs: switch between different running processes. View stdout/stderr in real-time.',
  },
  {
    featureId: 'ui-commit',
    support: 'no',
    note: 'The git action registry exposes only PR, merge, rebase, push, change-target and link-pr — there is no commit/staging surface or commit-message field. The coding agent commits its own work.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/shared/actions/index.ts',
    sourceExtract:
      "GitPanel action map covers 'pull-request', 'link-pr', merge, rebase, 'change-target' and push — no commit/stage action.",
  },
  {
    featureId: 'diff-viewer',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/changes',
    sourceExtract:
      'The changes panel lets you review all code modifications in your workspace and provide feedback to agents.',
  },
  {
    featureId: 'diff-whitespace-toggle',
    support: 'yes',
    note: 'Ignore Whitespace toggle in the file tree hides whitespace-only changes.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/reviewing-code',
    sourceExtract:
      'The file tree shows all files that were added, modified, or deleted. […] toggle "Ignore Whitespace" to show/hide whitespace-only changes.',
  },
  {
    featureId: 'diff-multi-views',
    support: 'no',
    note: 'The changes panel is fed by a single workspace-branch-vs-target diff stream (git/diff/ws); the only toggles are display modes (split/inline, ignore-whitespace, wrap), not scope selectors (per-commit, uncommitted-only).',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/shared/hooks/useDiffStream.ts',
    sourceExtract: 'Single diff source GET /workspaces/{id}/git/diff/ws with only a stats_only param.',
  },
  {
    featureId: 'self-hosted',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/self-hosting/deploy-docker',
    sourceExtract:
      'Deploy Vibe Kanban Cloud on any server using Docker Compose. This approach works with any cloud provider (AWS, DigitalOcean, Hetzner, etc.) or on-premises server.',
  },
  {
    featureId: 'sound-notifications',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/settings/general',
    sourceExtract:
      'Sound Effects: play audio notifications when tasks complete, need attention, or encounter errors.',
  },
  {
    featureId: 'multi-sessions-per-worktree',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/sessions',
    sourceExtract: 'Sessions are independent processes — one can be running while another is idle.',
  },
  {
    featureId: 'no-worktree-mode',
    support: 'no',
    note: 'Worktree creation is a required step for every workspace.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/creating-workspaces',
    sourceExtract:
      'Vibe Kanban creates a git worktree — a separate working directory with its own branch.',
  },
  {
    featureId: 'workflow-shell-hooks',
    support: 'partial',
    note: 'Setup script only (runs before the agent starts); no archival/lifecycle hooks documented.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/settings/projects-repositories',
    sourceExtract:
      'Setup scripts: commands that run before the coding agent starts working. Use this to prepare the development environment.',
  },
  {
    featureId: 'run-configurations',
    support: 'partial',
    note: 'Three predefined scripts (Dev Server, Setup, Cleanup); dev server toggleable from the UI, but no user-defined arbitrary run configurations.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/interface',
    sourceExtract:
      'Toggle Preview — show or hide the preview panel. Toggle Dev Server — start or stop the development server.',
  },
  {
    featureId: 'worktree-port-env-vars',
    support: 'no',
    note: 'No per-worktree port allocation or env-var pool documented.',
    screenshots: [],
  },
  {
    featureId: 'diff-comments',
    support: 'yes',
    note: 'Inline comments collected and sent to the agent in the next message.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/changes',
    sourceExtract:
      'Add comments directly on code changes to provide feedback to agents. […] Comments are visible to the agent in subsequent messages, helping guide further development.',
  },
  {
    featureId: 'github-comment-sync',
    support: 'partial',
    note: 'One-way: GitHub PR comments are surfaced inside the Changes panel; in-app comments are sent to the agent, not pushed to GitHub.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/changes',
    sourceExtract: 'Viewing GitHub PR comments within the Changes panel.',
  },
  {
    featureId: 'terminal-in-worktree',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/interface',
    sourceExtract:
      'Expandable terminal — full terminal emulation powered by xterm.js. Run any command — git, npm, build scripts, etc.',
  },
  {
    featureId: 'open-in-ide',
    support: 'yes',
    note: 'VS Code, Cursor, Windsurf, Zed, Antigravity, Neovim, Emacs, Sublime Text, plus custom editor command.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/settings/general',
    sourceExtract:
      'You can select from multiple supported editors including VS Code, Cursor, Windsurf, Zed, Antigravity, Neovim, Emacs, Sublime Text, or configure a custom editor using shell commands.',
  },
  {
    featureId: 'file-tree-browser',
    support: 'partial',
    note: 'Changed-files tree inside the diff panel; no full worktree browser documented.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/interface',
    sourceExtract: 'File tree: hierarchical view of changed files.',
  },
  {
    featureId: 'inline-file-editing',
    support: 'no',
    note: 'Files are reviewed and commented on; no in-app editor documented. Open-in-IDE is the documented path to edit.',
    screenshots: [],
  },
  {
    featureId: 'custom-ui-actions',
    support: 'partial',
    note: 'Slash commands surface LLM prompts in the chat; no user-defined shell-command buttons.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/slash-commands',
    sourceExtract:
      'Type "/" at the beginning of a new line in the chat input and a typeahead menu will appear showing available commands.',
  },
  {
    featureId: 'session-handoff',
    support: 'no',
    note: 'No shared-context dir; sessions explicitly do not inherit conversation history.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/sessions',
    sourceExtract:
      "New sessions don't inherit conversation history. The new agent won't know what happened in previous sessions unless you explain it again or it reads the file changes.",
  },
  {
    featureId: 'remote-plan-collaboration',
    support: 'no',
    note: 'No remote plan-collaboration feature documented.',
    screenshots: [],
  },
  {
    featureId: 'shared-config',
    support: 'yes',
    note: 'Cloud mode exposes organization-wide settings and project settings, so the interesting bits of configuration can be shared with teammates.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/cloud/organizations',
    sourceExtract:
      'Settings — configuration that applies to all projects. Members can edit project settings independent of organization-wide controls.',
  },
  {
    featureId: 'pr-status-sync',
    support: 'partial',
    note: 'PR-status badge on the workspace sidebar; no auto-archive on merge documented (archive is manual).',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/interface',
    sourceExtract:
      'PR Status — badge showing linked pull request status. Archive — move completed workspaces out of the main list.',
  },
  {
    featureId: 'remote-session-control',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/remote-access',
    sourceExtract:
      'Remote Access allows you to access a host instance of Vibe Kanban from another device, like your mobile phone.',
  },
  {
    featureId: 'context-fill-indicator',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/chat-interface',
    sourceExtract:
      "The context gauge shows how much of the agent's context window is used (e.g., 13% usage with 27K of 200K tokens used).",
  },
  {
    featureId: 'switch-model-mid-session',
    support: 'partial',
    note: 'Agent dropdown is set per session before sending a message; TUI /model command is unsupported. Cross-vendor switches effectively spin up a new session.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/sessions',
    sourceExtract: 'Select a different agent from the Agent dropdown before sending your message.',
  },
  {
    featureId: 'model-effort-support',
    support: 'yes',
    note: 'reasoning_effort exposed for Codex (low/medium/high) and Droid (off/low/medium/high) agent configurations.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/settings/agent-configurations',
    sourceExtract:
      'Controls how much computational effort the model spends "thinking" before responding. Higher reasoning produces more thorough analysis but takes longer and uses more tokens.',
  },
  {
    featureId: 'web-preview',
    support: 'yes',
    note: 'Built-in preview browser tied to the dev server script configured per repository.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/interface',
    sourceExtract:
      'Preview View: built-in browser for testing your application. Dev server tabs: multiple dev servers supported. Device modes: desktop, mobile, custom viewport. Process logs: view dev server output.',
  },
  {
    featureId: 'plugin-system',
    support: 'no',
    note: 'No plugin / extension mechanism documented.',
    screenshots: [],
  },
  {
    featureId: 'quick-chat',
    support: 'no',
    note: 'Chat lives inside the conversation panel of a workspace, which requires a project / repository.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/chat-interface',
    sourceExtract: 'The chat interface is part of the Conversation Panel within workspaces.',
  },
  {
    featureId: 'mission-control',
    support: 'no',
    note: 'Live workspace sidebar groups Needs Attention / Idle / Running across workspaces, but no dedicated historical/audit timeline of past activity is documented.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/interface',
    sourceExtract:
      'The sidebar can toggle between flat list and accordion layouts that group workspaces by status (Needs Attention, Idle, and Running).',
  },
  {
    featureId: 'copy-from-origin-workspace',
    support: 'no',
    note: 'No mechanism documented; uncommitted files in the origin repo are flagged as a failure cause for worktree creation.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/creating-workspaces',
    sourceExtract:
      'Git worktree creation failed (usually due to uncommitted changes in the original repo). Commit or stash any uncommitted changes in your original repository.',
  },
  {
    featureId: 'symlink-from-origin-workspace',
    support: 'no',
    note: 'No symlink / shared-file mechanism documented.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/creating-workspaces',
    sourceExtract:
      'Vibe Kanban creates a git worktree — a separate working directory with its own branch.',
  },
  {
    featureId: 'chat-rewind',
    support: 'yes',
    note: 'Editing a prior chat message re-runs from that point: later processes are deleted and (by default) the worktree is git-reset to that message, so both conversation history and filesystem state roll back.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/features/workspace-chat/model/hooks/useMessageEditRetry.ts',
    sourceExtract:
      'followUp with retry_process_id and perform_git_reset (default true) — "Your worktree will be restored to this commit."',
  },
  {
    featureId: 'predefined-deterministic-workflows',
    support: 'no',
    note: 'Chat sessions are free-form; no built-in research/plan/implement/review phased workflow documented.',
    screenshots: [],
  },
  {
    featureId: 'custom-deterministic-workflows',
    support: 'no',
    note: 'Slash commands surface single prompts but no multi-step discussion-workflow authoring is documented.',
    screenshots: [],
  },
  {
    featureId: 'shared-discussion-workflows',
    support: 'no',
    note: 'No discussion-workflow concept to share.',
    screenshots: [],
  },
  {
    featureId: 'fork-workspace',
    support: 'no',
    note: 'No documented "fork workspace" action; new workspaces are created from the source repo, not by cloning an existing workspace.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/creating-workspaces',
    sourceExtract:
      'Vibe Kanban creates a git worktree — a separate working directory with its own branch.',
  },
  {
    featureId: 'chat-user-questions',
    support: 'yes',
    note: 'Agent ask_user_question tool calls render as an interactive AskUserQuestionBanner — clickable single-select buttons, multi-select with a confirm button, and a free-text/"Other" answer — instead of raw markdown.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/ui/src/components/AskUserQuestionBanner.tsx',
    sourceExtract:
      'AskUserQuestionBanner handles single-select option buttons, multi-select with confirm, and custom free-text answers.',
  },
  {
    featureId: 'readonly-plan-research-mode',
    support: 'yes',
    note: 'Both the Claude and Codex executors expose a `plan` config toggle: when on, permission_mode() returns Plan and a PreToolUse hook blocks every editing tool except ExitPlanMode/AskUserQuestion — a read-only planning mode (per-executor config, not a one-click chat toggle).',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/crates/executors/src/executors/claude.rs',
    sourceExtract:
      'fn permission_mode(&self) -> PermissionMode { if self.plan { PermissionMode::Plan } … }',
  },
  {
    featureId: 'in-app-voice-input',
    support: 'no',
    note: 'No getUserMedia / MediaRecorder / SpeechRecognition usage, mic icon or dictation code anywhere in packages/ui or packages/web-core.',
    screenshots: [],
  },
  {
    featureId: 'web-preview-annotation',
    support: 'no',
    note: 'The embedded preview supports element inspection and Eruda DevTools, but there is no region/freehand annotation tool; the only "feed to chat" path is click-to-component element selection (tracked by web-preview-element-inspector).',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/pages/workspaces/PreviewBrowserContainer.tsx',
    sourceExtract: 'Preview pane offers element inspection and DevTools, but no region-annotation surface.',
  },
  {
    featureId: 'web-preview-element-inspector',
    support: 'yes',
    note: 'The embedded PreviewBrowser iframe has an inspect toggle ("Select element as context"): toggling posts click-to-component to the iframe, and a selected element is injected into the chat as a vk-component markdown block.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/ui/src/components/PreviewBrowser.tsx',
    sourceExtract: 'aria-label="Select element as context" … setPendingComponentMarkdown(fenced)',
  },
  {
    featureId: 'local-target-branch-merge',
    support: 'yes',
    note: 'The GitMerge action calls workspacesApi.merge(workspaceId, { repo_id }) to merge locally into the configured target branch — distinct from the Create-PR flow, and it refuses to merge directly while an open PR exists, confirming it is a local git merge.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/shared/actions/index.ts',
    sourceExtract:
      'GitMerge → workspacesApi.merge(...): "This will merge your changes into the target branch."',
  },
  {
    featureId: 'llm-assisted-merge-rebase',
    support: 'yes',
    note: 'Rebase (and merge) onto the chosen/target branch is available; on conflict the ResolveConflictsDialog hands the conflicted files to the coding agent with an LLM prompt built by buildResolveConflictsInstructions.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/shared/lib/conflicts.ts',
    sourceExtract:
      'ResolveConflictsDialog: "Choose how you want the agent to resolve them." (buildResolveConflictsInstructions)',
  },
  {
    featureId: 'chat-message-stacking',
    support: 'partial',
    note: 'A follow-up message can be queued while the agent runs ("Message queued — will execute when current run finishes"), but QueueStatus is only empty | queued (a single queued message; re-queuing overwrites), so it is a queue-of-one rather than a stack of several messages.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/features/workspace-chat/model/hooks/useSessionQueueInteraction.ts',
    sourceExtract: "isQueued = queueStatus.status === 'queued' (single message, cancelQueue).",
  },
  {
    featureId: 'multi-repository-view',
    support: 'yes',
    note: 'A workspace can contain several repositories; GitPanelContainer renders them all as RepoCards at once and the diff stream aggregates files keyed by repoName. Repos are selected at workspace-creation time and there is no dedicated per-repo filter toggle.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/pages/workspaces/GitPanelContainer.tsx',
    sourceExtract: 'GitPanelContainer renders one RepoCard per repo; diff stream aggregates files keyed by repoName.',
  },
  {
    featureId: 'multi-repository-chat-targeting',
    support: 'yes',
    note: 'Create-mode state holds repos: SelectedRepo[] with addRepo (dedup-guarded), each with its own target branch — a single task/session/chat operates across all selected repositories in one workspace.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/features/create-mode/model/useCreateModeState.ts',
    sourceExtract: 'repos: SelectedRepo[] + addRepo (duplicate-guarded), each with its own target branch.',
  },
  {
    featureId: 'chat-turn-diff',
    support: 'yes',
    note: 'Agent file_edit turns are grouped into AGGREGATED_DIFF_GROUP rows (AggregatedDiffGroupEntry) rendered inline in the conversation, showing the per-file changes a turn produced with a click-through (viewFileInChanges) — no manual commit required.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/features/workspace-chat/ui/DisplayConversationEntry.tsx',
    sourceExtract: 'AggregatedDiffGroupEntry renders per-turn file changes inline with a viewFileInChanges click-through.',
  },
  {
    featureId: 'unarchive-worktree',
    support: 'yes',
    note: 'ArchiveWorkspace toggles the archived flag (workspacesApi.update(workspaceId, { archived: !wasArchived }), relabelled "Unarchive"); archiving does not delete the worktree, so unarchiving restores the full active workspace — session, files and history.',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/shared/actions/index.ts',
    sourceExtract: "label: (workspace) => workspace?.archived ? 'Unarchive' : 'Archive'",
  },
];
