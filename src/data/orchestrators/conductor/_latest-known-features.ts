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
      {
        src: '/screenshots/conductor/git-worktrees_20260518_2.png',
        alt: 'Sidebar listing multiple repositories with their isolated workspaces, each backed by its own worktree',
      },
      {
        src: '/screenshots/conductor/git-worktrees_20260518_3.png',
        alt: 'Branch picker offering to duplicate an existing branch into a new isolated worktree workspace',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/concepts/workspaces-and-branches',
    sourceExtract:
      'An isolated workspace is a separate, git-backed copy of a project for one stream of work. […] The files on disk for one workspace. Each workspace has its own working tree.',
  },
  {
    featureId: 'cloud-execution',
    support: 'no',
    note: 'Conductor v0.52.3 runs locally on macOS. A "Conductor Cloud" tier is announced as Early Access (not tested), so cloud execution is not generally available.',
    screenshots: [],
    sourceUrl: 'https://www.conductor.build/cloud',
    sourceExtract: 'Run a team of coding agents in the cloud. Early access.',
  },
  {
    featureId: 'local-execution',
    support: 'yes',
    screenshots: [
      {
        src: '/screenshots/conductor/local-execution_20260518_1.png',
        alt: 'Conductor Mac app running locally with workspaces on the developer machine',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/installation',
    sourceExtract:
      'Get Conductor running on your Mac. […] Drag the Conductor app to your Applications folder.',
  },
  {
    featureId: 'multiple-model-families',
    support: 'partial',
    note: 'Two vendors supported: Anthropic (Claude Code family) and OpenAI (Codex family). Lighter than orchestrators that wire many vendors (Google, xAI, Moonshot…), hence "partial" rather than "yes".',
    screenshots: [
      {
        src: '/screenshots/conductor/multiple-model-families_20260518_1.png',
        alt: 'Conductor model picker grouped by Claude Code and Codex families',
        caption: 'Model picker listing Claude Code (Opus 4.7, Sonnet 4.6, Haiku 4.5) and Codex (GPT-5.5, GPT-5.4, GPT-5.3-Codex) families',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/concepts/agent-modes',
    sourceExtract: 'Open the model picker to choose a Claude Code or Codex model.',
  },
  {
    featureId: 'pr-creation',
    support: 'yes',
    note: 'Dedicated button (and Cmd+Shift+P shortcut) creates the PR in one click, with an option to open it as a Draft. The prompt used to draft the PR description is customizable in project preferences (e.g. to enforce a specific language or formalism).',
    screenshots: [
      {
        src: '/screenshots/conductor/pr-creation_20260518_1.png',
        alt: 'Conductor Create PR button with Create draft PR and Create PR manually options',
      },
      {
        src: '/screenshots/conductor/pr-creation_20260518_2.png',
        alt: 'Conductor project preferences with a Create PR preferences section to customize the agent instructions',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/concepts/workflow',
    sourceExtract:
      'Create a pull request with Command + Shift + P. Conductor can help draft the PR description.',
  },
  {
    featureId: 'visual-task-management',
    support: 'yes',
    note: 'Kanban-style Dashboard view available behind an experimental flag (Settings → Experimental → Dashboard). Statuses are hardcoded (Backlog / In progress / In review / Done / Canceled), no customization.',
    screenshots: [
      {
        src: '/screenshots/conductor/visual-task-management_20260518_1.png',
        alt: 'Conductor Dashboard showing workspaces grouped into Backlog, In progress, In review, Done and Canceled columns',
      },
      {
        src: '/screenshots/conductor/visual-task-management_20260518_2.png',
        alt: 'Experimental settings panel with the Dashboard toggle that enables the kanban-style view',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'You can now organize workspaces by status: backlog, in progress, in review, and done. Go to Settings → Experimental to turn it on. (v0.35.3)',
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
    featureId: 'diff-viewer',
    support: 'yes',
    note: 'Built-in Diff Viewer renders agent-produced changes file by file, with inline comment and PR actions.',
    screenshots: [
      {
        src: '/screenshots/conductor/diff-viewer_20260518_1.png',
        alt: 'Diff Viewer rendering the agent-produced changes file by file (workspace branch vs. target)',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/reference/diff-viewer',
    sourceExtract: 'The Diff Viewer shows the code changes in a workspace.',
  },
  {
    featureId: 'diff-whitespace-toggle',
    support: 'yes',
    note: 'Conductor 0.54 adds an ignore-whitespace toggle to the Diff Viewer so whitespace-only changes can be hidden or shown.',
    screenshots: [
      {
        src: '/screenshots/conductor/diff-whitespace-toggle_20260520_1.png',
        alt: 'Conductor Diff Viewer showing the pilcrow toolbar button with tooltip "Hide whitespace changes"',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract: 'Whitespace diffs can also be hidden',
  },
  {
    featureId: 'diff-multi-views',
    support: 'yes',
    note: 'Diff Viewer offers several selectable scopes: branch vs. target, uncommitted changes, per-commit, and per-turn (changes produced by a single agent discussion).',
    screenshots: [
      {
        src: '/screenshots/conductor/diff-multi-views_view-selector_20260518_1.png',
        alt: 'Diff Viewer selector dropdown offering All changes, Uncommitted changes, and per-commit views',
      },
      {
        src: '/screenshots/conductor/diff-multi-views_uncommitted-changes_20260518_1.png',
        alt: 'Diff Viewer in "Uncommitted" mode showing only uncommitted local changes',
      },
      {
        src: '/screenshots/conductor/diff-multi-views_per-commit-diff_20260518_1.png',
        alt: 'Diff Viewer showing a single commit’s changes via the per-commit selector',
      },
      {
        src: '/screenshots/conductor/diff-multi-views_turn-changes_20260518_1.png',
        alt: 'Chat turn footer listing the files changed by a single agent turn, each acting as a shortcut to its diff',
      },
      {
        src: '/screenshots/conductor/diff-multi-views_turn-changes_20260518_2.png',
        alt: 'Diff Viewer in "Latest turn" mode showing only the changes produced by the most recent agent discussion',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/reference/diff-viewer',
    sourceExtract: 'The Diff Viewer shows the code changes in a workspace.',
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
    note: 'Multiple themed completion sounds (SNCF jingle, Paris Métro chime, SF Muni, NYC MTA…) selectable from General settings with a Test button.',
    screenshots: [
      {
        src: '/screenshots/conductor/sound-notifications_20260518_1.png',
        alt: 'General settings panel showing the Completion sound dropdown set to Chime with a Test button',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'We added an SNCF jingle, a Paris Métro chime, and a Paris Métro pickpocket announcement as completion sounds.',
  },
  {
    featureId: 'multi-sessions-per-worktree',
    support: 'yes',
    note: 'Multiple chat tabs per workspace; switching agents mid-chat opens a new tab.',
    screenshots: [
      {
        src: '/screenshots/conductor/multi-sessions-per-worktree_20260518_1.png',
        alt: 'Workspace with several parallel chat tabs running independent sessions in the same worktree',
      },
    ],
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
    screenshots: [
      {
        src: '/screenshots/conductor/workflow-shell-hooks_20260518_1.png',
        alt: 'Conductor project Scripts settings with Setup, Run, and Archive script fields',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/reference/scripts',
    sourceExtract:
      'Conductor supports three repository scripts: 1. Setup script: runs when Conductor creates a workspace. 2. Run script: runs when you click the Run button. 3. Archive script: runs before Conductor archives a workspace.',
  },
  {
    featureId: 'run-configurations',
    support: 'partial',
    note: 'A single run script per repo, launched from the Run button (concurrent or nonconcurrent mode).',
    screenshots: [
      {
        src: '/screenshots/conductor/run-configurations_settings_20260518_1.png',
        alt: 'Project Scripts settings panel with Setup, Run and Archive script text areas and the Run mode (Concurrent / Non-concurrent) toggle',
      },
      {
        src: '/screenshots/conductor/run-configurations_run-tab_20260518_1.png',
        alt: 'Workspace Run tab with the Run button that launches the configured run script',
      },
      {
        src: '/screenshots/conductor/run-configurations_running_20260518_1.png',
        alt: 'Workspace Run tab streaming output of the running script with Open and Stop controls',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/reference/scripts',
    sourceExtract:
      'The run script launches your app, server, test watcher, or another long-running command from a workspace. […] `runScriptMode` controls whether multiple run scripts can run at once.',
  },
  {
    featureId: 'worktree-port-env-vars',
    support: 'yes',
    note: 'CONDUCTOR_PORT exposes the first of 10 ports assigned to the workspace, plus other workspace env vars.',
    screenshots: [
      {
        src: '/screenshots/conductor/worktree-port-env-vars_20260518_1.png',
        alt: 'Scripts settings panel showing $CONDUCTOR_ROOT_PATH and $CONDUCTOR_PORT env vars referenced in the setup and run scripts',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/reference/environment-variables',
    sourceExtract: 'CONDUCTOR_PORT — First port in a range of 10 ports assigned to the workspace.',
  },
  {
    featureId: 'diff-comments',
    support: 'yes',
    note: 'Comments on changed lines are sent back to the agent as precise context.',
    screenshots: [
      {
        src: '/screenshots/conductor/diff-comments_20260518_1.png',
        alt: 'Inline diff comment pinned to a changed line with Resolve, Hide and Add to chat actions to send the feedback back to the agent',
      },
      {
        src: '/screenshots/conductor/diff-comments_20260518_2.png',
        alt: 'Diff Viewer with a multi-line comment composer attached to changed lines, ready to send feedback to the agent',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/reference/diff-viewer',
    sourceExtract:
      'Use comments when you want to send specific feedback back to the agent. Comments can point at changed lines, so the agent gets more precise context than it would from a general chat message.',
  },
  {
    featureId: 'github-comment-sync',
    support: 'yes',
    note: 'One-way: GitHub review comments are surfaced in Conductor and resolving them updates the Checks tab.',
    screenshots: [
      {
        src: '/screenshots/conductor/github-comment-sync_20260518_1.png',
        alt: 'GitHub PR review comment rendered inside the Conductor Diff Viewer with Resolve, Hide and Add to chat actions',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/reference/diff-viewer',
    sourceExtract:
      'GitHub review comments can also appear in Conductor. When a thread is handled, resolve it so the Checks tab reflects the current review state.',
  },
  {
    featureId: 'terminal-in-worktree',
    support: 'yes',
    note: 'Multiple terminal windows can be opened simultaneously on the same worktree (Terminal 1, Terminal 2, ...).',
    screenshots: [
      {
        src: '/screenshots/conductor/terminal-in-worktree_20260518_1.png',
        alt: 'Conductor Terminal tab open at the bottom of the workspace, rooted in the worktree path ~/conductor/workspaces/ade-arena/phoenix',
      },
      {
        src: '/screenshots/conductor/terminal-in-worktree_20260518_2.png',
        alt: 'Two parallel terminal tabs (Terminal 1 and Terminal 2) opened on the same Conductor worktree',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/first-workspace',
    sourceExtract:
      'Use the Run button for saved commands and the terminal for one-off commands. Commands run inside the workspace, not your original checkout.',
  },
  {
    featureId: 'open-in-ide',
    support: 'partial',
    note: 'Fixed built-in app list (Finder, VS Code, Zed, Windsurf, Sublime Text, Android Studio, Xcode, Ghostty, iTerm, Hyper, Terminal, GitHub Desktop, Sourcetree, DataGrip). No user-defined custom apps.',
    screenshots: [
      {
        src: '/screenshots/conductor/open-in-ide_20260518_1.png',
        alt: 'Open In dropdown listing the fixed set of built-in target apps (VS Code, Zed, Windsurf, Sublime Text, Android Studio, Xcode, Ghostty, iTerm, Hyper, Terminal, GitHub Desktop, Sourcetree, DataGrip, Finder, Copy path)',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/guides/use-with-cursor',
    sourceExtract:
      'From a workspace, click `Open In` or press Command + O to open the workspace directory in Cursor or VS Code.',
  },
  {
    featureId: 'file-tree-browser',
    support: 'yes',
    note: 'Built-in file tree pane in the workspace; click a file to open it in the built-in editor, drag folders onto the Composer to attach.',
    screenshots: [
      {
        src: '/screenshots/conductor/file-tree-browser_20260518_1.png',
        alt: 'Workspace file tree pane showing the worktree directory hierarchy with a file opened in the built-in editor',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'Conductor now has a built-in file editor for when you want to edit files directly.',
  },
  {
    featureId: 'inline-file-editing',
    support: 'yes',
    note: 'Built-in file editor with full syntax highlighting and ⌘F.',
    screenshots: [
      {
        src: '/screenshots/conductor/inline-file-editing_20260518_1.png',
        alt: 'Conductor built-in file editor with syntax highlighting and an active ⌘F find bar',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'Conductor now has a built-in file editor for when you want to edit files directly.',
  },
  {
    featureId: 'custom-ui-actions',
    support: 'no',
    note: 'Only built-in Run button bound to the run script; no user-defined UI buttons and no parameterized LLM-prompt actions.',
    screenshots: [],
  },
  {
    featureId: 'session-handoff',
    support: 'yes',
    note: 'Every workspace ships with a .context directory for attachments, plans, and handoff notes. Plans authored in Plan mode can be picked up by later chats via "Hand off" and "Implement plan" actions.',
    screenshots: [
      {
        src: '/screenshots/conductor/session-handoff_plan-mode_20260518_1.png',
        alt: 'Composer with Plan mode enabled, ready to draft a plan that will be stored under the workspace .context directory',
      },
      {
        src: '/screenshots/conductor/session-handoff_handoff-button_20260518_1.png',
        alt: 'Plan view with a Hand off button that exports the plan for later sessions plus Copy and Approve actions',
      },
      {
        src: '/screenshots/conductor/session-handoff_plans-attachments_20260518_1.png',
        alt: 'New chat surface offering to reuse previously stored plans and chat summaries from the .context/plans directory',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'All new workspaces now have a `.context` directory. Attachments, plans, and notes are automatically stored here.',
  },
  {
    featureId: 'remote-plan-collaboration',
    support: 'no',
    note: 'No remote plan-collaboration surface in Conductor 0.52.3 (no doc/changelog/homepage mention).',
    screenshots: [],
  },
  {
    featureId: 'shared-config',
    support: 'yes',
    note: 'Repo-level conductor.json committed into the codebase shares scripts and settings with the team; org-managed ~/.conductor/settings.json provides an additional admin override tier.',
    screenshots: [
      {
        src: '/screenshots/conductor/shared-config_share-link_20260518_1.png',
        alt: 'Workspace Scripts panel inviting the user to create a conductor.json file to share scripts with the team',
      },
      {
        src: '/screenshots/conductor/shared-config_create-conductor-json_20260518_1.png',
        alt: 'Share scripts dialog explaining how a committed conductor.json propagates shared scripts to teammates',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/reference/settings',
    sourceExtract:
      "Organizations can manage selected settings by writing `~/.conductor/settings.json` on a user's Mac. Managed values override local database settings.",
  },
  {
    featureId: 'pr-status-sync',
    support: 'yes',
    note: 'Checks and merge state tracked in-app; manual merge from the workspace; "Archive on merge" + "Delete branch on archive" toggles auto-archive on in-app and external merges (Unarchive action since v0.50.0).',
    screenshots: [
      {
        src: '/screenshots/conductor/pr-status-sync_ready-to-merge_20260518_1.png',
        alt: 'Workspace header showing the linked PR with a Ready to merge status and an inline Merge button',
      },
      {
        src: '/screenshots/conductor/pr-status-sync_ahead-push_20260518_1.png',
        alt: 'Workspace git panel showing live PR sync state with Ahead by 1 commit and a Push action',
      },
      {
        src: '/screenshots/conductor/pr-status-sync_git-settings_20260518_1.png',
        alt: 'Conductor Git settings panel exposing Archive on merge and Delete branch on archive toggles',
      },
      {
        src: '/screenshots/conductor/pr-status-sync_pr-link_20260518_1.png',
        alt: 'Chat showing the PR link surfaced after creation, with the workspace header reflecting the synced Ready to merge state and Merge conflicts tab',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      'v0.33.5: Auto-archive setting now respects all PR merge scenarios, not just in-app merges. v0.50.0: Added an Unarchive action after auto-archiving a workspace when its PR is merged.',
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
    screenshots: [
      {
        src: '/screenshots/conductor/context-fill-indicator_20260519_1.png',
        alt: 'Composer popover breaking down current context usage (free space, messages, autocompact buffer, MCP tools, system tools, skills, system prompt, custom agents) out of the 1M token window',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract:
      "You'll now see an indicator in the Composer when Claude is close to running out of context.",
  },
  {
    featureId: 'switch-model-mid-session',
    support: 'yes',
    note: 'Switching the agent mid-chat opens a new chat tab seeded with a summary of the previous one, allowing seamless continuation with a different model.',
    screenshots: [
      {
        src: '/screenshots/conductor/switch-model-mid-session_20260519_1.png',
        alt: 'Conductor opening a new chat tab seeded with a summary after switching the agent mid-session',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract: 'Switching agents mid-chat will now create a new chat tab with a summary.',
  },
  {
    featureId: 'model-effort-support',
    support: 'yes',
    note: 'Fast Mode + reasoning-effort levels exposed when the model supports it.',
    screenshots: [
      {
        src: '/screenshots/conductor/model-effort-support_20260519_1.png',
        alt: 'Composer settings exposing Fast Mode and reasoning-effort levels for the selected model',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/concepts/agent-modes',
    sourceExtract:
      'Fast Mode prioritizes speed. […] Higher settings give the agent more room to reason before answering, but may take longer or use more credits.',
  },
  {
    featureId: 'web-preview',
    support: 'partial',
    note: 'When a port is detected during a run, Conductor exposes an "Open in Browser" action that launches the preview in the user’s default browser. The preview is not embedded in-app and is not controllable by the orchestrator (no integrated visual debug surface).',
    screenshots: [
      {
        src: '/screenshots/conductor/web-preview_20260519_1.png',
        alt: 'Conductor run tab showing a detected port with an Open in Browser button to launch the preview',
        caption:
          'When a port is detected during the run, Conductor exposes an Open in Browser action; the preview opens in the user’s default browser and is not controllable by the orchestrator.',
      },
    ],
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
    support: 'no',
    note: 'No dedicated activity history surface aggregating past runs / archived workspaces across the orchestrator. Only the live sidebar grouping (and the experimental Dashboard) plus a "next session needing attention" jump.',
    screenshots: [],
  },
  {
    featureId: 'copy-from-origin-workspace',
    support: 'yes',
    note: 'Glob-based "Files to copy" feature; defaults to `.env*` and can be shared via `.worktreeinclude`.',
    screenshots: [
      {
        src: '/screenshots/conductor/copy-from-origin-workspace_20260519_1.png',
        alt: 'Files to copy settings panel with a glob list (defaults to .env*) and a hint about sharing via .worktreeinclude',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/reference/files-to-copy',
    sourceExtract:
      "'Files to copy' lets you specify glob patterns that are automatically copied into each new workspace. The default pattern is `.env*`.",
  },
  {
    featureId: 'symlink-from-origin-workspace',
    support: 'yes',
    note: 'No first-class UI, but documented as a setup-script pattern using `ln -sf "$CONDUCTOR_ROOT_PATH/…"`.',
    screenshots: [
      {
        src: '/screenshots/conductor/symlink-from-origin-workspace_20260519_1.png',
        alt: 'Setup script using ln -sf "$CONDUCTOR_ROOT_PATH/.env" to expose the origin workspace .env via a symlink',
      },
    ],
    sourceUrl: 'https://www.conductor.build/docs/quickstart/rails',
    sourceExtract: 'ln -sf "$CONDUCTOR_ROOT_PATH/.env" .env',
  },
  {
    featureId: 'chat-rewind',
    support: 'yes',
    note: 'Reset-to-this-point action on any past user message: deletes subsequent chat AND rolls back the workspace git state via a per-response checkpoint (cannot be undone).',
    screenshots: [
      {
        src: '/screenshots/conductor/chat-rewind_20260519_1.png',
        alt: 'Conductor chat with a Reset to this point icon revealed on a past user message',
      },
      {
        src: '/screenshots/conductor/chat-rewind_20260519_2.png',
        alt: 'Reset to this point confirmation dialog warning that git state and chat history will be reset and that the action cannot be undone',
      },
    ],
  },
  {
    featureId: 'predefined-deterministic-workflows',
    support: 'no',
    note: 'Chats are free-form within a workspace; no built-in research/plan/implement/review phased workflow documented.',
    screenshots: [],
  },
  {
    featureId: 'custom-deterministic-workflows',
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
    featureId: 'chat-user-questions',
    support: 'yes',
    note: "Conductor renders Claude's AskUserQuestion tool calls as an interactive, keyboard-navigable UI inline in chat; supports multi-select questions.",
    screenshots: [
      {
        src: '/screenshots/conductor/chat-user-questions_20260519_1.png',
        alt: 'Inline AskUserQuestion radio choices rendered in the Conductor chat surface',
        caption: 'Inline AskUserQuestion radio choices rendered in the Conductor chat surface',
      },
    ],
    sourceUrl: 'https://www.conductor.build/changelog',
    sourceExtract: "We've cleaned up the UI for the `AskUserQuestion` tool to make it fully keyboard navigable.",
  },
  {
    featureId: 'fork-workspace',
    support: 'yes',
    note: 'Per-chat "Fork to new workspace" action clones the current workspace (worktree state + session history) into a new worktree, letting you branch off an alternative exploration.',
    screenshots: [
      {
        src: '/screenshots/conductor/fork-workspace_20260519_1.png',
        alt: 'Chat action menu exposing a "Fork to new workspace" item that clones the current workspace into a new worktree',
      },
    ],
  },
  { featureId: 'readonly-plan-research-mode', support: 'unknown', screenshots: [] },
  { featureId: 'in-app-voice-input', support: 'unknown', screenshots: [] },
  { featureId: 'web-preview-annotation', support: 'unknown', screenshots: [] },
  { featureId: 'web-preview-element-inspector', support: 'unknown', screenshots: [] },
  { featureId: 'local-target-branch-merge', support: 'unknown', screenshots: [] },
  { featureId: 'llm-assisted-merge-rebase', support: 'unknown', screenshots: [] },
  { featureId: 'chat-message-stacking', support: 'unknown', screenshots: [] },
  { featureId: 'multi-repository-view', support: 'unknown', screenshots: [] },
  { featureId: 'multi-repository-chat-targeting', support: 'unknown', screenshots: [] },
];
