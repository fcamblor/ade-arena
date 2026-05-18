import { FeatureSchema, type Feature } from './schema';
import { z } from 'zod';

const features: Feature[] = [
{
    id: 'git-worktrees',
    label: 'Git worktree isolation',
    category: 'workflow',
    shortDescription: 'Each agent works in its own isolated git worktree.',
  },
  {
    id: 'sandbox-isolation',
    label: 'Agent sandbox isolation',
    category: 'workflow',
    shortDescription: 'Orchestrator-level sandboxing of agent execution (Docker, micro-VM, chroot…) — distinct from git worktrees.',
    longDescription:
      'Whether the orchestrator itself confines agent tool-calls inside a sandbox (container, micro-VM, chroot, macOS sandbox-exec…), independently of git-worktree filesystem separation. Tools that simply delegate sandboxing to the underlying agent CLI count as "no" at the orchestrator layer. The note records the underlying technology when supported.',
  },
  {
    id: 'cloud-execution',
    label: 'Cloud execution',
    category: 'platform',
    shortDescription: 'The orchestrator runs agents in a cloud environment, not locally.',
  },
  {
    id: 'local-execution',
    label: 'Local execution',
    category: 'platform',
    shortDescription: 'Agents run on the developer machine.',
  },
  {
    id: 'multi-model',
    label: 'Multi-model (Claude, GPT, …)',
    category: 'integrations',
    shortDescription: 'Supports multiple LLM providers/models.',
  },
  {
    id: 'pr-creation',
    label: 'Automatic PR creation',
    category: 'integrations',
    shortDescription: 'The agent opens a GitHub/GitLab PR when a task completes.',
  },
  {
    id: 'kanban-board',
    label: 'Kanban task board',
    category: 'ux',
    shortDescription: 'Kanban-style interface to track in-progress / done tasks.',
  },
  {
    id: 'live-logs',
    label: 'Live logs',
    category: 'observability',
    shortDescription: 'Streaming logs/output for each agent in real time.',
  },
  {
    id: 'diff-review',
    label: 'Built-in diff review',
    category: 'ux',
    shortDescription: 'In-app UI to review an agent diff before merging.',
  },
  {
    id: 'oss',
    label: 'Open source',
    category: 'pricing',
    shortDescription: 'Source available under a permissive license.',
  },
  {
    id: 'free-tier',
    label: 'Free tier',
    category: 'pricing',
    shortDescription: 'Free plan usable without a credit card.',
  },
  {
    id: 'self-hosted',
    label: 'Self-hosted',
    category: 'platform',
    shortDescription: 'Can be deployed on your own infrastructure.',
  },
  {
    id: 'sound-notifications',
    label: 'Configurable sound notifications',
    category: 'ux',
    shortDescription: 'Configure sound alerts for key agent events (idle, awaiting input, task done…).',
  },
  {
    id: 'multi-sessions-per-worktree',
    label: 'Multiple sessions per worktree',
    category: 'workflow',
    shortDescription: 'Attach several chat sessions to one worktree for context resets, mixed models, or parallel sub-topics.',
    longDescription:
      'A single worktree can host multiple independent agent sessions running in parallel, each with its own context, model, and topic — useful to reset context, mix models, or split unrelated subjects without leaving the worktree.',
  },
  {
    id: 'no-worktree-mode',
    label: 'Work without a worktree',
    category: 'workflow',
    shortDescription: 'Run the agent directly inside an existing repository, without creating a git worktree.',
  },
  {
    id: 'workflow-shell-hooks',
    label: 'Workflow shell hooks',
    category: 'workflow',
    shortDescription: 'Trigger custom shell scripts at workflow lifecycle events (worktree creation, archival, …).',
    longDescription:
      'Run arbitrary shell scripts at predefined points of the discussion/worktree lifecycle — e.g. on worktree creation, archival, session start/stop — to bootstrap services, seed data, or clean up resources.',
  },
  {
    id: 'run-configurations',
    label: 'Run configurations',
    category: 'ux',
    shortDescription: 'Define and launch shell commands ("run configurations") directly from the UI.',
  },
  {
    id: 'worktree-port-env-vars',
    label: 'Per-worktree port allocation & env vars',
    category: 'workflow',
    shortDescription: 'Expose env vars to shell scripts, including a pool of free ports allocated to the current worktree.',
    longDescription:
      'Each worktree gets a dedicated pool of free ports, exposed via environment variables to scripts and run configurations, so multiple worktrees can run their own web server / DB / backend in parallel without conflicts.',
  },
  {
    id: 'supported-assistants',
    label: 'Supported assistants / CLIs',
    category: 'integrations',
    shortDescription: 'Range of coding assistants/CLIs supported (Claude Code, Codex, Cursor, Aider…).',
  },
  {
    id: 'diff-panel-files-list',
    label: 'Diff panel with file list & whitespace toggle',
    category: 'ux',
    shortDescription: 'File-by-file diff panel with the option to ignore whitespace changes.',
  },
  {
    id: 'diff-comments',
    label: 'Comments on diff panel',
    category: 'ux',
    shortDescription: 'Leave comments on the diff and reference them back in the LLM discussion.',
  },
  {
    id: 'github-comment-sync',
    label: 'GitHub comment sync',
    category: 'integrations',
    shortDescription: 'Synchronize in-app diff comments with GitHub PR comments.',
  },
  {
    id: 'terminal-in-worktree',
    label: 'Terminal in worktree',
    category: 'ux',
    shortDescription: 'Open one or several terminal windows rooted in the current worktree.',
  },
  {
    id: 'open-in-ide',
    label: 'Open in IDE / external app',
    category: 'integrations',
    shortDescription: 'Open the worktree in an IDE or external app — including user-defined custom apps.',
    longDescription:
      'Launch the current worktree in an IDE / editor / app. Covers which apps ship built-in (VS Code, JetBrains, Cursor…) and whether custom apps can be configured by the user.',
  },
  {
    id: 'file-tree-browser',
    label: 'File tree browser',
    category: 'ux',
    shortDescription: 'Browse the worktree file tree from within the app.',
  },
  {
    id: 'inline-file-editing',
    label: 'Inline file editing',
    category: 'ux',
    shortDescription: 'Edit and save files directly from the in-app file browser.',
  },
  {
    id: 'custom-ui-actions',
    label: 'Custom UI actions (prompts or commands)',
    category: 'ux',
    shortDescription: 'Customize the UI with buttons running either shell commands or LLM prompts.',
    longDescription:
      'Define custom actions surfaced in the UI — each action being a shell command (git push, git push --force-with-lease, rebase on target branch…) or a parameterized LLM prompt (resolve conflicts during rebase, open a PR on GitHub, run a review prompt…).',
  },
  {
    id: 'session-handoff',
    label: 'Session handoff via shared context dir',
    category: 'workflow',
    shortDescription: 'Persist files (e.g. plan.md) in a gitignored dir to hand off context between sessions.',
    longDescription:
      'A dedicated gitignored directory (e.g. .context) lets sessions persist artifacts like plans, notes or handoff files that subsequent sessions on the same worktree can reference.',
  },
  {
    id: 'remote-file-sharing',
    label: 'Remote file sharing for annotation',
    category: 'collaboration',
    shortDescription: 'Share files remotely with teammates for external annotation (e.g. plannotator.ai).',
  },
  {
    id: 'shared-config-levels',
    label: 'Shared multi-level configuration',
    category: 'collaboration',
    shortDescription: 'Share tool configuration with teammates across multiple levels (project, project-local, user…).',
  },
  {
    id: 'pr-status-sync',
    label: 'GitHub PR status sync & auto-close',
    category: 'integrations',
    shortDescription: 'Track linked PR state, detect merge, allow manual merge, auto-archive the worktree on merge.',
  },
  {
    id: 'remote-session-control',
    label: 'Remote control of sessions',
    category: 'workflow',
    shortDescription: 'Drive and control agent sessions remotely (e.g. from a phone or another device).',
  },
  {
    id: 'context-fill-indicator',
    label: 'Context usage indicator',
    category: 'observability',
    shortDescription: 'Visualize the current context window fill ratio in the ongoing discussion.',
  },
  {
    id: 'switch-model-mid-session',
    label: 'Switch model mid-session',
    category: 'workflow',
    shortDescription: 'Change the underlying LLM at any point during a discussion.',
  },
  {
    id: 'model-effort-support',
    label: 'Reasoning effort control',
    category: 'integrations',
    shortDescription: 'Tune reasoning/thinking effort for models that expose it (e.g. Anthropic extended thinking).',
  },
  {
    id: 'multi-model-integration',
    label: 'Multi-model integration mechanism',
    category: 'integrations',
    shortDescription: 'How the orchestrator plugs into each model: direct SDK, ACP, OpenAI-compatible API, CLI wrap…',
    longDescription:
      'When the tool supports several models, the way each integration is wired matters — direct provider SDK, Agent Client Protocol (ACP), OpenAI-compatible HTTP API, CLI subprocess wrapping, MCP — because it impacts pricing (BYOK vs. bundled), capability parity (tool use, thinking, caching) and latency.',
  },
  {
    id: 'web-preview',
    label: 'Embedded web preview',
    category: 'ux',
    shortDescription: 'Built-in browser preview of a local web server, ideally bound to a run configuration / allocated port.',
    longDescription:
      'In-app web preview pane that renders the output of a local HTTP server. Ideally couples with a run configuration that launches the server on a per-worktree allocated port, so the preview updates as the agent edits the code.',
  },
  {
    id: 'plugin-system',
    label: 'Plugin system',
    category: 'platform',
    shortDescription: 'Extend the orchestrator with third-party or user-authored plugins.',
  },
  {
    id: 'quick-chat',
    label: 'Repo-less quick chat',
    category: 'workflow',
    shortDescription: 'Chat with a model without attaching the conversation to a repository / worktree.',
    longDescription:
      'A lightweight, repo-less chat surface for ad-hoc questions to a model — useful for one-off prompts, brainstorming, or scripting tasks that should not pollute a worktree session.',
  },
  {
    id: 'mission-control',
    label: 'Mission-control dashboard',
    category: 'ux',
    shortDescription: 'Central dashboard aggregating in-progress, awaiting-input and completed tasks across worktrees.',
    longDescription:
      'A unified control-tower view listing every running, idle, awaiting-input and recently completed task across all worktrees / projects, so the user can keep an eye on the fleet without opening each workspace.',
  },
  {
    id: 'copy-from-origin-workspace',
    label: 'Copy files from origin workspace',
    category: 'workflow',
    shortDescription: 'Bring files (e.g. .env, local secrets) from the source repo into the agent worktree by copy.',
  },
  {
    id: 'symlink-from-origin-workspace',
    label: 'Symlink files from origin workspace',
    category: 'workflow',
    shortDescription: 'Expose files from the source repo inside the agent worktree via symlinks (ln -s).',
  },
  {
    id: 'chat-rewind',
    label: 'Rewind chat to a past message',
    category: 'ux',
    shortDescription: 'Jump back to a previous message in the chat to fork or rewrite the conversation history.',
    longDescription:
      'Navigate back to any past message in a discussion and resume from there — truncating or branching the conversation history. An advanced variant also rolls back the workspace filesystem state to match the message, so the agent restarts from the exact code context it had at that point.',
  },
  {
    id: 'predefined-workflows-sessions',
    label: 'Predefined workflow sessions',
    category: 'workflow',
    shortDescription: 'Start a chat session that follows one of several built-in workflows (research → plan → implement → review, idea-to-PR, bug-repro-and-fix, debugging-session…).',
    longDescription:
      'Launch a discussion that walks through a fixed sequence of phases, picked from a catalog of built-in workflows — e.g. research → plan → implement → review, idea-to-PR, bug-repro-and-fix, debugging-session — each with phase-specific prompts, models or tool permissions, instead of a free-form single-turn loop.',
  },
  {
    id: 'custom-discussion-workflows',
    label: 'Custom discussion workflows',
    category: 'workflow',
    shortDescription: 'Author custom multi-step workflows to add determinism to discussion sessions.',
    longDescription:
      'Define your own discussion workflows — ordered phases, per-step prompts, gating conditions, model/tool overrides — to make agent sessions more deterministic and repeatable across runs.',
  },
  {
    id: 'shared-discussion-workflows',
    label: 'Share discussion workflows with teammates',
    category: 'collaboration',
    shortDescription: 'Share custom discussion workflows with team mates (export/import, git-tracked, registry…).',
    longDescription:
      'Distribute authored discussion workflows to team mates — via a shared repository, an in-app registry, or import/export files — so a whole team can run the same deterministic agent playbooks.',
  },
  {
    id: 'fork-workspace',
    label: 'Fork workspace to a new worktree',
    category: 'workflow',
    shortDescription: 'Clone the current workspace (worktree state + session history) into a new worktree to branch off explorations.',
    longDescription:
      'Fork the entire state of a workspace — git worktree contents, session/chat history, and any local-only files — into a brand-new worktree, so you can branch off an alternative exploration without disturbing the original session.',
  },
];

export const FEATURES: readonly Feature[] = z.array(FeatureSchema).parse(features);
