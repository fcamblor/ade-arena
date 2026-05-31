import type { FeatureSupport } from '../../schema';

export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [
  {
    featureId: 'git-worktrees',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/.docs/encyclopedia.md',
    sourceExtract:
      'Worktree — A Git worktree used as an isolated workspace for a thread. If a thread has a `worktreePath` in the contracts, it runs there instead of in the main working tree.',
  },
  {
    featureId: 'sandbox-isolation',
    support: 'no',
    note: 'No orchestrator-managed sandbox: threads run agent CLIs with the host user’s permissions inside the worktree. Any confinement is whatever the underlying agent provides.',
    screenshots: [],
  },
  {
    featureId: 'remote-agent-execution',
    support: 'no',
    note: 'No SaaS cloud runtime; T3 Code is a local Node.js server (loopback) optionally exposed over LAN/Tailscale/SSH.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/.docs/architecture.md',
    sourceExtract:
      'T3 Code runs as a Node.js WebSocket server that wraps codex app-server (JSON-RPC over stdio) and serves a React web app.',
  },
  {
    featureId: 'local-execution',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/README.md',
    sourceExtract:
      'Run without installing: `npx t3`. Desktop app: install the latest version of the desktop app from GitHub Releases.',
  },
  {
    featureId: 'multiple-model-families',
    support: 'yes',
    note: 'Anthropic (Claude Code), OpenAI (Codex), plus OpenCode and Cursor agents — bring your own subscription, drives multiple vendor families.',
    screenshots: [],
    sourceUrl: 'https://t3.codes/',
    sourceExtract:
      'Orchestrate Claude Code, Codex, OpenCode and Cursor from one surface. Bring your own subscription. […] No keys resold. No quota caps.',
  },
  {
    featureId: 'pr-creation',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://t3.codes/',
    sourceExtract:
      'One button to commit, push, and make a PR. […] one button opens the PR on GitHub with a generated title, body and changelog. Auto-generated PR titles & bodies. Draft PRs, stack PRs, amend PRs.',
  },
  {
    featureId: 'visual-task-management',
    support: 'no',
    note: 'No board-style visual surface; threads are surfaced through a sidebar/workspace list.',
    screenshots: [],
  },
  {
    featureId: 'live-logs',
    support: 'yes',
    note: 'Provider runtime events stream from codex app-server to the browser via ordered WebSocket pushes.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/.docs/architecture.md',
    sourceExtract:
      'Provider-native events are pulled back into the server by ProviderRuntimeIngestion, which converts them into orchestration events. […] Server pushes those updates to the browser through ServerPushBus on channels defined in orchestration.ts.',
  },
  { featureId: 'ui-commit', support: 'unknown', screenshots: [] },
  {
    featureId: 'diff-viewer',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://t3.codes/',
    sourceExtract: 'Inline diff review before you push.',
  },
  {
    featureId: 'diff-whitespace-toggle',
    support: 'yes',
    note: 'Pilcrow toggle in the DiffPanel shows/hides whitespace-only changes.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/apps/web/src/components/DiffPanel.tsx',
    sourceExtract:
      '<Toggle aria-label={diffIgnoreWhitespace ? "Show whitespace changes" : "Hide whitespace changes"} pressed={diffIgnoreWhitespace} […]> <PilcrowIcon />',
  },
  {
    featureId: 'diff-multi-views',
    support: 'partial',
    note: 'DiffPanel exposes two scopes: the whole-thread cumulative diff (selectWholeConversation) and a per-turn diff selected via the turn strip; no per-commit or branch-vs-target selectors found.',
    screenshots: [],
    sourceUrl:
      'https://github.com/pingdotgg/t3code/blob/main/apps/web/src/components/DiffPanel.tsx',
    sourceExtract:
      'const selectTurn = (turnId: TurnId) => { […] return { ...rest, diff: "1", diffTurnId: turnId }; }; const selectWholeConversation = () => { […] return { ...rest, diff: "1" }; };',
  },
  {
    featureId: 'self-hosted',
    support: 'yes',
    note: 'Headless server (`t3 serve`) for SSH/remote machines; LAN, Tailscale and HTTPS endpoints supported.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/REMOTE.md',
    sourceExtract:
      'Headless Server (CLI) — Use this when you want to run the server without a GUI, for example on a remote machine over SSH. Run the server with `t3 serve`.',
  },
  {
    featureId: 'sound-notifications',
    support: 'no',
    note: 'No audio/sound notification system found in the codebase or docs.',
    screenshots: [],
  },
  {
    featureId: 'multi-sessions-per-worktree',
    support: 'yes',
    note: '`chat.new` opens a new thread while preserving the active worktree state.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/KEYBINDINGS.md',
    sourceExtract:
      "`chat.new`: create a new chat thread preserving the active thread's branch/worktree state.",
  },
  {
    featureId: 'no-worktree-mode',
    support: 'yes',
    note: 'Workspace env mode is a toggle between "local" (no worktree, run inside the main repo) and "worktree".',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/KEYBINDINGS.md',
    sourceExtract:
      '`chat.newLocal`: create a new chat thread for the active project in a new environment (local/worktree determined by app settings (default `local`)).',
  },
  {
    featureId: 'workflow-shell-hooks',
    support: 'partial',
    note: 'ProjectScript exposes a single lifecycle flag (`runOnWorktreeCreate`); no archival/session-stop hooks documented.',
    screenshots: [],
    sourceUrl:
      'https://github.com/pingdotgg/t3code/blob/main/packages/contracts/src/orchestration.ts',
    sourceExtract:
      'export const ProjectScript = Schema.Struct({ id, name, command, icon, runOnWorktreeCreate: Schema.Boolean });',
  },
  {
    featureId: 'run-configurations',
    support: 'yes',
    note: 'Project scripts are user-defined shell commands launched from the UI (ProjectScriptsControl) and bindable to keybindings via `script.{id}.run`.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/KEYBINDINGS.md',
    sourceExtract: '`script.{id}.run`: run a project script by id (for example `script.test.run`).',
  },
  {
    featureId: 'worktree-port-env-vars',
    support: 'no',
    note: 'Project scripts receive `T3CODE_PROJECT_ROOT` and `T3CODE_WORKTREE_PATH`, but no per-worktree free-port pool is allocated.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/packages/shared/src/projectScripts.ts',
    sourceExtract: 'T3CODE_PROJECT_ROOT, T3CODE_WORKTREE_PATH.',
  },
  {
    featureId: 'diff-comments',
    support: 'no',
    note: 'No comment/annotation surface on the diff panel found in the codebase.',
    screenshots: [],
  },
  {
    featureId: 'github-comment-sync',
    support: 'no',
    note: 'Source-control docs cover PR creation and listing, not comment sync.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/docs/source-control-providers.md',
    sourceExtract: 'GitHub – Pull requests, repository creation, and clone integration.',
  },
  {
    featureId: 'terminal-in-worktree',
    support: 'yes',
    note: 'Built-in terminal drawer with split, new, toggle and close commands; default `mod+j` binding.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/KEYBINDINGS.md',
    sourceExtract:
      '`terminal.toggle`: open/close terminal drawer. `terminal.split`: split terminal. `terminal.new`: create new terminal. `terminal.close`: close/kill the focused terminal.',
  },
  {
    featureId: 'open-in-ide',
    support: 'yes',
    note: 'VS Code (+ Insiders, VSCodium), Cursor, Zed, Antigravity, Trae, Kiro, plus 12 JetBrains IDEs and the platform file manager; no user-defined custom apps.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/KEYBINDINGS.md',
    sourceExtract:
      '`editor.openFavorite`: open current project/worktree in the last-used editor.',
  },
  {
    featureId: 'file-tree-browser',
    support: 'no',
    note: 'Only the diff-scoped ChangedFilesTree was found; no general worktree file browser component identified in the web app.',
    screenshots: [],
  },
  {
    featureId: 'inline-file-editing',
    support: 'no',
    note: 'No in-app file editor surface; the only documented client-side use of the `writeFile` RPC is saving a Plan markdown to the workspace root. For actual edits, the user is sent to an external IDE.',
    screenshots: [],
    sourceUrl:
      'https://github.com/pingdotgg/t3code/blob/main/apps/web/src/components/PlanSidebar.tsx',
    sourceExtract:
      'void api.projects.writeFile({ cwd: workspaceRoot, relativePath: filename, contents: normalizePlanMarkdownForExport(planMarkdown) })',
  },
  {
    featureId: 'custom-ui-actions',
    support: 'partial',
    note: 'User-defined project scripts (shell commands) can be surfaced and bound to keybindings; no parameterized custom LLM prompt buttons documented.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/KEYBINDINGS.md',
    sourceExtract: '`script.{id}.run`: run a project script by id (for example `script.test.run`).',
  },
  {
    featureId: 'session-handoff',
    support: 'partial',
    note: 'Plan mode produces a proposed plan that the user can save to the workspace root as markdown via PlanSidebar (copy / download / save-to-workspace); no dedicated gitignored handoff directory (e.g. `.context`).',
    screenshots: [],
    sourceUrl:
      'https://github.com/pingdotgg/t3code/blob/main/apps/web/src/components/PlanSidebar.tsx',
    sourceExtract:
      'const handleSaveToWorkspace = useCallback(() => { […] void api.projects.writeFile({ cwd: workspaceRoot, relativePath: filename, contents: normalizePlanMarkdownForExport(planMarkdown) })',
  },
  {
    featureId: 'remote-plan-collaboration',
    support: 'no',
    note: 'No external plan-collaboration feature documented.',
    screenshots: [],
  },
  {
    featureId: 'shared-config',
    support: 'yes',
    note: 'Provider skills resolve from App / System / Project / Personal scopes — the project tier shares the interesting bits of configuration with teammates via the repo.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/apps/web/src/providerSkillPresentation.ts',
    sourceExtract:
      'formatProviderSkillInstallSource — distinguishes App, System, Project and Personal install sources for provider skills.',
  },
  {
    featureId: 'pr-status-sync',
    support: 'partial',
    note: 'T3 Code detects whether an open PR/MR exists for the current branch; no auto-archive on merge documented.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/docs/source-control-providers.md',
    sourceExtract:
      'See if your current branch already has an open PR/MR […] open reviews directly in your browser.',
  },
  {
    featureId: 'remote-session-control',
    support: 'yes',
    note: 'Pair from a phone/tablet via QR code, pairing token, or hosted web app at app.t3.codes.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/REMOTE.md',
    sourceExtract:
      'Use this when you want to connect to a T3 Code server from another device such as a phone, tablet, or separate desktop app. […] scan the QR code on your phone.',
  },
  {
    featureId: 'context-fill-indicator',
    support: 'yes',
    note: 'ContextWindowMeter component renders the percentage of the context window used.',
    screenshots: [],
    sourceUrl:
      'https://github.com/pingdotgg/t3code/blob/main/apps/web/src/components/chat/ContextWindowMeter.tsx',
    sourceExtract:
      'import { type ContextWindowSnapshot, formatContextWindowTokens } from "~/lib/contextWindow"; function formatPercentage(value: number | null) […]',
  },
  {
    featureId: 'switch-model-mid-session',
    support: 'yes',
    screenshots: [],
    sourceUrl: 'https://t3.codes/',
    sourceExtract: 'Switch models mid-thread.',
  },
  {
    featureId: 'model-effort-support',
    support: 'yes',
    note: 'TraitsPicker surfaces per-provider effort/thinking/fast-mode/context-window controls (with Claude ultrathink prompt prefix support) in the chat composer.',
    screenshots: [],
    sourceUrl:
      'https://github.com/pingdotgg/t3code/blob/main/apps/web/src/components/chat/TraitsPicker.tsx',
    sourceExtract:
      'applyClaudePromptEffortPrefix, […] const showEffort = selected.primarySelectDescriptor !== null; […] hasAnyControls: showEffort || showThinking || showFastMode || showContextWindow || showAgent.',
  },
  {
    featureId: 'web-preview',
    support: 'no',
    note: 'No embedded web preview / iframe browser component found.',
    screenshots: [],
  },
  {
    featureId: 'plugin-system',
    support: 'no',
    note: 'No third-party plugin/extension API for the orchestrator itself. Forking the repo is the documented extensibility path.',
    screenshots: [],
    sourceUrl: 'https://t3.codes/',
    sourceExtract:
      "If you don't like something, fork it. T3 Code is as open as they come. We built this app to be modifiable, customizable, and forkable.",
  },
  {
    featureId: 'quick-chat',
    support: 'no',
    note: '`chat.newLocal` still attaches the thread to the active project; no repo-less chat surface documented.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/KEYBINDINGS.md',
    sourceExtract:
      '`chat.newLocal`: create a new chat thread for the active project in a new environment.',
  },
  {
    featureId: 'mission-control',
    support: 'no',
    note: 'Sidebar groups live threads per workspace; no dedicated dashboard surfacing historical activity (past runs, archived threads) across the whole orchestrator was found in the web app.',
    screenshots: [],
  },
  {
    featureId: 'copy-from-origin-workspace',
    support: 'partial',
    note: 'No first-class glob-based "files to copy" UI, but a project script flagged `runOnWorktreeCreate: true` can use the documented `T3CODE_PROJECT_ROOT` env var to `cp` files (e.g. `.env`) from the origin checkout into the new worktree.',
    screenshots: [],
    sourceUrl:
      'https://github.com/pingdotgg/t3code/blob/main/packages/shared/src/projectScripts.ts',
    sourceExtract: 'T3CODE_PROJECT_ROOT, T3CODE_WORKTREE_PATH.',
  },
  {
    featureId: 'symlink-from-origin-workspace',
    support: 'partial',
    note: 'Same `runOnWorktreeCreate` setup-script pattern with `T3CODE_PROJECT_ROOT` lets the user `ln -sf` files into a new worktree, but no first-class symlink declaration is documented.',
    screenshots: [],
    sourceUrl:
      'https://github.com/pingdotgg/t3code/blob/main/packages/shared/src/projectScripts.ts',
    sourceExtract: 'T3CODE_PROJECT_ROOT, T3CODE_WORKTREE_PATH.',
  },
  {
    featureId: 'chat-rewind',
    support: 'yes',
    note: 'Per-turn "Revert to checkpoint" action (dispatching `thread.checkpoint.revert`) rolls back both newer messages AND turn diffs in the worktree; warns the action cannot be undone.',
    screenshots: [],
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/apps/web/src/components/ChatView.tsx',
    sourceExtract:
      'Revert this thread to checkpoint ${turnCount}? This will discard newer messages and turn diffs in this thread. This action cannot be undone. […] api.orchestration.dispatchCommand({ type: "thread.checkpoint.revert", … }).',
  },
  {
    featureId: 'predefined-deterministic-workflows',
    support: 'no',
    note: 'No built-in phased workflow (research/plan/implement/review) documented for chat threads.',
    screenshots: [],
  },
  {
    featureId: 'custom-deterministic-workflows',
    support: 'no',
    note: 'Project scripts and provider skills exist, but no multi-step discussion-workflow definition documented.',
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
    note: 'No "fork workspace" action found in the contracts or web app — neither `forkThread` nor a worktree-cloning command exists, and the keybinding catalog exposes only `chat.new` / `chat.newLocal`.',
    screenshots: [],
  },
  {
    featureId: 'chat-user-questions',
    support: 'yes',
    note: 'ClaudeAdapter detects `AskUserQuestion` tool calls and emits a `user-input.requested` runtime event; the composer renders a dedicated ComposerPendingUserInputPanel with keyboard-shortcut option selection and multi-select support.',
    screenshots: [],
    sourceUrl:
      'https://github.com/pingdotgg/t3code/blob/main/apps/server/src/provider/Layers/ClaudeAdapter.ts',
    sourceExtract:
      'if (toolName === "AskUserQuestion") { return yield* handleAskUserQuestion(context, toolInput, callbackOptions); } […] handleAskUserQuestion emits a `user-input.requested` runtime event and waits for the user to respond via `respondToUserInput`.',
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
  { featureId: 'chat-turn-diff', support: 'unknown', screenshots: [] },
  { featureId: 'unarchive-worktree', support: 'unknown', screenshots: [] },
];
