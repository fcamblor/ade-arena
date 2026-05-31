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
    support: 'no',
    note: 'No reachable ignore-whitespace toggle in the 0.1.44 UI: none in the diff/changes view, and the command bar exposes no Diff Options entry. (An ignoreWhitespace flag exists in source but is not surfaced.)',
    screenshots: [],
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
    featureId: 'chat-transcript-export',
    support: 'no',
    note: 'No full-session transcript export. Only a per-process "Copy Raw Logs" action (Y L) copying the current Logs panel of a single process/tool. The cloud "Export" covers project/issue data, not the agent conversation.',
    screenshots: [],
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
    support: 'yes',
    note: 'vk 0.1.44 exposes four per-repo lifecycle scripts: Setup (after worktree creation, before the agent), Cleanup (after the agent run, if changes were made), Archive (on workspace archival), plus Dev Server. Public docs still lag (Archive not yet listed).',
    screenshots: [],
    sourceUrl:
      'https://raw.githubusercontent.com/BloopAI/vibe-kanban/v0.1.44-20260424091429/packages/web-core/src/i18n/locales/en/settings.json',
    sourceExtract:
      "Archive Script: 'This script runs from within the worktree when the workspace is archived. Use it for cleanup tasks like stopping services, releasing resources, or saving state.' — alongside setup, cleanup and dev-server scripts.",
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
    support: 'yes',
    note: 'One-way PR→in-app ingestion fully works: when the workspace is linked to a PR, submitted review comments appear inline in the Changes panel (per-file count badge), toggled via the GitHub icon in the toolbar. The reverse direction is out of scope for this row.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/changes',
    sourceExtract:
      'Click the GitHub icon in the changes panel toolbar to toggle GitHub comments; comments from the PR appear inline with the diff; badge shows comment count per file.',
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
    support: 'no',
    note: 'No in-app full-worktree browser. The Changes panel exposes only a changed-files tree with name filtering; arbitrary files/directories in the worktree cannot be navigated or read from the UI.',
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
    support: 'no',
    note: "Slash commands are pass-through to the agent's native CLI (Claude Code/Codex/OpenCode), not vk-authored; the command bar is a fixed built-in set. No way to declare custom UI action buttons (shell commands or LLM prompts).",
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/workspaces/slash-commands',
    sourceExtract:
      "Vibe Kanban discovers and exposes the same commands you'd have in the agent's native CLI, so the experience matches what you're used to.",
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
    support: 'no',
    note: 'No way to share the tool configuration with teammates: settings are per-machine/per-user and there is no committed, project-level config file (hooks, scripts, custom actions) that teammates can pick up from the repo.',
    screenshots: [],
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
    note: 'Remote Access (Settings → Remote Access, paired via cloud.vibekanban.com) lets you drive a locally-running host from another device — prompt/control agents on your Mac from your phone. Opt-in: requires pairing, so an unconfigured instance looks non-controllable.',
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
    support: 'yes',
    note: "Repository 'Copy Files' setting: a comma-separated list of files (e.g. .env, .claude) copied from the original repo directory into the worktree, after creation and before the setup script runs.",
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/core-features/creating-projects',
    sourceExtract:
      'Comma-separated list of files to copy from the original project directory to the worktree. These files will be copied after the worktree is created but before the setup script runs.',
  },
  {
    featureId: 'symlink-from-origin-workspace',
    support: 'no',
    note: "No symlink mechanism. The 'Copy Files' repository setting performs a real copy of the listed files into the worktree, not a symlink; no ln -s / shared-file option exists. (Distinct from copy-from-origin-workspace, which Copy Files does support.)",
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/core-features/creating-projects',
    sourceExtract:
      'Comma-separated list of files to copy from the original project directory to the worktree. These files will be copied after the worktree is created but before the setup script runs.',
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
    note: 'Partial: only one follow-up can be queued (queue-of-one — QueueStatus is empty|queued, one queued message per session; re-queue overwrites). The queued message is consumed at run finalization, i.e. sent only after the current turn ends — not injected mid-turn.',
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
    support: 'partial',
    note: 'Each chat turn renders its file edits inline as expandable diff entries (no manual commit), but there is no consolidated per-turn diff view: you scroll the whole conversation, and the click-through opens the global Changes panel (file-scoped, not turn-scoped).',
    screenshots: [],
    sourceUrl:
      'https://github.com/BloopAI/vibe-kanban/blob/v0.1.44-20260424091429/packages/web-core/src/features/workspace-chat/ui/DisplayConversationEntry.tsx',
    sourceExtract:
      'AggregatedDiffGroupEntry renders per-turn file changes inline; viewFileInChanges opens the file in the global Changes panel, not a per-turn-scoped diff.',
  },
  {
    featureId: 'unarchive-worktree',
    support: 'no',
    note: "Archived workspaces remain viewable via 'View Archive', but no unarchive action is reachable in the 0.1.44 UI — there is no surfaced affordance to restore an archived workspace to the active list.",
    screenshots: [],
  },
];
