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
  { featureId: 'cloud-execution', support: 'no', screenshots: [] },
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
    support: 'unknown',
    note: 'Changes panel is workspace-scoped (current pending changes); no documented selector for per-commit / per-turn / branch-vs-target scopes.',
    screenshots: [],
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
    featureId: 'supported-assistants',
    support: 'yes',
    note: 'Claude Code, Codex, Gemini, Copilot, Amp, Cursor, OpenCode, Droid, CCR, Qwen Code.',
    screenshots: [],
    sourceUrl: 'https://vibekanban.com/docs/supported-coding-agents',
    sourceExtract:
      'Vibe Kanban integrates with a variety of coding agents: Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, Amp, Cursor Agent CLI, OpenCode, Droid CLI, Claude Code Router, Qwen Code.',
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
    featureId: 'remote-file-sharing',
    support: 'no',
    note: 'No file-sharing-for-annotation feature documented.',
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
    support: 'unknown',
    note: 'No rewind-to-past-message feature documented in the chat interface.',
    screenshots: [],
  },
  {
    featureId: 'predefined-workflows-sessions',
    support: 'no',
    note: 'Chat sessions are free-form; no built-in research/plan/implement/review phased workflow documented.',
    screenshots: [],
  },
  {
    featureId: 'custom-discussion-workflows',
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
    support: 'unknown',
    note: 'No documented inline rendering of agent user-question tools (AskUserQuestion-style) in the Vibe Kanban chat surface.',
    screenshots: [],
  },
];
