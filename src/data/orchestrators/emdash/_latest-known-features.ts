import type { FeatureSupport } from '../../schema';

// Feature support for Emdash v1.1.27 (2026-05-31). Coverage drawn from the
// public Emdash docs (emdash.sh/docs/*), the changelog, and the
// generalaction/emdash GitHub README. Rows left "unknown" are those for which
// no public evidence could be found — to be confirmed by a reviewer (the entry
// ships as `status: 'waiting-for-review'`).
export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
  // ───────────────────────── workflow ─────────────────────────
  {
    featureId: 'git-worktrees',
    support: 'yes',
    note: 'Each task runs in its own isolated git worktree by default.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/tasks',
    sourceExtract:
      'By default, each task creates a git worktree—a separate copy of your codebase on its own branch. This keeps agent changes isolated from your main branch and other tasks.',
  },
  {
    featureId: 'sandbox-isolation',
    support: 'no',
    note: 'Isolation is git-worktree-based only; the only Docker mention is a user-authored lifecycle-script example, not orchestrator-level sandboxing.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/project-config',
    sourceExtract: '"setup": "docker compose up && pnpm install"',
  },
  {
    featureId: 'no-worktree-mode',
    support: 'yes',
    note: 'Worktrees can be disabled to run directly on the checked-out branch (with a warning that changes are not isolated).',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/tasks',
    sourceExtract:
      "You can disable worktrees to work directly on your checked out branch. A warning appears since changes won't be isolated.",
  },
  {
    featureId: 'multi-sessions-per-worktree',
    support: 'yes',
    note: 'A task (worktree) hosts multiple conversation tabs and terminals, each created with ⌘T / ⌘⇧T.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/keyboard-shortcuts',
    sourceExtract: 'Create a conversation ⌘T ... Create a terminal ⌘⇧T',
  },
  {
    featureId: 'workflow-shell-hooks',
    support: 'yes',
    note: 'Lifecycle scripts run setup/run/teardown commands at task lifecycle events.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/project-config',
    sourceExtract: 'Lifecycle scripts: Commands for setup, run and teardown task workflows.',
  },
  {
    featureId: 'worktree-port-env-vars',
    support: 'yes',
    note: 'Each task gets EMDASH_PORT, the base of a reserved 10-port range, exposed to scripts.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/project-config',
    sourceExtract: 'EMDASH_PORT: Base port for a 10-port range.',
  },
  {
    featureId: 'copy-from-origin-workspace',
    support: 'yes',
    note: 'Preserve patterns copy untracked/gitignored files such as .env into new tasks.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/project-config',
    sourceExtract:
      'Preserve patterns: Copies matching untracked or gitignored files such as .env into new tasks.',
  },
  {
    featureId: 'symlink-from-origin-workspace',
    support: 'unknown',
    note: 'Docs describe copying (preserve patterns) files into worktrees but never mention symlinking source-repo files.',
    screenshots: [],
  },
  {
    featureId: 'session-handoff',
    support: 'unknown',
    note: 'No documented gitignored persistence dir for plans/notes carried between sessions; tmux state persistence exists but is different.',
    screenshots: [],
  },
  {
    featureId: 'readonly-plan-research-mode',
    support: 'unknown',
    note: 'No mention of a read-only plan/research discussion mode; emdash delegates to the underlying agent CLI.',
    screenshots: [],
  },
  {
    featureId: 'predefined-deterministic-workflows',
    support: 'no',
    note: 'No built-in research→plan→implement→review pipelines; agents run freely in worktrees with optional setup/run/teardown shell scripts only.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/tasks',
    sourceExtract: 'Chat with the agent or let your initial prompt guide it.',
  },
  {
    featureId: 'custom-deterministic-workflows',
    support: 'no',
    note: 'Customization is limited to reusable prompts and setup/run/teardown shell scripts, not authored multi-step deterministic workflows.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/library/prompts',
    sourceExtract: 'Prompts are reusable instructions you can send to agents from task prompt menus.',
  },
  {
    featureId: 'fork-workspace',
    support: 'no',
    note: "The only 'fork' feature is a git remote split for GitHub fork workflows (upstream/origin), not cloning a worktree's state + history into a new workspace.",
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/changelog',
    sourceExtract: 'Git remote split for fork workflows.',
  },
  {
    featureId: 'unarchive-worktree',
    support: 'yes',
    note: 'Tasks can be archived and restored.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/changelog',
    sourceExtract: 'Improves task archive, restore, teardown, and tmux cleanup behavior.',
  },
  {
    featureId: 'local-target-branch-merge',
    support: 'partial',
    note: 'Merge is offered, but the documented merge action operates on the GitHub PR via GitHub’s API rather than a local target-branch merge from the ADE.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/remote-development/remote-projects',
    sourceExtract:
      'Pull request listing, creation, comments, checks, and merge actions use the Emdash GitHub integration through GitHub’s API.',
  },
  {
    featureId: 'llm-assisted-merge-rebase',
    support: 'no',
    note: 'No LLM-assisted conflict resolution; merge is a GitHub-API PR merge.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/diff-view',
    sourceExtract: 'It can show PR files, commits, checks, comments, and merge state.',
  },
  {
    featureId: 'multi-repository-view',
    support: 'no',
    note: 'Emdash organizes work by project (one repo) and task; no simultaneous multi-repo view is documented.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/project-config',
    sourceExtract: 'Settings are scoped to one Emdash project.',
  },
  {
    featureId: 'multi-repository-chat-targeting',
    support: 'unknown',
    note: 'No documentation of targeting multiple repositories in a single conversation.',
    screenshots: [],
  },

  // ─────────────────────────── ux ───────────────────────────
  {
    featureId: 'visual-task-management',
    support: 'no',
    note: 'Tasks are presented in a left-sidebar list (with shift-range selection), not a kanban/board surface.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/changelog',
    sourceExtract: 'Shift-range selection in the task list.',
  },
  {
    featureId: 'mission-control',
    support: 'no',
    note: 'No historical cross-run activity dashboard; a resource/performance monitor exists for diagnosing usage but is not a run history.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/changelog',
    sourceExtract: 'Performance monitor for diagnosing resource usage.',
  },
  {
    featureId: 'file-tree-browser',
    support: 'yes',
    note: 'The in-app file editor shows the worktree file tree for browsing.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/file-editor',
    sourceExtract: "The right panel shows your project's file tree. Click a file to open it.",
  },
  {
    featureId: 'inline-file-editing',
    support: 'yes',
    note: 'Built-in editor edits files in the worktree with syntax highlighting and save to disk.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/file-editor',
    sourceExtract:
      "The file editor lets you browse and edit code in a task's worktree without switching to an external editor.",
  },
  {
    featureId: 'terminal-in-worktree',
    support: 'yes',
    note: 'Terminals are created per task rooted in the task workspace (⌘⇧T), with a terminal drawer (⌘J).',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/keyboard-shortcuts',
    sourceExtract: 'Create a terminal ⌘⇧T ... Toggle terminal drawer ⌘J',
  },
  {
    featureId: 'run-configurations',
    support: 'partial',
    note: 'Run scripts are configured in Project Settings and launched with play controls, but it is a single configured run/setup/teardown set, not arbitrary named commands.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/changelog',
    sourceExtract:
      'run scripts do not execute eagerly and play controls only appear when scripts are configured',
  },
  {
    featureId: 'custom-ui-actions',
    support: 'no',
    note: 'No mechanism for multiple custom UI buttons running arbitrary shell commands or LLM prompts; only fixed lifecycle scripts and a reusable prompt menu exist.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/project-config',
    sourceExtract: 'Lifecycle scripts: Commands for setup, run and teardown task workflows.',
  },
  {
    featureId: 'ui-commit',
    support: 'yes',
    note: 'In-app commit with file staging selection plus a commit message and optional description.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/diff-view',
    sourceExtract:
      'Commit: Enter a commit message and optional description, then choose Commit, Commit & Push, or Commit & Create PR.',
  },
  {
    featureId: 'diff-viewer',
    support: 'yes',
    note: 'Built-in diff view with unified/split layouts to review agent changes.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/diff-view',
    sourceExtract: 'Use the toolbar to switch between unified and split diff layouts.',
  },
  {
    featureId: 'diff-whitespace-toggle',
    support: 'unknown',
    note: 'Diff view documents unified/split layouts but no whitespace-only toggle is mentioned.',
    screenshots: [],
  },
  {
    featureId: 'diff-multi-views',
    support: 'partial',
    note: 'Diff scope spans Changed (unstaged), Staged and PR comparisons, but these are read-only sections rather than a freely switchable per-commit/uncommitted/vs-target selector.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/diff-view',
    sourceExtract:
      'The Changed section shows unstaged workspace changes. The Staged section shows files already added to the next commit.',
  },
  {
    featureId: 'chat-turn-diff',
    support: 'unknown',
    note: 'No documentation of showing the diff produced by an individual LLM chat turn.',
    screenshots: [],
  },
  {
    featureId: 'diff-comments',
    support: 'yes',
    note: 'Line comments can be added when reviewing code changes.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/changelog',
    sourceExtract: 'Adds line comments for reviewing code changes.',
  },
  {
    featureId: 'chat-user-questions',
    support: 'unknown',
    note: 'Agents run through their own CLIs in a terminal/conversation; no documentation of rendering AskUserQuestion tool calls inline as structured UI.',
    screenshots: [],
  },
  {
    featureId: 'chat-rewind',
    support: 'unknown',
    note: "No documentation of rewinding/forking from a past chat message; agent 'Resume' continues a prior session but is not message-level rewind.",
    screenshots: [],
  },
  {
    featureId: 'chat-message-stacking',
    support: 'unknown',
    note: 'No documentation of queuing multiple user messages.',
    screenshots: [],
  },
  {
    featureId: 'in-app-voice-input',
    support: 'no',
    note: 'No mention of voice/dictation anywhere in docs, README, or changelog.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/keyboard-shortcuts',
    sourceExtract: 'Add selected context and send ⌘Enter',
  },
  {
    featureId: 'quick-chat',
    support: 'no',
    note: 'All agent interaction requires creating a task targeting a project/repo; no repo-less quick chat is documented.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/tasks',
    sourceExtract: 'A task is a unit of work for an agent. Each task gets its own git branch and worktree.',
  },
  {
    featureId: 'web-preview',
    support: 'no',
    note: "No embedded browser/web preview; 'preview' in docs refers to terminal-font and image-diff previews. Run-script dev servers output to the terminal drawer.",
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/project-config',
    sourceExtract: 'Setup and run script logs appear in the terminal drawer.',
  },
  {
    featureId: 'web-preview-annotation',
    support: 'no',
    note: 'No web preview exists, so no annotation of preview regions.',
    screenshots: [],
  },
  {
    featureId: 'web-preview-element-inspector',
    support: 'no',
    note: 'No web preview exists, so no DOM element inspector.',
    screenshots: [],
  },

  // ─────────────────────── integrations ───────────────────────
  {
    featureId: 'multiple-model-families',
    support: 'yes',
    note: 'Provider-agnostic: 28 CLI agents spanning Anthropic (Claude Code), OpenAI (Codex), Google (Gemini), and many others; model choice is per-CLI.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/providers',
    sourceExtract: 'Emdash supports 28 coding agent CLIs.',
  },
  {
    featureId: 'model-effort-support',
    support: 'unknown',
    note: 'Emdash launches external agent CLIs; no in-app reasoning/thinking-effort control is documented (such settings would live inside each CLI).',
    screenshots: [],
  },
  {
    featureId: 'switch-model-mid-session',
    support: 'no',
    note: 'Provider is chosen at task creation; resume continues with the same provider, and no mid-session model/provider switch is documented.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/tasks',
    sourceExtract: 'Select a provider (Claude Code, Codex, Qwen, etc.)',
  },
  {
    featureId: 'open-in-ide',
    support: 'yes',
    note: 'Open In supports many editors/terminals (VSCodium, Xcode, Windsurf, RubyMine, Android Studio, Kitty, Alacritty…), but no documented custom-app definition.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/changelog',
    sourceExtract: 'Adds Kitty, Android Studio, and VSCodium as Open In targets.',
  },
  {
    featureId: 'pr-creation',
    support: 'yes',
    note: 'Create/publish a PR (including draft) from the diff/changes panel, e.g. Commit & Create PR.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/diff-view',
    sourceExtract:
      'Create PR: Use Commit & Create PR from the commit card, or create a pull request from the Pull Requests section.',
  },
  {
    featureId: 'pr-status-sync',
    support: 'partial',
    note: 'Syncs PR state including merge state and auto-detects open PRs for a worktree, but no documented auto-archive of the worktree on merge.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/changelog',
    sourceExtract: 'Adds pull request sync and open-PR auto-detection for task worktrees.',
  },
  {
    featureId: 'github-comment-sync',
    support: 'yes',
    note: 'GitHub PR comments are pulled in and shown in the diff/checks panel alongside CI status.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/ci-checks',
    sourceExtract:
      'The Checks tab also shows PR comments below the check runs so you can review CI status and review feedback in the same place.',
  },

  // ─────────────────────── observability ───────────────────────
  {
    featureId: 'live-logs',
    support: 'yes',
    note: 'Agent output and run/setup script logs stream live into the terminal drawer.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/tmux-sessions',
    sourceExtract: 'Emdash still streams terminal output into the app.',
  },
  {
    featureId: 'context-fill-indicator',
    support: 'unknown',
    note: 'No documentation of a context-window fill indicator (would live in the underlying agent CLI).',
    screenshots: [],
  },
  {
    featureId: 'sound-notifications',
    support: 'yes',
    note: 'Configurable notification sound setting, including a custom sound.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/changelog',
    sourceExtract: 'Custom notification sound setting.',
  },
  {
    featureId: 'chat-transcript-export',
    support: 'unknown',
    note: 'No documented export of a structured chat transcript (including tool I/O).',
    screenshots: [],
  },

  // ─────────────────────── collaboration ───────────────────────
  {
    featureId: 'remote-plan-collaboration',
    support: 'unknown',
    note: 'No documentation of sharing planning artifacts remotely for async review.',
    screenshots: [],
  },
  {
    featureId: 'shared-config',
    support: 'yes',
    note: 'Preserve patterns, shell setup and lifecycle scripts can be committed to .emdash.json and shared with teammates.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/project-config',
    sourceExtract:
      'Preserve patterns, shell setup and lifecycle scripts can also be shared with teammates through .emdash.json.',
  },
  {
    featureId: 'shared-discussion-workflows',
    support: 'no',
    note: 'No custom discussion workflows to share; shareable config is limited to scripts/preserve-patterns/shell-setup in .emdash.json.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/project-config',
    sourceExtract: 'Use Share with team to write selected settings to .emdash.json.',
  },

  // ───────────────────────── platform ─────────────────────────
  {
    featureId: 'remote-agent-execution',
    support: 'yes',
    note: 'Agents can run on remote machines over SSH (Remote Projects) or in per-task provisioned remote workspaces (Remote Tasks).',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/remote-development',
    sourceExtract: 'keep the UI on your local machine while project work runs somewhere else',
  },
  {
    featureId: 'local-execution',
    support: 'yes',
    note: 'Agents run locally on the developer machine by default; data is local-first in SQLite.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/tasks',
    sourceExtract:
      'Local project worktrees are created in your configured worktree directory, which defaults to ~/emdash/worktrees.',
  },
  {
    featureId: 'self-hosted',
    support: 'partial',
    note: 'A local open-source desktop app rather than a hosted service; remote execution runs on the user’s own SSH servers/infra (compute is self-owned), but there is no server deployment to host.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/remote-development/remote-tasks',
    sourceExtract:
      'This can work with cloud VMs, Kubernetes pods, Docker containers, internal dev environment platforms, or any backend that can expose an SSH-accessible workspace.',
  },
  {
    featureId: 'plugin-system',
    support: 'partial',
    note: 'No third-party app-plugin API, but agents are extensible via a Library of MCP servers and Agent Skills (incl. custom skills) synced into agent configs.',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/library/skills',
    sourceExtract:
      'Skills are reusable capability modules that extend your coding agents with specialized functionality. They follow the open Agent Skills standard.',
  },
  {
    featureId: 'remote-session-control',
    support: 'no',
    note: 'The Emdash UI runs locally; no documented way to drive the ADE itself from another device such as a phone (remote refers to where agents run, not controlling the UI remotely).',
    screenshots: [],
    sourceUrl: 'https://www.emdash.sh/docs/remote-development/remote-projects',
    sourceExtract:
      'The Emdash UI runs locally, but the repository, worktrees, Git commands, terminals, lifecycle scripts, and coding agents run on the remote host.',
  },
];
