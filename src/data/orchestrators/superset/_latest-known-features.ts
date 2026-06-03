import type { FeatureSupport } from '../../schema';

export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
  // ───────────────────────── workflow ─────────────────────────
  {
    featureId: 'git-worktrees',
    support: 'yes',
    note: 'Core architecture: each agent/branch runs in its own isolated git worktree.',
    sourceUrl: 'https://superset.sh/',
    sourceExtract:
      "Each agent runs in its own isolated Git worktree. No merge conflicts, no stepping on each other's changes.",
    screenshots: [],
  },
  {
    featureId: 'sandbox-isolation',
    support: 'no',
    note: 'Isolation is git-worktree (filesystem) only; no orchestrator-level Docker/VM/chroot/sandbox-exec layer documented. Docker appears solely as user-supplied setup/teardown commands, not a sandbox Superset enforces.',
    screenshots: [],
  },
  {
    featureId: 'no-worktree-mode',
    support: 'partial',
    note: 'Existing on-disk worktrees can be imported as workspaces, but agent sessions still require a workspace/worktree. No documented mode to run an agent directly in the repo without a worktree.',
    sourceUrl: 'https://docs.superset.sh/workspaces',
    sourceExtract:
      'If you have existing git worktrees on disk, use the Import tab in the New Workspace modal to bring them into Superset.',
    screenshots: [],
  },
  {
    featureId: 'multi-sessions-per-worktree',
    support: 'partial',
    note: 'CLI can create multiple agent sessions in one workspace, each a fresh terminal session with its own agent preset. Per-session model/topic and explicit UI attachment to the parent worktree are not documented verbatim.',
    sourceUrl: 'https://docs.superset.sh/cli/cli-reference',
    sourceExtract:
      'Create an agent session in an existing workspace. Resolves the host that owns the workspace and starts the named preset (or HostAgentConfig instance) in a fresh terminal session on that host.',
    screenshots: [],
  },
  {
    featureId: 'workflow-shell-hooks',
    support: 'partial',
    note: 'Setup runs on workspace creation, teardown on deletion, run on the Run button — configured in .superset/config.json. No session start/stop hooks documented.',
    sourceUrl: 'https://docs.superset.sh/setup-teardown-scripts',
    sourceExtract: 'Create workspace → setup commands run in a terminal',
    screenshots: [],
  },
  {
    featureId: 'worktree-port-env-vars',
    support: 'no',
    note: 'Superset does not allocate per-workspace ports; it only discovers listening ports and manages them in the UI. Scripts get SUPERSET_ROOT_PATH/WORKSPACE_NAME/WORKSPACE_PATH env vars but no port env vars.',
    sourceUrl: 'https://docs.superset.sh/ports',
    sourceExtract:
      'Superset does not assign per-workspace port ranges. It discovers listening ports from processes running in each workspace and lets you manage them from the UI.',
    screenshots: [],
  },
  {
    featureId: 'copy-from-origin-workspace',
    support: 'yes',
    note: 'Setup scripts run on each workspace creation and the canonical docs example copies the root .env into the worktree via cp. SUPERSET_ROOT_PATH points to the main repo, so any source-repo file can be copied in.',
    sourceUrl: 'https://docs.superset.sh/setup-teardown-scripts',
    sourceExtract: 'cp "$SUPERSET_ROOT_PATH/.env" .env',
    screenshots: [],
  },
  {
    featureId: 'symlink-from-origin-workspace',
    support: 'unknown',
    note: 'Setup scripts run arbitrary shell, so ln -s from SUPERSET_ROOT_PATH is technically achievable, but no docs describe symlinking source-repo files into the worktree as a feature.',
    screenshots: [],
  },
  {
    featureId: 'session-handoff',
    support: 'unknown',
    note: 'No documentation of a dedicated gitignored shared-context dir (e.g. .context) for persisting plans/notes/handoff artifacts that later sessions on the same worktree reference.',
    screenshots: [],
  },
  {
    featureId: 'readonly-plan-research-mode',
    support: 'unknown',
    note: 'No mention of a read-only plan/research discussion mode. Superset is agent-agnostic and launches CLI agents; any plan mode would belong to the underlying agent, not Superset itself.',
    screenshots: [],
  },
  {
    featureId: 'predefined-deterministic-workflows',
    support: 'no',
    note: 'Closest feature, Automations, is a cron-style scheduler for single-prompt agent runs, not phased workflows. Presets are static terminal-launch configs. No built-in research→plan→implement→review pipelines.',
    sourceUrl: 'https://docs.superset.sh/automations',
    sourceExtract: 'One prompt per automation',
    screenshots: [],
  },
  {
    featureId: 'custom-deterministic-workflows',
    support: 'no',
    note: 'No authoring of ordered multi-phase workflows with per-step prompts/gating/model overrides. Automations are single-prompt scheduled runs; presets only define launch commands and panes.',
    sourceUrl: 'https://docs.superset.sh/automations',
    sourceExtract: 'One prompt per automation',
    screenshots: [],
  },
  {
    featureId: 'fork-workspace',
    support: 'unknown',
    note: 'No public doc or changelog entry describes forking/cloning a workspace (worktree + session/chat history) into a new worktree. Docs cover creating from branch/PR and importing existing worktrees, but not duplicating a workspace.',
    screenshots: [],
  },
  {
    featureId: 'unarchive-worktree',
    support: 'no',
    note: 'No archive/unarchive concept exists in Superset. Docs and changelog reference creating, importing, and deleting worktrees only; best practice is deleting workspaces after merging.',
    screenshots: [],
  },
  {
    featureId: 'local-target-branch-merge',
    support: 'unknown',
    note: 'Changelog mentions a PR merge button (merge via GitHub PR), but no documented capability to merge current work locally into a configured target branch from within the app.',
    screenshots: [],
  },
  {
    featureId: 'llm-assisted-merge-rebase',
    support: 'no',
    note: 'No public evidence of merge/rebase onto a branch with LLM conflict resolution. Changelog has no rebase or AI-assisted conflict-resolution entries; the diff viewer documents no merge/rebase features.',
    screenshots: [],
  },
  {
    featureId: 'multi-repository-view',
    support: 'no',
    note: 'Each workspace is one git branch within a single repository\'s worktrees; no documented UI to show multiple repositories at once or filter by selected repos.',
    screenshots: [],
  },
  {
    featureId: 'multi-repository-chat-targeting',
    support: 'no',
    note: 'No documented ability to target several repositories within one chat/discussion. Chat is scoped to a single workspace (one branch/one repo).',
    screenshots: [],
  },

  // ─────────────────────────── ux ───────────────────────────
  {
    featureId: 'visual-task-management',
    support: 'partial',
    note: 'Tasks UI is explicitly a table-based view, not a kanban/board. Workspace cards do show status labels (In Progress, Ready for Review), but there is no board/column-style task surface.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'Redesigned tasks interface with table-based view and improved organization. Enhanced task filtering and sorting by status, priority, and assignee.',
    screenshots: [],
  },
  {
    featureId: 'mission-control',
    support: 'unknown',
    note: 'No evidence of a historical activity dashboard, archived-session history, or past-runs aggregation across the orchestrator on homepage, docs index, or changelog.',
    screenshots: [],
  },
  {
    featureId: 'file-tree-browser',
    support: 'yes',
    note: 'File Explorer in right sidebar with hierarchical tree view and search.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'Browse and manage your project files directly from the right sidebar. The new file explorer includes a hierarchical tree view, search functionality, and full file operations.',
    screenshots: [],
  },
  {
    featureId: 'inline-file-editing',
    support: 'yes',
    note: 'Edit mode toggle with Ctrl+S to save directly from the diff; a full file editor pane was later added.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'switch between read-only review and live editing, and hit Ctrl+S to save changes directly from the diff.',
    screenshots: [],
  },
  {
    featureId: 'terminal-in-worktree',
    support: 'yes',
    note: 'Persistent terminal sessions per workspace (git worktree), with multiple terminal tabs and a New Terminal action.',
    sourceUrl: 'https://docs.superset.sh/',
    sourceExtract: 'Terminal — Persistent terminal sessions per workspace',
    screenshots: [],
  },
  {
    featureId: 'run-configurations',
    support: 'yes',
    note: 'Terminal presets launch pre-configured shell commands from the UI via a presets bar and run button.',
    sourceUrl: 'https://docs.superset.sh/terminal-presets',
    sourceExtract:
      'Presets let you quickly launch terminals with pre-configured commands. Save common workflows and apply them with a single click.',
    screenshots: [],
  },
  {
    featureId: 'custom-ui-actions',
    support: 'partial',
    note: 'Multiple terminal presets, each one or more shell commands, are pinned in the presets bar for one-click launch (declarable, multiple). Shell commands only; no LLM-prompt buttons found.',
    sourceUrl: 'https://docs.superset.sh/terminal-presets',
    sourceExtract:
      'The preset bar appears above terminal tabs and shows your pinned presets for one-click access.',
    screenshots: [],
  },
  {
    featureId: 'ui-commit',
    support: 'yes',
    note: 'Built-in commit surface with per-file staging selection and a commit message field. No AI-generated message found, but staging + message are present (AI message is optional per criteria).',
    sourceUrl: 'https://docs.superset.sh/diff-viewer',
    sourceExtract: 'Stage/unstage - Select files for commit ... Commit - Write message and commit',
    screenshots: [],
  },
  {
    featureId: 'diff-viewer',
    support: 'yes',
    note: 'Built-in diff viewer for reviewing agent changes file-by-file, with split (side-by-side) and unified (inline) views.',
    sourceUrl: 'https://docs.superset.sh/diff-viewer',
    sourceExtract: 'Review changes, stage files, commit, and push—all from one interface.',
    screenshots: [],
  },
  {
    featureId: 'diff-whitespace-toggle',
    support: 'unknown',
    note: 'Changelog mentions hiding unchanged lines (collapsing context) to improve readability, but no evidence of an ignore-whitespace toggle that hides whitespace-only changes specifically.',
    screenshots: [],
  },
  {
    featureId: 'diff-multi-views',
    support: 'yes',
    note: 'Diff scope can be switched across several views: all changes, uncommitted only, a single commit, or a commit range.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract: 'Filter by all changes, uncommitted only, a single commit, or a commit range.',
    screenshots: [],
  },
  {
    featureId: 'chat-turn-diff',
    support: 'partial',
    note: 'From a chat agent edit you can jump directly to the changes pane to review the diff, but this is a click-through to the general changes pane rather than a per-turn-scoped diff or per-turn touched-file footer.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'When an agent edits a file in chat, you can jump directly to the changes pane to review the diff',
    screenshots: [],
  },
  {
    featureId: 'diff-comments',
    support: 'unknown',
    note: 'A Review tab reads/filters/responds to GitHub PR review comments, and diff comments gained a copy action, but no evidence of leaving comments on the local diff and referencing them back into the LLM discussion.',
    screenshots: [],
  },
  {
    featureId: 'chat-user-questions',
    support: 'yes',
    note: 'Agent question prompts (ask_user/AskUserQuestion) render as an interactive surface with scrollable option buttons and status chips, not raw markdown.',
    sourceUrl: 'https://superset.sh/changelog/2026-04-20-v2-workspace-brand-cli',
    sourceExtract:
      'Footer overlay with pinned header/footer and scrollable option buttons — no more inline question UI',
    screenshots: [],
  },
  {
    featureId: 'chat-rewind',
    support: 'unknown',
    note: 'No mention of rewinding/forking a chat to a past message, or workspace filesystem rollback, across homepage, docs, and changelog entries including the April 20 chat UX overhaul.',
    screenshots: [],
  },
  {
    featureId: 'chat-message-stacking',
    support: 'unknown',
    note: 'No evidence of queuing/stacking multiple user chat messages while the agent is mid-turn. The only queue reference is for automation runs, not chat.',
    screenshots: [],
  },
  {
    featureId: 'in-app-voice-input',
    support: 'unknown',
    note: 'No mention of voice input or dictation in homepage, docs, or changelog. Chat prompt is a rich-text editor with slash/file chips; no speech-to-text feature described.',
    screenshots: [],
  },
  {
    featureId: 'quick-chat',
    support: 'unknown',
    note: 'No evidence of repo-less/standalone chat detached from a repository or worktree. Superset is built around git-worktree workspaces; chat appears tied to workspaces, but no explicit confirmation either way.',
    screenshots: [],
  },
  {
    featureId: 'web-preview',
    support: 'yes',
    note: 'Embedded in-app browser integrated with the workflow: previews dev servers via detected ports (open in a browser pane), with address bar, history, and DevTools.',
    sourceUrl: 'https://superset.sh/changelog/2026-02-16-browser-linux-improvements',
    sourceExtract:
      'Navigate directly from detected ports — click the external link icon to open in a browser pane instead of your system browser',
    screenshots: [],
  },
  {
    featureId: 'web-preview-annotation',
    support: 'unknown',
    note: 'The browser docs and Feb 16 changelog describe the embedded browser, DevTools, and history but make no mention of annotating regions of the preview or feeding visual feedback into the discussion.',
    screenshots: [],
  },
  {
    featureId: 'web-preview-element-inspector',
    support: 'partial',
    note: 'Embedded browser exposes a DevTools pane to inspect/debug the page, and the agent (via MCP) can inspect the DOM. But no user-facing element-picker that feeds a selected DOM node into the chat discussion is documented.',
    sourceUrl: 'https://docs.superset.sh/browser',
    sourceExtract:
      'Open the DevTools pane alongside any browser tab to inspect and debug the page running in the browser.',
    screenshots: [],
  },

  // ─────────────────────── integrations ───────────────────────
  {
    featureId: 'multiple-model-families',
    support: 'yes',
    note: 'Agent-agnostic: drives external CLI agents from multiple vendors (Claude Code/Anthropic, Codex/OpenAI, Gemini/Google, Cursor, Copilot, OpenCode). A multi-provider model picker also spans providers.',
    sourceUrl: 'https://superset.sh/',
    sourceExtract:
      'Superset is agent-agnostic. Use Claude Code, OpenCode, Cursor, or any CLI-based coding tool. Switch between agents seamlessly.',
    screenshots: [],
  },
  {
    featureId: 'model-effort-support',
    support: 'unknown',
    note: 'No mention of reasoning/thinking effort control across homepage, docs, or changelog. Underlying CLI agents may expose it, but Superset surfaces no such control.',
    screenshots: [],
  },
  {
    featureId: 'switch-model-mid-session',
    support: 'partial',
    note: 'A multi-provider model picker lets you choose between providers and models, and Superset lets you switch between agents seamlessly. No explicit confirmation of changing the model mid-conversation within a running session.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract: 'A new multi-provider model picker lets you choose between providers and models.',
    screenshots: [],
  },
  {
    featureId: 'open-in-ide',
    support: 'yes',
    note: 'One-click open of the worktree in a configurable external editor (VS Code, Cursor, Xcode, JetBrains IDEs, or any terminal).',
    sourceUrl: 'https://superset.sh/',
    sourceExtract:
      'Jump into your favorite editor with one click. VS Code, Cursor, Xcode, JetBrains IDEs, or any terminal — open worktrees exactly where you need them.',
    screenshots: [],
  },
  {
    featureId: 'pr-creation',
    support: 'partial',
    note: 'Integrated PR workflow (merge button, PR status, gh CLI builds compare URLs and checks for an existing PR before creating). Whether the agent auto-opens a PR on task completion is not clearly documented.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'PR merge loading feedback - The merge button now shows a loading state while a PR merge is in progress',
    screenshots: [],
  },
  {
    featureId: 'pr-status-sync',
    support: 'partial',
    note: 'Linked PR state is tracked and shown (color-coded icon/number in Changes view, links to GitHub) and a merge button allows manual merge. No evidence of automatic worktree archive on merge.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'PR Status in Changes View - Add a PR status indicator (icon + number) to the Changes view header that links to GitHub. Color-coded PR icons based on state (green for open, violet for merged, red for closed, muted for draft).',
    screenshots: [],
  },
  {
    featureId: 'github-comment-sync',
    support: 'yes',
    note: 'A dedicated Review tab in the changes sidebar surfaces PR review comments in-app (read/filter/respond — exceeds the one-way scope, but ingestion is present).',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'Review Tab in Changes Sidebar - The changes sidebar now has a dedicated Review tab. You can read, filter, and respond to PR review comments without leaving the desktop app.',
    screenshots: [],
  },

  // ─────────────────────── observability ───────────────────────
  {
    featureId: 'live-logs',
    support: 'partial',
    note: 'Chat UI streams agent messages and tool I/O in real time (progressive typing, collapsible tool output panels) and auto-scrolls live, but there is no dedicated raw log/tail view.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'Streaming messages now animate with a progressive typing effect, tool output panels are collapsible to reduce noise',
    screenshots: [],
  },
  {
    featureId: 'context-fill-indicator',
    support: 'unknown',
    note: 'No mention of a context-window fill ratio, token usage, or context indicator in the homepage, docs overview, or changelog.',
    screenshots: [],
  },
  {
    featureId: 'sound-notifications',
    support: 'partial',
    note: 'Settings include a notification sound volume dropdown, so sound alerts exist and volume is configurable. No evidence of configuring distinct sounds per event type (idle/awaiting input/done).',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract: 'Notification sound volume dropdown in settings [#3073]',
    screenshots: [],
  },
  {
    featureId: 'chat-transcript-export',
    support: 'partial',
    note: 'Only piecemeal copying surfaced: expand/collapse and copy on every code block for tool output. No structured full-session export including all tool I/O found in docs/changelog.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'Syntax-highlighted read-file output with filename header and line-range label; expand/collapse and copy on every code block',
    screenshots: [],
  },

  // ─────────────────────── collaboration ───────────────────────
  {
    featureId: 'remote-plan-collaboration',
    support: 'unknown',
    note: 'No planning artifacts or remote plan review/annotation feature found. Plan/planning-mode searches returned only chat tool-call rendering, not shareable plan collaboration.',
    screenshots: [],
  },
  {
    featureId: 'shared-config',
    support: 'partial',
    note: 'Project-level presets/config are scoped to a project; the Slack bot pulls from the team\'s Linear/Superset setup, implying org/team-shared context. No explicit committed-config-file or registry mechanism confirmed.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      "Create, update, search, and triage tasks from the conversation it's standing in — pulling assignees, statuses, and priorities from your team's Linear/Superset setup.",
    screenshots: [],
  },
  {
    featureId: 'shared-discussion-workflows',
    support: 'unknown',
    note: 'Presets and slash-commands exist, but no evidence of distributing/importing-exporting authored discussion workflows to teammates via shared repo or registry.',
    screenshots: [],
  },

  // ───────────────────────── platform ─────────────────────────
  {
    featureId: 'remote-agent-execution',
    support: 'yes',
    note: 'Workspaces can run on a remote Superset device (beefier box, cloud VM, teammate\'s host); the host-service can also run on a remote server/CI/cloud VM via the CLI tarball without the desktop app.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      "Point your local app at any Superset device on the same network — a beefier box across the room, a cloud VM, a teammate's host — and run workspaces on it as if they were local.",
    screenshots: [],
  },
  {
    featureId: 'local-execution',
    support: 'yes',
    note: 'macOS desktop app runs agents locally in git worktrees; CLI --local targets this machine, and the docs describe it as local-first, works offline.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      "Point your local app at any Superset device on the same network ... and run workspaces on it as if they were local.",
    screenshots: [],
  },
  {
    featureId: 'self-hosted',
    support: 'yes',
    note: 'The CLI is a single static binary that drives the same backend and ships as a self-contained tarball to run the host-service on your own remote server/CI/cloud VM without the desktop app.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      'ships as a self-contained tarball so you can run the host-service on a remote server, CI box, or cloud VM without the desktop app.',
    screenshots: [],
  },
  {
    featureId: 'plugin-system',
    support: 'unknown',
    note: 'There are integrations (Linear, MCP Server, hooks) and presets, but no evidence of a third-party/user-authored plugin extension system. MCP support exists but is not clearly a plugin framework.',
    screenshots: [],
  },
  {
    featureId: 'remote-session-control',
    support: 'yes',
    note: 'The Slack bot acts as an agent that can create tasks, spin up cloud workspaces, and launch coding agents from Slack on any device — driving the ADE remotely, beyond an embedded coding agent.',
    sourceUrl: 'https://superset.sh/changelog',
    sourceExtract:
      '@superset in Slack is now an actual agent, not a task-filer. Mention it in a channel or DM it from anywhere, and it can: Create, update, search, and triage tasks ... Spin up a cloud workspace and launch a coding agent',
    screenshots: [],
  },
];
