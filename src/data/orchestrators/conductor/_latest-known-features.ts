import type { FeatureSupport } from '../../schema';

export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
  {
    featureId: 'sandbox-isolation',
    support: 'no',
    note: 'No orchestrator-level sandbox: agents run with the host user’s permissions inside the worktree. Any confinement comes from the underlying agent CLI (Claude Code / Codex).',
    screenshots: [],
  },
  {
    featureId: 'git-worktrees',
    support: 'yes',
    screenshots: [
      {
        src: '/screenshots/conductor/git-worktrees_20260518_1.png',
        alt: 'Conductor UI showing per-workspace git worktree isolation',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/concepts/workspaces-and-branches',
    sourceExtract:
      'An isolated workspace is a separate, git-backed copy of a project for one stream of work. […] The files on disk for one workspace. Each workspace has its own working tree.',
  },
  {
    featureId: 'cloud-execution',
    support: 'partial',
    note: 'Conductor Cloud is in early access; the default product runs locally on macOS.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/cloud',
    sourceExtract: 'Run a team of coding agents in the cloud. Early access.',
  },
  {
    featureId: 'local-execution',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/installation',
    sourceExtract:
      'Get Conductor running on your Mac. […] Drag the Conductor app to your Applications folder.',
  },
  {
    featureId: 'multi-model',
    support: 'partial',
    note: 'Only Claude Code and Codex model families are supported.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/concepts/agent-modes',
    sourceExtract: 'Open the model picker to choose a Claude Code or Codex model.',
  },
  {
    featureId: 'pr-creation',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/concepts/workflow',
    sourceExtract:
      'Create a pull request with Command + Shift + P. Conductor can help draft the PR description.',
  },
  {
    featureId: 'kanban-board',
    support: 'no',
    note: 'No kanban interface documented; workspaces are listed in a sidebar.',
    screenshots: [],
  },
  {
    featureId: 'live-logs',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/scripts',
    sourceExtract:
      'The run script launches your app, server, test watcher, or another long-running command from a workspace.',
  },
  {
    featureId: 'diff-review',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/diff-viewer',
    sourceExtract: 'The Diff Viewer shows the code changes in a workspace.',
  },
  {
    featureId: 'oss',
    support: 'no',
    note: 'Closed-source proprietary Mac app; no OSS license documented.',
    screenshots: [],
  },
  {
    featureId: 'free-tier',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/faq',
    sourceExtract: "We're focused on making Conductor an amazing free tool.",
  },
  {
    featureId: 'self-hosted',
    support: 'no',
    note: 'Closed-source Mac app; Conductor Cloud is hosted by the vendor.',
    screenshots: [],
  },
  {
    featureId: 'sound-notifications',
    support: 'yes',
    note: 'Multiple themed completion sounds (SNCF jingle, Paris Métro chime, SF Muni, NYC MTA…).',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'We added an SNCF jingle, a Paris Métro chime, and a Paris Métro pickpocket announcement as completion sounds.',
  },
  {
    featureId: 'multi-sessions-per-worktree',
    support: 'yes',
    note: 'Multiple chat tabs per workspace; switching agents mid-chat opens a new tab.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract: 'Switching agents mid-chat will now create a new chat tab with a summary.',
  },
  {
    featureId: 'no-worktree-mode',
    support: 'no',
    note: 'Every workspace is a worktree; there is no mode that runs against the original checkout.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/concepts/workspaces-and-branches',
    sourceExtract: 'The files on disk for one workspace. Each workspace has its own working tree.',
  },
  {
    featureId: 'workflow-shell-hooks',
    support: 'yes',
    note: 'Three lifecycle scripts: setup (on creation), run (on demand), archive (before archival).',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/scripts',
    sourceExtract:
      'Conductor supports three repository scripts: 1. Setup script: runs when Conductor creates a workspace. 2. Run script: runs when you click the Run button. 3. Archive script: runs before Conductor archives a workspace.',
  },
  {
    featureId: 'run-configurations',
    support: 'partial',
    note: 'A single run script per repo, launched from the Run button (concurrent or nonconcurrent mode).',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/scripts',
    sourceExtract:
      'The run script launches your app, server, test watcher, or another long-running command from a workspace. […] `runScriptMode` controls whether multiple run scripts can run at once.',
  },
  {
    featureId: 'worktree-port-env-vars',
    support: 'yes',
    note: 'CONDUCTOR_PORT exposes the first of 10 ports assigned to the workspace, plus other workspace env vars.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/environment-variables',
    sourceExtract: 'CONDUCTOR_PORT — First port in a range of 10 ports assigned to the workspace.',
  },
  {
    featureId: 'supported-assistants',
    support: 'partial',
    note: 'Only Claude Code and Codex are supported as coding agents.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/concepts/agent-modes',
    sourceExtract: 'Use Claude Code or Codex when you want a coding agent in a Conductor workspace.',
  },
  {
    featureId: 'diff-panel-files-list',
    support: 'partial',
    note: 'File list to navigate between changed files; no whitespace-ignore toggle documented.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/diff-viewer',
    sourceExtract: 'Use the file list to move between changed files.',
  },
  {
    featureId: 'diff-comments',
    support: 'yes',
    note: 'Comments on changed lines are sent back to the agent as precise context.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/diff-viewer',
    sourceExtract:
      'Use comments when you want to send specific feedback back to the agent. Comments can point at changed lines, so the agent gets more precise context than it would from a general chat message.',
  },
  {
    featureId: 'github-comment-sync',
    support: 'partial',
    note: 'One-way: GitHub review comments are surfaced in Conductor and resolving them updates the Checks tab.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/diff-viewer',
    sourceExtract:
      'GitHub review comments can also appear in Conductor. When a thread is handled, resolve it so the Checks tab reflects the current review state.',
  },
  {
    featureId: 'terminal-in-worktree',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/first-workspace',
    sourceExtract:
      'Use the Run button for saved commands and the terminal for one-off commands. Commands run inside the workspace, not your original checkout.',
  },
  {
    featureId: 'open-in-ide',
    support: 'yes',
    note: 'Built-in support for VS Code, Cursor, JetBrains (incl. DataGrip), Xcode, Alacritty, Fork, VSCodium.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/guides/use-with-cursor',
    sourceExtract:
      'From a workspace, click `Open In` or press Command + O to open the workspace directory in Cursor or VS Code.',
  },
  {
    featureId: 'file-tree-browser',
    support: 'yes',
    note: 'Built-in file editor with syntax highlighting implies in-app file browsing.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'Conductor now has a built-in file editor for when you want to edit files directly.',
  },
  {
    featureId: 'inline-file-editing',
    support: 'yes',
    note: 'Built-in file editor with full syntax highlighting and ⌘F.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'Conductor now has a built-in file editor for when you want to edit files directly.',
  },
  {
    featureId: 'custom-ui-actions',
    support: 'partial',
    note: 'A single Run button bound to the run script; no user-defined buttons or LLM-prompt actions documented.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/scripts',
    sourceExtract: 'Run script: runs when you click the Run button.',
  },
  {
    featureId: 'session-handoff',
    support: 'yes',
    note: 'Every workspace ships with a .context directory for attachments, plans, and handoff notes.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'All new workspaces now have a `.context` directory. Attachments, plans, and notes are automatically stored here.',
  },
  {
    featureId: 'remote-file-sharing',
    support: 'unknown',
    note: 'No file-sharing-for-annotation feature documented.',
    screenshots: [],
  },
  {
    featureId: 'shared-config-levels',
    support: 'partial',
    note: 'Org-managed settings.json (~/.conductor/settings.json) overrides local DB; repo-level conductor.json adds a shared layer. No user/project-local override pair beyond that.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/settings',
    sourceExtract:
      "Organizations can manage selected settings by writing `~/.conductor/settings.json` on a user's Mac. Managed values override local database settings.",
  },
  {
    featureId: 'pr-status-sync',
    support: 'partial',
    note: 'GitHub Actions and check statuses are tracked in the Checks tab; archival is manual (no auto-archive on merge documented).',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/concepts/workflow',
    sourceExtract:
      'After the PR opens, Conductor follows the GitHub Actions and status checks for the branch.',
  },
  {
    featureId: 'remote-session-control',
    support: 'no',
    note: 'No mobile / remote-access surface documented; Conductor is a local macOS app.',
    screenshots: [],
  },
  {
    featureId: 'context-fill-indicator',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      "You'll now see an indicator in the Composer when Claude is close to running out of context.",
  },
  {
    featureId: 'switch-model-mid-session',
    support: 'partial',
    note: 'Switching the agent mid-chat does not change the current chat — it opens a new chat tab with a summary.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract: 'Switching agents mid-chat will now create a new chat tab with a summary.',
  },
  {
    featureId: 'model-effort-support',
    support: 'yes',
    note: 'Fast Mode + reasoning-effort levels exposed when the model supports it.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/concepts/agent-modes',
    sourceExtract:
      'Fast Mode prioritizes speed. […] Higher settings give the agent more room to reason before answering, but may take longer or use more credits.',
  },
  {
    featureId: 'multi-model-integration',
    support: 'partial',
    note: 'Wraps the Claude Code and Codex CLIs; no generic provider/MCP/SDK integration mechanism documented.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/concepts/agent-modes',
    sourceExtract: 'Use Claude Code or Codex when you want a coding agent in a Conductor workspace.',
  },
  {
    featureId: 'web-preview',
    support: 'unknown',
    note: 'No embedded web preview / browser pane documented; the run script can start a dev server bound to CONDUCTOR_PORT but the preview surface is the user’s own browser.',
    screenshots: [],
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
    note: 'Chats live inside a workspace, which requires a repository.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/first-workspace',
    sourceExtract:
      'A workspace is an isolated, git-backed copy of your project for one task. After you add a repository, Conductor creates a workspace for it.',
  },
  {
    featureId: 'mission-control',
    support: 'unknown',
    note: 'Workspaces are visible in a sidebar, but no dedicated aggregated dashboard ("running / idle / awaiting input") is documented.',
    screenshots: [],
  },
  {
    featureId: 'copy-from-origin-workspace',
    support: 'yes',
    note: 'Glob-based "Files to copy" feature; defaults to `.env*` and can be shared via `.worktreeinclude`.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/reference/files-to-copy',
    sourceExtract:
      "'Files to copy' lets you specify glob patterns that are automatically copied into each new workspace. The default pattern is `.env*`.",
  },
  {
    featureId: 'symlink-from-origin-workspace',
    support: 'yes',
    note: 'No first-class UI, but documented as a setup-script pattern using `ln -sf "$CONDUCTOR_ROOT_PATH/…"`.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/docs/quickstart/rails',
    sourceExtract: 'ln -sf "$CONDUCTOR_ROOT_PATH/.env" .env',
  },
  {
    featureId: 'chat-rewind',
    support: 'unknown',
    note: 'No rewind-to-past-message or conversation-truncation feature documented.',
    screenshots: [],
  },
  {
    featureId: 'predefined-workflows-sessions',
    support: 'no',
    note: 'Chats are free-form within a workspace; no built-in research/plan/implement/review phased workflow documented.',
    screenshots: [],
  },
  {
    featureId: 'custom-discussion-workflows',
    support: 'no',
    note: 'No user-authored multi-step discussion workflow mechanism documented.',
    screenshots: [],
  },
  {
    featureId: 'shared-discussion-workflows',
    support: 'no',
    note: 'No discussion-workflow authoring, so no sharing surface.',
    screenshots: [],
  },
  {
    featureId: 'fork-workspace',
    support: 'unknown',
    note: 'No documented "fork workspace" action that clones the worktree state + session history into a new workspace.',
    screenshots: [],
  },
];
