import type { FeatureSupport } from '../../schema';

// Canonical feature support for the latest known version of Claude Code Desktop.
// Older versions are described as a diff against this array via
// `deriveVersionFeatures`.
export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
  {
    featureId: 'sandbox-isolation',
    support: 'no',
    note: 'No orchestrator-managed sandbox: the desktop app launches Claude Code with the host user’s permissions. Any per-tool confinement is whatever Claude Code itself exposes.',
    screenshots: [],
  },
  {
    featureId: 'git-worktrees',
    support: 'yes',
    note: 'Every session in the Code tab automatically runs in its own git worktree under `.claude/worktrees/`; location and branch prefix are configurable in Settings → Claude Code.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/git-worktrees_20260520_1.png',
        alt: 'Claude Code Desktop Code tab showing worktree selector at the bottom of the session interface, with \'worktree\' option highlighted.',
        caption: 'Claude Code Desktop Code tab showing worktree selector at the bottom of the session interface, with \'worktree\' option highlighted.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'For Git repositories, each session gets its own isolated copy of your project using Git worktrees, so changes in one session don’t affect other sessions until you commit them. Worktrees are stored in `<project-root>/.claude/worktrees/` by default.',
  },
  {
    featureId: 'cloud-execution',
    support: 'yes',
    note: 'Environment selector in the prompt area exposes a Remote option that runs the session on Anthropic-hosted cloud; sessions continue even after closing the app. SSH sessions are an additional remote option.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/cloud-execution_20260521_1.png',
        alt: 'Claude Code Desktop environment selector dropdown showing Local (checked), Cloud > Default, Remote Control, and SSH sections.',
        caption: 'Environment selector dropdown with the Cloud > Default option highlighted, allowing sessions to run on Anthropic-hosted infrastructure.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Environment: choose where Claude runs. Select Local for your machine, Remote for Anthropic-hosted cloud sessions, or an SSH connection for a remote machine you manage. […] Remote sessions run on Anthropic\'s cloud infrastructure and continue even if you close the app or shut down your computer.',
  },
  {
    featureId: 'local-execution',
    support: 'yes',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/local-execution_20260521_1.png',
        alt: 'Claude Code Desktop environment selector dropdown showing Local option checked at the top.',
        caption: 'Environment selector dropdown with the Local option selected (checkmark), running Claude Code on the local machine.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/overview',
    sourceExtract:
      'Claude Code is an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools. Available in your terminal, IDE, desktop app, and browser.',
  },
  {
    featureId: 'multiple-model-families',
    support: 'no',
    note: 'Claude-only support (Opus/Sonnet/Haiku). Multiple gateways possible (Anthropic API, Bedrock, Vertex AI, Foundry) but still a single vendor. Unofficial env-var hacks exist for non-Anthropic models, but OpenAI/Google/xAI support is not officially supported.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/model-config',
    sourceExtract:
      'For the `model` setting in Claude Code, you can configure either: A model alias — A model name — Anthropic API: A full model name — Bedrock: an inference profile ARN — Foundry: a deployment name — Vertex: a version name.',
  },
  {
    featureId: 'pr-creation',
    support: 'yes',
    note: 'Creates the PR via the /create-pr embedded command, which is going to ask you if you want to create a draft/ready-to-review PR.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/pr-creation_20260521_1.png',
        alt: 'Claude Code Desktop session with a PR creation dropdown menu showing three options: Create PR, Create draft PR, and Manually create PR.',
        caption: 'PR creation dropdown at the bottom prompt bar, offering Create PR, Create draft PR, and Manually create PR options.',
      },
      {
        src: '/screenshots/claude-code-desktop/pr-creation_20260521_2.png',
        alt: 'Claude Code Desktop session after PR creation, with the branch bar showing the PR branch and a Finalize pr link highlighted.',
        caption: 'Session after PR creation: the branch bar shows the PR branch and a direct link to finalise the pull request on GitHub.',
      },
      {
        src: '/screenshots/claude-code-desktop/pr-creation_20260521_3.png',
        alt: 'Claude Code Desktop session after PR creation showing the CI monitoring panel with No checks reported yet, Auto-fix CI & address comments and Auto-merge when ready toggles, Auto-archive settings link, and the PR branch bar at the bottom.',
        caption: 'Post-creation state: the CI monitoring panel appears automatically once a PR is opened, with auto-fix, auto-merge, and auto-archive options.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'After you open a pull request, a CI status bar appears in the session. Claude Code uses the GitHub CLI to poll check results and surface failures. […] PR monitoring requires the GitHub CLI (`gh`) to be installed and authenticated on your machine.',
  },
  {
    featureId: 'visual-task-management',
    support: 'no',
    note: 'Sidebar lists sessions and supports filtering by status / project / environment plus grouping by project, but it stays a vertical list — no kanban-style board surface in the Code tab.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Use the controls at the top of the sidebar to filter sessions by status, project, or environment, and to group sessions by project.',
  },
  {
    featureId: 'live-logs',
    support: 'yes',
    note: 'Each session streams tool calls, file edits and intermediate steps live in the chat transcript; a Verbose view mode exposes every step. Logs for each session are also available as jsonl files under `~/.claude/projects/<project-path>/`.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/live-logs_20260521_1.png',
        alt: 'Claude Code Desktop transcript view menu open with Normal, Thinking, Verbose, and Summary options; Verbose is highlighted.',
        caption: 'Transcript view menu showing the Verbose mode option, which exposes every tool call, file read, and intermediate step.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'View modes control how much detail appears in the chat transcript. […] Verbose — Every tool call, file read, and intermediate step Claude takes.',
  },
  {
    featureId: 'diff-viewer',
    support: 'yes',
    note: 'Desktop app diff viewer shows changes file by file before creating a pull request.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/diff-viewer_20260521_1.png',
        alt: 'Claude Code Desktop panel selector dropdown with the Diff option checked, and the diff pane open on the right showing file changes across the session worktree.',
        caption: 'Panel selector with Diff selected, displaying the file-by-file diff pane alongside the chat transcript.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'After Claude makes changes to your code, the diff view lets you review modifications file by file before creating a pull request.',
  },
  {
    featureId: 'diff-whitespace-toggle',
    support: 'no',
    note: 'No ignore-whitespace toggle documented in the diff viewer.',
    screenshots: [],
  },
  {
    featureId: 'diff-multi-views',
    support: 'no',
    note: 'Desktop diff viewer renders the current pending changes file by file before the PR is opened; no documented selector to switch between per-commit / per-turn / branch-vs-target scopes.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'After Claude makes changes to your code, the diff view lets you review modifications file by file before creating a pull request.',
  },
  {
    featureId: 'self-hosted',
    support: 'no',
    note: 'CLI/desktop run locally but model inference is always served by Anthropic (or Bedrock/Vertex/Foundry); no self-hosted backend.',
    screenshots: [],
  },
  {
    featureId: 'sound-notifications',
    support: 'no',
    note: 'Desktop fires a system OS notification when a session finishes and the user isn’t viewing it, but exposes no configurable sound-effect picker. The `Notification` hook event can be wired to a shell hook to play a sound, but that is not a first-class setting.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'The desktop app sends an OS notification when a Code session finishes a task and you aren\'t currently viewing that session.',
  },
  {
    featureId: 'multi-sessions-per-worktree',
    support: 'no',
    note: 'Every new session in the sidebar gets its own isolated worktree; sessions cannot be attached to the same worktree. The side-chat surface (Cmd+;) is a single ephemeral aside that reads the main thread but does not write back.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'For Git repositories, each session gets its own isolated copy of your project using Git worktrees, so changes in one session don’t affect other sessions until you commit them.',
  },
  {
    featureId: 'no-worktree-mode',
    support: 'yes',
    note: 'The session toolbar exposes a "worktree" toggle that can be unchecked to run the session directly against the original checkout without allocating a git worktree.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/no-worktree-mode_20260521_1.png',
        alt: 'Claude Code Desktop session toolbar at the bottom showing the worktree toggle unchecked (disabled).',
        caption: 'Session toolbar with the worktree toggle unchecked, running the session directly on the main checkout instead of a dedicated worktree.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      "For Git repositories, each session gets its own isolated copy of your project using Git worktrees, so changes in one session don't affect other sessions until you commit them.",
  },
  {
    featureId: 'workflow-shell-hooks',
    support: 'no',
    note: 'Claude Code hooks (PreToolUse, PostToolUse, Stop, etc.) react to tool/conversation events only. No Desktop-level lifecycle hooks exist (e.g. worktree init), and the UI provides no custom orchestration/workflow hook system.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/hooks',
    sourceExtract:
      "Hooks are user-defined shell commands, HTTP endpoints, or LLM prompts that execute automatically at specific points in Claude Code's lifecycle.",
  },
  {
    featureId: 'run-configurations',
    support: 'no',
    note: 'Only web preview is supported through .claude/launch.json, but specific configurations cannot be triggered directly from the UI',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Claude automatically detects your dev server setup and stores the configuration in `.claude/launch.json` at the root of the folder you selected when starting the session. You can define multiple configurations to run different servers from the same project, such as a frontend and an API.',
  },
  {
    featureId: 'worktree-port-env-vars',
    support: 'partial',
    note: '`autoPort: true` in `launch.json` allocates a free port and passes it via `PORT`; no general per-worktree port pool.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'When Claude picks a different port, it passes the assigned port to your server via the `PORT` environment variable.',
  },
  {
    featureId: 'supported-assistants',
    support: 'no',
    note: 'Claude Code is itself the assistant (first-party); it does not orchestrate other coding assistants.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/overview',
    sourceExtract:
      'Claude Code is an agentic coding tool that reads your codebase, edits files, runs commands, and integrates with your development tools.',
  },
  {
    featureId: 'diff-comments',
    support: 'yes',
    note: 'Click any line in the desktop diff to add a comment; Claude reads the comments and revises.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/diff-comments_20260521_1.png',
        alt: 'Claude Code Desktop diff pane with an inline comment annotation reading "It doesn\'t look like a good feature" added on a diff line.',
        caption: 'Inline diff comment added by clicking a line in the diff pane; Claude will read the annotation and revise accordingly.',
      },
      {
        src: '/screenshots/claude-code-desktop/diff-comments_20260521_2.png',
        alt: 'Claude Code Desktop diff pane showing an inline comment annotation and the comment input field open below the annotated line.',
        caption: 'Comment input field open below an annotated diff line, ready to submit feedback for Claude to act on.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'To comment on specific lines, click any line in the diff to open a comment box. Type your feedback and press Enter to add the comment. Claude reads your comments and makes the requested changes, which appear as a new diff you can review.',
  },
  {
    featureId: 'github-comment-sync',
    support: 'no',
    note: 'The CI status bar in Desktop tracks check results but no documented ingestion of GitHub PR review comments into the in-app diff viewer.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/github-comment-sync_20260521_1.png',
        alt: 'Claude Code Desktop diff pane showing a local AI annotation "Seems reasonable!" on a diff line, with the PR branch info bar at the bottom — GitHub PR review comments are not synced into this view.',
        caption: 'The diff pane shows local Desktop annotations only; GitHub PR review comments are not ingested or displayed here.',
      },
    ],
  },
  {
    featureId: 'terminal-in-worktree',
    support: 'yes',
    note: "Desktop app has an integrated terminal pane rooted in the session's working directory.",
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/terminal-in-worktree_20260521_1.png',
        alt: "Claude Code Desktop panel selector dropdown showing Terminal option checked, with an integrated terminal pane open on the right side of the session.",
        caption: "Panel selector with Terminal selected (checkmark), showing the integrated terminal open alongside the chat transcript, rooted in the session's worktree directory.",
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      "The integrated terminal lets you run commands alongside your session without switching to another app. The terminal opens in your session's working directory and shares the same environment as Claude, so commands like `npm test` or `git status` see the same files Claude is editing.",
  },
  {
    featureId: 'open-in-ide',
    support: 'partial',
    note: 'Right-click "Open in" on a file path and the "Continue in" menu on the toolbar both open a fixed list of installed editors (VS Code, Cursor, Zed…); no user-defined custom external apps.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/open-in-ide_20260521_1.png',
        alt: 'Claude Code Desktop session context menu showing "Open in" submenu with VS Code, Windsurf, Zed, and Finder options.',
        caption: 'Session context menu with the "Open in" submenu expanded, listing installed editors (VS Code, Windsurf, Zed) and Finder.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Right-click any file path in the chat, diff viewer, or file pane to open a context menu: […] Open in: open the file in an installed editor such as VS Code, Cursor, or Zed. […] The Continue in menu […] lets you move your session to another surface: […] Your IDE: opens your project in a supported IDE at the current working directory.',
  },
  {
    featureId: 'file-tree-browser',
    support: 'yes',
    note: 'The Files panel exposes a full project file-tree browser that lets you navigate and open any file in the project.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/file-tree-browser_20260521_1.png',
        alt: 'Claude Code Desktop Files panel on the right showing a project file tree with top-level entries like agents, .claude, public, src, .gitignore, and config files.',
        caption: 'Files panel open alongside the session, displaying the full project file tree for browsing and opening files.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract: 'Click a file path in the chat or diff viewer to open it in the file pane.',
  },
  {
    featureId: 'inline-file-editing',
    support: 'yes',
    note: 'Desktop file pane supports spot edits with Save, with stale-file detection.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/inline-file-editing_20260521_1.png',
        alt: 'Claude Code Desktop with the Files panel open showing the project tree on the right, and a file editor pane below it displaying tsconfig.json content.',
        caption: 'File pane showing the content of tsconfig.json opened from the file tree, editable directly in the Desktop interface.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Click a file path in the chat or diff viewer to open it in the file pane. Make spot edits and click Save to write them back. If the file changed on disk since you opened it, the pane warns you and lets you override or discard.',
  },
  {
    featureId: 'custom-ui-actions',
    support: 'yes',
    note: 'User-authored skills (and legacy `.claude/commands/*.md` slash commands) are surfaced via the `+` button and slash-command palette in the prompt box, giving multiple custom LLM-prompt and shell-command actions inside the Desktop UI.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Skills extend what Claude can do. Claude loads them automatically when relevant, or you can invoke one directly: type `/` in the prompt box or click the `+` button and select Slash commands to browse what\'s available. This includes built-in commands, your custom skills, project skills from your codebase, and skills from any installed plugins.',
  },
  {
    featureId: 'session-handoff',
    support: 'partial',
    note: 'CLAUDE.md / `.claude/rules/*.md` persist project-wide instructions across sessions and Plan mode surfaces a plan inline, but Desktop ships no gitignored handoff directory (no `.context`-style folder) where sessions would drop plans or notes for the next.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Plan mode — Claude reads files and runs commands to explore, then proposes a plan without editing your source code. Good for complex tasks where you want to review the approach first.',
  },
  {
    featureId: 'remote-file-sharing',
    support: 'unknown',
    screenshots: [],
  },
  {
    featureId: 'shared-config',
    support: 'yes',
    note: 'Project-level `.claude/settings.json` checked into source control shares config with the team. Three additional on-disk tiers (User `~/.claude/settings.json`, Local `.claude/settings.local.json`, plus managed and command-line overrides) round out the hierarchy.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/settings',
    sourceExtract:
      'User settings: `~/.claude/settings.json` — apply to all projects. Project settings: `.claude/settings.json` — checked into source control and shared with team. Local settings: `.claude/settings.local.json` — personal preferences, not checked in, automatically gitignored.',
  },
  {
    featureId: 'pr-status-sync',
    support: 'yes',
    note: 'Desktop CI status bar tracks PR checks; auto-archive setting closes the session when the PR merges or closes.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/pr-status-sync_20260521_1.png',
        alt: 'Claude Code Desktop CI monitoring panel showing No checks reported yet, with Auto-fix CI & address comments and Auto-merge when ready toggles, and an Auto-archive settings link highlighted.',
        caption: 'CI monitoring panel in the session, with auto-fix, auto-merge toggles and a link to Auto-archive settings.',
      },
      {
        src: '/screenshots/claude-code-desktop/pr-status-sync_20260521_2.png',
        alt: 'Claude Code Desktop Settings dialog, Claude Code section, with the Auto-archive after PR merge or close toggle highlighted by an arrow.',
        caption: 'Settings → Claude Code: "Auto-archive after PR merge or close" toggle, which automatically closes the session when the associated PR is merged or closed.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'After you open a pull request, a CI status bar appears in the session. […] To archive the session automatically once the PR merges or closes, turn on auto-archive in Settings → Claude Code.',
  },
  {
    featureId: 'remote-session-control',
    support: 'yes',
    note: 'Remote Control connects a running local session to claude.ai/code or the Claude iOS/Android app.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/remote-control',
    sourceExtract:
      'Remote Control connects claude.ai/code or the Claude app for iOS and Android to a Claude Code session running on your machine. Start a task at your desk, then pick it up from your phone on the couch or a browser on another computer.',
  },
  {
    featureId: 'context-fill-indicator',
    support: 'yes',
    note: 'Prompt box shows context-window usage; `/compact` and auto-compaction kick in when full.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/context-fill-indicator_20260521_1.png',
        alt: 'Claude Code Desktop context window indicator popup showing 68.6K / 200.0k (34%) usage, with plan usage breakdown: 5-hour limit at 100%, Weekly all models at 24%, Weekly Claude Design at 0%.',
        caption: 'Context window indicator popup showing current token usage (34%) and plan usage quotas per time window.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/vs-code',
    sourceExtract:
      "Context indicator: the prompt box shows how much of Claude's context window you're using. Claude automatically compacts when needed, or you can run `/compact` manually.",
  },
  {
    featureId: 'switch-model-mid-session',
    support: 'yes',
    note: 'Model dropdown next to the send button (Cmd+Shift+I) swaps the Anthropic model mid-session; the selection persists.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/switch-model-mid-session_20260521_1.png',
        alt: 'Claude Code Desktop model and effort dropdown showing Models section with Opus 4.7, Sonnet 4.6 (checked), Haiku 4.5, and Opus 4.6 Legacy; an arrow highlights the Sonnet 4.6 selection.',
        caption: 'Model picker dropdown mid-session: Sonnet 4.6 is currently selected; switching takes effect immediately without restarting the session.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Model: pick a model from the dropdown next to the send button. You can change this during the session.',
  },
  {
    featureId: 'model-effort-support',
    support: 'yes',
    note: 'Effort menu reachable via Cmd+Shift+E lets the user pick adaptive reasoning levels (`low`, `medium`, `high`, `xhigh`, `max`).',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/model-effort-support_20260521_1.png',
        alt: 'Claude Code Desktop model and effort dropdown showing the Effort section with Low, Medium (checked), High, and Max levels; an arrow highlights the Medium effort selection.',
        caption: 'Effort picker in the model dropdown: Medium reasoning level selected; options range from Low to Max (extended thinking).',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract: 'Cmd Shift E — Open effort menu',
  },
  {
    featureId: 'web-preview',
    support: 'yes',
    note: 'Desktop preview pane embeds a browser bound to `launch.json` dev servers; Claude can drive it (start dev server, hit API endpoints), read server logs, both display and act on the preview. User can annotate some area or copy/paste element DOM selector in the chat.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/web-preview_20260521_1.png',
        alt: 'Claude Code Desktop with the Files panel open in the middle and an embedded browser preview on the right showing the ade-showdown website; an arrow points to launch.json in the file tree.',
        caption: 'Embedded browser preview pane bound to the dev server defined in launch.json, displayed alongside the file tree and chat.',
      },
      {
        src: '/screenshots/claude-code-desktop/web-preview_20260521_2.png',
        alt: 'Claude Code Desktop browser preview pane with an annotation toolbar at the bottom highlighted; the user can draw annotations directly on the live preview.',
        caption: 'Annotation mode in the preview pane: users can draw rectangles or highlight areas to communicate UI feedback to Claude.',
      },
      {
        src: '/screenshots/claude-code-desktop/web-preview_20260521_3.png',
        alt: 'Claude Code Desktop browser preview with an active annotation rectangle drawn over part of the rendered page, and a DOM inspector tooltip showing element details.',
        caption: 'Active annotation on the preview: a region is selected and element details are shown, allowing Claude to target specific DOM elements.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Claude can start a dev server and open an embedded browser to verify its changes. This works for frontend web apps as well as backend servers: Claude can test API endpoints, view server logs, and iterate on issues it finds.',
  },
  {
    featureId: 'plugin-system',
    support: 'yes',
    note: 'Plugins bundle skills, sub-agents, hooks, and MCP servers, distributable via marketplaces.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/plugins',
    sourceExtract:
      'Plugins let you extend Claude Code with custom functionality that can be shared across projects and teams. This guide covers creating your own plugins with skills, agents, hooks, and MCP servers.',
  },
  {
    featureId: 'quick-chat',
    support: 'yes',
    note: 'The Desktop app ships two repo-less tabs alongside Code: Chat (standard Claude conversations) and Cowork (Dispatch-style agentic work), both detached from any worktree.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/quick-chat_20260521_1.png',
        alt: 'Claude Code Desktop in Chat tab mode showing the standard Claude conversation interface with "Good afternoon, Frédéric" welcome message; arrows point to the Chat tab and the New chat button.',
        caption: 'Chat tab: a standard Claude conversation interface detached from any worktree, available alongside the Code and Cowork tabs.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'The Claude Desktop app has three tabs: Chat for conversations, Cowork for Dispatch and longer agentic work, and Code for software development.',
  },
  {
    featureId: 'mission-control',
    support: 'no',
    note: 'Sidebar in the Code tab aggregates live sessions across projects (filter/group controls included), but it focuses on what is currently in flight; no dedicated historical/audit timeline of past or archived activity.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'Use the controls at the top of the sidebar to filter sessions by status, project, or environment, and to group sessions by project.',
  },
  {
    featureId: 'copy-from-origin-workspace',
    support: 'yes',
    note: '`.worktreeinclude` (gitignore-syntax) copies untracked files like `.env` or `secrets.json` into each new worktree.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/worktrees',
    sourceExtract:
      'A worktree is a fresh checkout, so untracked files like `.env` or `.env.local` from your main repository are not present. To copy them automatically when Claude creates a worktree, add a `.worktreeinclude` file to your project root.',
  },
  {
    featureId: 'symlink-from-origin-workspace',
    support: 'no',
    note: '`.worktreeinclude` copies files; no first-class symlink mechanism is documented (could be scripted via a `WorktreeCreate` hook).',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/worktrees',
    sourceExtract:
      'The file uses `.gitignore` syntax. Only files that match a pattern and are also gitignored are copied, so tracked files are never duplicated.',
  },
  {
    featureId: 'chat-rewind',
    support: 'yes',
    note: '`/rewind` (or Esc Esc) rewinds the conversation and/or file edits to an earlier checkpoint, including the workspace state.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/chat-rewind_20260521_1.png',
        alt: 'Claude Code Desktop session chat with a "Rewind to here" tooltip appearing on hover over a past message, and the diff panel open on the right showing the current worktree changes.',
        caption: '"Rewind to here" hover action on a past message: clicking it restores the conversation and/or file edits to that checkpoint.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/checkpointing',
    sourceExtract:
      'Use `/rewind` (or press Escape twice) to restore your conversation, code, or both to an earlier checkpoint. Choose to rewind just the conversation, just the file changes, or both together.',
  },
  {
    featureId: 'predefined-workflows-sessions',
    support: 'no',
    note: 'No built-in research/plan/implement/review phased workflow; Plan Mode is a single toggle, not a multi-phase pipeline.',
    screenshots: [],
  },
  {
    featureId: 'custom-discussion-workflows',
    support: 'partial',
    note: 'Skills + sub-agents + slash commands can be chained to approximate a workflow, but there is no first-class deterministic workflow definition (ordered phases with gates).',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/sub-agents',
    sourceExtract:
      'Sub-agents are specialized AI assistants that Claude Code can delegate to for specific tasks.',
  },
  {
    featureId: 'shared-discussion-workflows',
    support: 'partial',
    note: 'Plugins, skills and sub-agents can be packaged and distributed via marketplaces or git, but they are building blocks rather than full discussion workflows.',
    screenshots: [],
    sourceUrl: 'https://code.claude.com/docs/en/plugins',
    sourceExtract:
      'Plugins let you extend Claude Code with custom functionality that can be shared across projects and teams.',
  },
  {
    featureId: 'fork-workspace',
    support: 'no',
    note: 'The "Continue in" menu can hand a session off to the web or an IDE, but the Code tab exposes no one-click action that clones an existing session + worktree state into a brand-new worktree. (`--fork-session` exists in the CLI only.)',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/fork-workspace_20260521_1.png',
        alt: 'Claude Code Desktop session with a "Fork from here" tooltip appearing on hover over a past message, and the branch info bar at the bottom highlighted.',
        caption: '"Fork from here" action on a past message: triggers a fork of the session from that point, available via hover menu on any message.',
      },
      {
        src: '/screenshots/claude-code-desktop/fork-workspace_20260521_2.png',
        alt: 'Claude Code Desktop forked session titled "Update Claude Desktop 1.8089.1 feature information (fork)" with annotations: Same chat history on the left, Different worktree and Changes are resetted on the right diff pane, and Recall the message at the prompt.',
        caption: 'Forked session: the chat history is preserved but the worktree is brand new (no pending changes), and the last message is pre-filled for replay.',
      },
    ],
    sourceUrl: 'https://code.claude.com/docs/en/desktop',
    sourceExtract:
      'The Continue in menu, accessible from the VS Code icon in the bottom right of the session toolbar, lets you move your session to another surface.',
  },
  {
    featureId: 'chat-user-questions',
    support: 'no',
    note: 'No documented inline rendering of `AskUserQuestion`-style tool calls in the Desktop chat surface; the answer surface remains free-form text.',
    screenshots: [
      {
        src: '/screenshots/claude-code-desktop/chat-user-questions_20260521_1.png',
        alt: 'Claude Code Desktop chat showing an AskUserQuestion dialog rendered inline: "Which programming language do you prefer for backend development?" with multiple-choice options TypeScript/Node.js, Python, Go, Rust, Other, a free-text input field, and Skip/Submit buttons.',
        caption: 'AskUserQuestion tool call rendered inline in the Desktop chat as a structured multiple-choice dialog with a free-text fallback option.',
      },
    ],
  },
];
