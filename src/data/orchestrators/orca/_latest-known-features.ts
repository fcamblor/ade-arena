import type { FeatureSupport } from '../../schema';

export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
  // workflow
  {
    featureId: 'git-worktrees',
    support: 'yes',
    note: 'Each task runs in its own real git worktree, the core of Orca’s parallel-agent isolation model.',
    sourceUrl: 'https://www.onorca.dev/docs',
    sourceExtract:
      'Every task gets its own git worktree, its own agent terminal, and its own browser tab — so you can fan out work across Claude Code, Codex, Cursor CLI, and friends without stashing, branch-juggling, or losing flow.',
    screenshots: [],
  },
  {
    featureId: 'sandbox-isolation',
    support: 'no',
    note: 'Only worktree-level filesystem separation, not orchestrator OS sandboxing (no Docker/micro-VM/chroot). The Docker-isolated "orca" in search results is the unrelated rasca/orca repo, not stablyai/orca.',
    sourceUrl: 'https://www.onorca.dev/docs',
    sourceExtract: 'Every task gets its own git worktree, its own agent terminal, and its own browser tab',
    screenshots: [],
  },
  {
    featureId: 'no-worktree-mode',
    support: 'no',
    note: 'All sources frame worktrees as core/mandatory; no documented no-worktree / run-in-place mode.',
    sourceUrl: 'https://github.com/stablyai/orca',
    sourceExtract:
      'Worktree-native — Every feature gets its own worktree. No stashing, no branch juggling. Spin up and switch instantly.',
    screenshots: [],
  },
  {
    featureId: 'multi-sessions-per-worktree',
    support: 'yes',
    note: 'Plural "agent sessions" per worktree card with per-session status dots = multiple sessions per worktree, visually attached. README: agents run side-by-side in tabs and panes, each launched via combobox (mixed models possible).',
    sourceUrl: 'https://www.onorca.dev/docs/model/agents-sessions',
    sourceExtract:
      'Each worktree card in the sidebar inlines its agent sessions with the same colored status dot — so you can see every agent on every worktree at a glance, without expanding cards.',
    screenshots: [],
  },
  {
    featureId: 'workflow-shell-hooks',
    support: 'partial',
    note: 'Setup hooks run arbitrary shell commands on worktree creation. No evidence of archival or session start/stop hooks, hence partial.',
    sourceUrl: 'https://www.onorca.dev/docs/agents/hooks-memory',
    sourceExtract:
      'Configure commands to run automatically after a worktree is created — e.g. `pnpm install`, `direnv allow`, or a script that restores `.env` files.',
    screenshots: [],
  },
  {
    featureId: 'worktree-port-env-vars',
    support: 'unknown',
    note: 'Worktrees described as having own branch/files/terminals, but no mention of port allocation or ORCA_ env vars. Only port feature found is SSH port forwarding, unrelated to per-worktree port pools.',
    screenshots: [],
  },
  {
    featureId: 'copy-from-origin-workspace',
    support: 'unknown',
    note: 'No mention of copying gitignored/.env files or a worktree setup script in any Orca source; CLI worktree create shows no copy/setup flag. Insufficient evidence to confirm or deny.',
    screenshots: [],
  },
  {
    featureId: 'symlink-from-origin-workspace',
    support: 'no',
    note: 'No dedicated symlink/copy-from-origin feature. Settings only offer "Auto-run commands on worktree create" (generic hook, could run ln -s manually). No explicit .env/secrets file-sharing.',
    sourceUrl: 'https://www.onorca.dev/docs/settings',
    screenshots: [],
  },
  {
    featureId: 'session-handoff',
    support: 'no',
    note: 'Orca\'s "session restore" is terminal/UI state only; tab-profiles recreate pane layouts. No gitignored dir for plan.md/handoff artifacts is documented.',
    sourceUrl: 'https://www.onorca.dev/changelog',
    sourceExtract:
      'App restart now restores 100% of the session — terminals, splits, cursor, scrollback, working directory, window bounds, and focused tab all come back exactly where you left them.',
    screenshots: [],
  },
  {
    featureId: 'readonly-plan-research-mode',
    support: 'unknown',
    note: 'Searched docs, subpages, homepage, changelog, GitHub. No read-only/plan/research mode found. Orca runs CLI agents in their own terminals, so plan mode would be the agent\'s, not Orca\'s.',
    screenshots: [],
  },
  {
    featureId: 'predefined-deterministic-workflows',
    support: 'no',
    note: 'No catalog of fixed-phase workflows found. Automations run one prompt per session on a schedule, not a phased pipeline.',
    sourceUrl: 'https://www.onorca.dev/docs/cli/automations',
    sourceExtract:
      'run a prompt on a schedule from the CLI, so recurring triage, review, and maintenance tasks can start without you opening a worktree by hand',
    screenshots: [],
  },
  {
    featureId: 'custom-deterministic-workflows',
    support: 'no',
    note: 'Docs/changelog/repo describe parallel agent execution + cron-style automations only. No ordered-phase, gated, per-step workflow authoring.',
    sourceUrl: 'https://www.onorca.dev/docs/cli/automations',
    sourceExtract: 'presets such as `hourly`, `daily`, `weekdays`, and `weekly`, plus cron expressions or RRULE strings',
    screenshots: [],
  },
  {
    featureId: 'fork-workspace',
    support: 'no',
    note: 'Worktree creation = pick a git start-from ref. No "fork workspace incl. session history + local files" feature found across docs, changelog, README, releases. Session restore covers relaunch, not forking.',
    sourceUrl: 'https://www.onorca.dev/docs/model/worktrees',
    sourceExtract:
      "When creating a worktree you pick what to branch from. This can be: The repo's base ref (the fast path). Another local branch... A specific commit SHA. An existing remote branch — Orca will fetch and check it out.",
    screenshots: [],
  },
  {
    featureId: 'unarchive-worktree',
    support: 'unknown',
    note: 'Archive exists, but no documented unarchive/restore action found anywhere; archive is paired with delete as removal. Insufficient evidence to confirm or deny resumability.',
    screenshots: [],
  },
  {
    featureId: 'local-target-branch-merge',
    support: 'no',
    note: 'Ship step is push + open PR. No first-class local-merge-to-target action found in docs; merge only referenced as conflict resolution. Raw git merge possible via terminal escape hatch.',
    sourceUrl: 'https://www.onorca.dev/docs/model/worktrees',
    sourceExtract:
      'Ship — commit, push, open PR, wait on checks — all inline. Archive or delete — one click removes the worktree and branch.',
    screenshots: [],
  },
  {
    featureId: 'llm-assisted-merge-rebase',
    support: 'no',
    note: 'Homepage lets you "resolve conflicts ... all in-app" — but framed as human review/triage within the UI, not an LLM-assisted merge/rebase onto a target branch where the agent resolves collisions.',
    sourceUrl: 'https://www.onorca.dev/',
    sourceExtract:
      'Drop markdown comments on any diff line, batch them, ship them back to the agent. Inspect CI, resolve conflicts, open PRs — all in-app.',
    screenshots: [],
  },
  {
    featureId: 'multi-repository-view',
    support: 'partial',
    note: 'Workspace page shows issues across all connected repos in one list. Multi-repo surfacing confirmed; per-repo UI filtering to a subset not explicitly documented.',
    sourceUrl: 'https://www.onorca.dev/changelog',
    sourceExtract:
      'Cross-repo issues view in the new workspace page — browse GitHub issues across all your connected repos in one list',
    screenshots: [],
  },
  {
    featureId: 'multi-repository-chat-targeting',
    support: 'no',
    note: 'Architecture is worktree-per-task (single repo each). Cross-repo is limited to browsing GitHub issues across connected repos, not multi-repo agent chat targeting.',
    sourceUrl: 'https://www.onorca.dev/changelog',
    sourceExtract:
      'Cross-repo issues view in the new workspace page — browse GitHub issues across all your connected repos in one list',
    screenshots: [],
  },
  // ux
  {
    featureId: 'visual-task-management',
    support: 'yes',
    note: 'Tasks page hosts a kanban-style GitHub project board; sidebar also shows inline agent status dots (yellow working / green done) for visual monitoring across agents.',
    sourceUrl: 'https://www.onorca.dev/changelog',
    sourceExtract:
      'GitHub Projects in Tasks — browse a full GitHub project board inside the Tasks page, with drag-to-resize columns, polished chip colors, and create-from-PR worktrees that link back to the originating PR',
    screenshots: [],
  },
  {
    featureId: 'mission-control',
    support: 'no',
    note: 'Agents feed is a live, threaded cross-worktree feed pinning running agents at top; explicitly a catch-up surface for what changed, not an archive of past runs/completed tasks.',
    sourceUrl: 'https://www.onorca.dev/docs/activity',
    sourceExtract:
      'a threaded feed of agent events across every worktree — completions, blocking questions, unread state, and worktree creation',
    screenshots: [],
  },
  {
    featureId: 'file-tree-browser',
    support: 'yes',
    note: 'Dedicated docs page for the file explorer; files colored by git status, per-worktree tree, real-time filesystem sync.',
    sourceUrl: 'https://www.onorca.dev/docs/editing/file-explorer',
    sourceExtract:
      'The file explorer lives on the left side of each worktree. It tracks your on-disk files in real time — create, rename, delete, and move all map to filesystem operations, so external changes (say, from the agent) show up instantly.',
    screenshots: [],
  },
  {
    featureId: 'inline-file-editing',
    support: 'yes',
    note: 'Homepage: "VS Code\'s editor, autosave everywhere"; docs list "Monaco editor & autosave" under Editing. Clear in-app inline editing with autosave.',
    sourceUrl: 'https://www.onorca.dev/',
    sourceExtract:
      "VS Code's editor, autosave everywhere, quick-open with hidden files, drag-drop files or Finder images into an agent prompt.",
    screenshots: [],
  },
  {
    featureId: 'terminal-in-worktree',
    support: 'yes',
    note: 'Docs confirm per-task agent terminal in its own worktree; homepage adds "Terminal Splits ... infinite splits" for multiple terminals.',
    sourceUrl: 'https://www.onorca.dev/docs',
    sourceExtract: 'Every task gets its own git worktree, its own agent terminal, and its own browser tab',
    screenshots: [],
  },
  {
    featureId: 'run-configurations',
    support: 'yes',
    note: 'Quick Commands = declarative, named, one-click run configs (dev/test/build) launchable from the tab bar. Confirmed in /docs/terminal and /docs/settings.',
    sourceUrl: 'https://www.onorca.dev/docs/terminal',
    sourceExtract:
      'Quick Commands save terminal commands you run often, such as `npm run dev`, `pnpm test`, or a project-specific setup script.',
    screenshots: [],
  },
  {
    featureId: 'custom-ui-actions',
    support: 'yes',
    note: 'Quick Commands = multiple saved shell commands, global or per-project, with an editable list. Meets the multi-action shell-command bar; no LLM-prompt action variant found, but not required.',
    sourceUrl: 'https://www.onorca.dev/docs/settings',
    sourceExtract: 'Saved terminal commands, scoped globally or to a project.',
    screenshots: [],
  },
  {
    featureId: 'ui-commit',
    support: 'yes',
    note: 'Built-in source control: commit without leaving Orca, with per-file/hunk staging, manual message field, and optional AI-drafted message.',
    sourceUrl: 'https://www.onorca.dev/docs/review/commit-push',
    sourceExtract:
      'Stage changes by hunk or by file from the diff. Write a commit message in the bottom panel, or use Generate with AI when you want Orca to draft one from the staged changes.',
    screenshots: [],
  },
  {
    featureId: 'diff-viewer',
    support: 'yes',
    note: 'Confirmed across docs (dedicated "Diff viewer" page, line-by-line AI diff review) and GitHub README ("Review AI-generated diffs without leaving Orca"). In-app, file-by-file.',
    sourceUrl: 'https://www.onorca.dev/docs',
    sourceExtract: 'Orca main window: sidebar of worktrees, split panes with agent terminals and a diff view',
    screenshots: [],
  },
  {
    featureId: 'diff-whitespace-toggle',
    support: 'unknown',
    note: 'Diff viewer exists but no ignore-whitespace toggle evidence found across docs index, changelog, GitHub README, and web search.',
    screenshots: [],
  },
  {
    featureId: 'diff-multi-views',
    support: 'yes',
    note: 'Doc describes default scope (start-from ref) plus switching to any commit, branch, or base ref from the diff toolbar — multiple scopes = yes.',
    sourceUrl: 'https://www.onorca.dev/docs/review/diff-viewer',
    sourceExtract:
      "The diff shows changes against the worktree's start-from ref by default. You can switch to comparing against any commit, branch, or the base ref from the diff toolbar.",
    screenshots: [],
  },
  {
    featureId: 'chat-turn-diff',
    support: 'no',
    note: 'Diff viewer is worktree-cumulative against a start-from ref with commit/branch scoping, not per-turn. No evidence of a per-message diff footer or chat-message click-through to a turn-scoped diff.',
    sourceUrl: 'https://www.onorca.dev/docs/review/diff-viewer',
    sourceExtract:
      "The diff shows changes against the worktree's start-from ref by default. You can switch to comparing against any commit, branch, or the base ref from the diff toolbar.",
    screenshots: [],
  },
  {
    featureId: 'diff-comments',
    support: 'yes',
    note: 'Changelog v1.3.18. Docs nav also lists "Annotate AI Diff" and a "Review an AI diff line-by-line" recipe, corroborating the feature.',
    sourceUrl: 'https://www.onorca.dev/changelog',
    sourceExtract:
      'Annotate AI Diff — leave comments on any lines of an AI-generated diff, then send them all back to the agent in one batch to revise, keeping the review loop tight without copying line numbers',
    screenshots: [],
  },
  {
    featureId: 'chat-user-questions',
    support: 'no',
    note: 'Orca is terminal/TTY-based (Ghostty-class splits), so agents render their own question TUIs in-terminal; no orchestrator-level inline question surface found in docs/changelog/README.',
    sourceUrl: 'https://github.com/stablyai/orca',
    sourceExtract: 'Multi-agent terminals — Run multiple AI agents side-by-side in tabs and panes.',
    screenshots: [],
  },
  {
    featureId: 'chat-rewind',
    support: 'unknown',
    note: 'No evidence in Orca\'s own docs/changelog/GitHub of message-level rewind or filesystem rollback. Rewind hits in search belong to other tools (Claude Code, Codex).',
    screenshots: [],
  },
  {
    featureId: 'chat-message-stacking',
    support: 'no',
    note: 'No evidence of chat message queuing/stacking. Orca passes through to CLI agents in terminals; any stacking would belong to the underlying CLI, not Orca itself.',
    sourceUrl: 'https://github.com/stablyai/orca',
    screenshots: [],
  },
  {
    featureId: 'in-app-voice-input',
    support: 'no',
    note: 'Searched docs, homepage, changelog, and GitHub repo; none reference voice/dictation/microphone/speech-to-text. Orca centers on terminal-based CLI agents.',
    sourceUrl: 'https://www.onorca.dev/docs',
    screenshots: [],
  },
  {
    featureId: 'quick-chat',
    support: 'no',
    note: 'Docs, homepage, changelog and README frame every agent session as bound to a git worktree. No evidence of an ad-hoc, repo-less chat surface.',
    sourceUrl: 'https://www.onorca.dev/docs',
    sourceExtract:
      'a desktop IDE for running multiple AI coding agents side by side. Every task gets its own git worktree, its own agent terminal, and its own browser tab.',
    screenshots: [],
  },
  {
    featureId: 'web-preview',
    support: 'yes',
    note: 'Design Mode: embedded Chromium per worktree, dockable in split panes; each task gets its own browser tab. Meets the "yes" bar (embedded preview integrated with the ADE workflow).',
    sourceUrl: 'https://www.onorca.dev/',
    sourceExtract:
      'A real Chromium window per worktree. Click any UI element to send its HTML, CSS, and a cropped screenshot into your agent.',
    screenshots: [],
  },
  {
    featureId: 'web-preview-annotation',
    support: 'yes',
    note: 'Design Mode: click a UI element in the live preview to send its HTML/CSS/cropped screenshot to the agent. Element-pick rather than free-form annotation, but the mark-and-send-back loop is present.',
    sourceUrl: 'https://www.onorca.dev/docs/browser/design-mode',
    sourceExtract:
      'Design Mode turns the Orca browser into a pointer-to-code tool. Toggle it on, click any UI element on the rendered page, and the element drops into the agent chat as rich context',
    screenshots: [],
  },
  {
    featureId: 'web-preview-element-inspector',
    support: 'yes',
    note: 'Design Mode is a pointer-to-code inspector in the embedded browser: clicking an element captures its HTML/CSS/screenshot (and source file/line via dev source maps) and sends it to the agent.',
    sourceUrl: 'https://www.onorca.dev/docs/browser/design-mode',
    sourceExtract:
      "Click an element. Orca captures: The element's HTML (outer and a small neighborhood). Its computed CSS — colors, fonts, spacing. A cropped screenshot of the element.",
    screenshots: [],
  },
  // integrations
  {
    featureId: 'multiple-model-families',
    support: 'yes',
    note: 'Homepage and README list multi-vendor agents (Claude Code/Anthropic, Codex/OpenAI, Gemini/Google, Grok/xAI, Copilot/GitHub) plus "any CLI agent". Clear multi-vendor support.',
    sourceUrl: 'https://www.onorca.dev/',
    sourceExtract: 'Run Claude Code, Codex, OpenCode, and more side by side in isolated worktrees.',
    screenshots: [],
  },
  {
    featureId: 'model-effort-support',
    support: 'unknown',
    note: 'Docs, changelog, and README contain no reference to reasoning effort, thinking budget, or extended thinking. Orca wraps CLI agents rather than exposing model params directly.',
    screenshots: [],
  },
  {
    featureId: 'switch-model-mid-session',
    support: 'unknown',
    note: 'Orca delegates to host CLI agents in their own terminals; no Orca-native model selector documented. Changelog only covers account switching, not models.',
    screenshots: [],
  },
  {
    featureId: 'open-in-ide',
    support: 'no',
    note: 'Docs, homepage, changelog and README show no "Open in editor/IDE" launcher or custom external-app configuration. Orca positions itself as the IDE; worktrees are real git dirs you can cd into manually.',
    sourceUrl: 'https://www.onorca.dev/docs/model/worktrees',
    screenshots: [],
  },
  {
    featureId: 'pr-creation',
    support: 'partial',
    note: 'In-app PR creation tied to each worktree, but framed as a manual user-initiated UI action. No evidence the agent automatically opens a PR on task completion.',
    sourceUrl: 'https://www.onorca.dev/',
    sourceExtract: 'Inspect CI, resolve conflicts, open PRs — all in-app.',
    screenshots: [],
  },
  {
    featureId: 'pr-status-sync',
    support: 'partial',
    note: 'PRs/checks linked per worktree; homepage adds "review and approve PRs". No evidence of merge detection, merging from the ADE, or auto-archive on merge.',
    sourceUrl: 'https://github.com/stablyai/orca',
    sourceExtract: 'PRs, issues, and Actions checks linked to each worktree automatically.',
    screenshots: [],
  },
  {
    featureId: 'github-comment-sync',
    support: 'unknown',
    note: 'Sources only mention writing in-app diff comments to send to the agent (Annotate AI Diff) plus browsing PRs/issues. None confirm ingesting reviewer PR comments into the diff panel.',
    screenshots: [],
  },
  // observability
  {
    featureId: 'live-logs',
    support: 'yes',
    note: "Each agent runs in its own live terminal (panes/tabs/search) streaming the CLI agent's output in real time, with at-a-glance active-state visibility.",
    sourceUrl: 'https://github.com/stablyai/orca',
    sourceExtract: 'Multi-agent terminals — Run multiple AI agents side-by-side in tabs and panes. See which ones are active at a glance.',
    screenshots: [],
  },
  {
    featureId: 'context-fill-indicator',
    support: 'no',
    note: '"Usage status bar" tracks API consumption + rate-limit resets, not context-window fill of the current discussion. No context/token/compaction indicator found.',
    sourceUrl: 'https://www.onorca.dev/changelog',
    sourceExtract: 'Usage status bar — see your API consumption at a glance',
    screenshots: [],
  },
  {
    featureId: 'sound-notifications',
    support: 'yes',
    note: 'Per-category sound config (built-in or custom audio file) with volume control; agent-finished idle transition fires system notification + sound + chip.',
    sourceUrl: 'https://www.onorca.dev/docs/notifications',
    sourceExtract:
      "Pick a custom desktop notification sound per category under Settings → Notifications — point at any audio file on disk, or pick from Orca's built-in set.",
    screenshots: [],
  },
  {
    featureId: 'chat-transcript-export',
    support: 'unknown',
    note: 'No evidence of structured transcript export across docs, changelog, README, releases. Terminal-based agents leave text copyable but no deliberate export feature is documented.',
    screenshots: [],
  },
  // collaboration
  {
    featureId: 'remote-plan-collaboration',
    support: 'no',
    note: 'Mobile app is a "read-mostly view of running agents" for the owner only. Diff comments feed the agent, not a shared review surface. No share-link/async-review/annotation-for-teammates feature found.',
    sourceUrl: 'https://www.onorca.dev/docs/mobile',
    sourceExtract: 'pairs with your desktop Orca and gives you a read-mostly view of running agents',
    screenshots: [],
  },
  {
    featureId: 'shared-config',
    support: 'yes',
    note: 'Skills registry installable from internal/company repos = teammate-shareable config/capabilities. Per-repo overrides (hooks, auto-run) corroborate. No committed orca.yaml quote, hence medium confidence.',
    sourceUrl: 'https://www.onorca.dev/docs/cli/skills',
    sourceExtract:
      'Orca CLI commands are distributed as skills — versioned packages an agent can install into its own skill directory. Any repo with a skills/<name>/SKILL.md file can be installed via npx skills add. Point your agent at internal repos to give it company-specific powers.',
    screenshots: [],
  },
  {
    featureId: 'shared-discussion-workflows',
    support: 'no',
    note: 'No "discussion workflow" concept or workflow-sharing (export/import/registry/git-tracked) feature found. Team features are limited to PR review, Linear issues, and the companion app.',
    sourceUrl: 'https://www.onorca.dev/docs',
    screenshots: [],
  },
  // platform
  {
    featureId: 'remote-agent-execution',
    support: 'yes',
    note: 'Remote execution is SSH-based to machines you own (not a managed cloud), but agents clearly run off the local machine, satisfying the feature.',
    sourceUrl: 'https://github.com/stablyai/orca',
    sourceExtract: 'SSH support — Connect to remote machines and run agents on them directly from Orca.',
    screenshots: [],
  },
  {
    featureId: 'local-execution',
    support: 'yes',
    note: 'Desktop app for Mac/Linux/Windows running agents locally in isolated git worktrees; MIT open source. Homepage and README confirm native local execution (with optional remote SSH boxes as an extra).',
    sourceUrl: 'https://github.com/stablyai/orca',
    sourceExtract: 'Available for macOS, Windows, and Linux.',
    screenshots: [],
  },
  {
    featureId: 'self-hosted',
    support: 'yes',
    note: 'Local-first desktop app (macOS/Windows/Linux), no cloud dependency; remote work happens only via SSH to machines you own — the local-first equivalent of self-hosting.',
    sourceUrl: 'https://www.onorca.dev/docs',
    sourceExtract: 'Not cloud-only. Orca runs locally. Remote agents happen through SSH to machines you own.',
    screenshots: [],
  },
  {
    featureId: 'plugin-system',
    support: 'no',
    note: 'No plugin system found. Extensibility is limited to adding arbitrary CLI agents and agent-level MCP/skills, not an addressable orchestrator plugin/extension API.',
    sourceUrl: 'https://www.onorca.dev/docs',
    screenshots: [],
  },
  {
    featureId: 'remote-session-control',
    support: 'yes',
    note: 'Mobile companion is a true remote control of the ADE (worktrees, sessions, prompts, approvals/replies, push notifications), not just an embedded agent\'s surface.',
    sourceUrl: 'https://www.onorca.dev/docs/mobile',
    sourceExtract: "The mobile app is intentionally not a full editor — it's a remote control for the desktop you already have running.",
    screenshots: [],
  },
];
