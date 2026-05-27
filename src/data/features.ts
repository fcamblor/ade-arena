import { FeatureSchema, type Feature } from './schema';
import { z } from 'zod';

const features: Feature[] = [
  {
    id: 'git-worktrees',
    label: 'Git worktree isolation',
    category: 'workflow',
    shortDescription: 'Each agent works in its own isolated git worktree.',
    whyImportant: {
      short: 'Worktrees decide how safely you can run several agents without branch and file conflicts.',
      long: 'Git worktree isolation is the foundation for parallel agent work. Without it, two agents can edit the same checkout, overwrite each other, or make it hard to review which task produced which changes.',
    },
  },
  {
    id: 'sandbox-isolation',
    label: 'Agent sandbox isolation',
    category: 'workflow',
    shortDescription: 'Orchestrator-level sandboxing of agent execution (Docker, micro-VM, chroot…) — distinct from git worktrees.',
    longDescription:
      'Whether the orchestrator itself confines agent tool-calls inside a sandbox (container, micro-VM, chroot, macOS sandbox-exec…), independently of git-worktree filesystem separation. Tools that simply delegate sandboxing to the underlying agent CLI count as "no" at the orchestrator layer. The note records the underlying technology when supported.',
    whyImportant: {
      short: 'Sandboxing limits the blast radius of agent commands that touch files, processes, or the network.',
      long: 'Coding agents frequently run shell commands. A real orchestrator sandbox gives you a second line of defense when a prompt or tool call goes wrong, especially on machines that also hold credentials and private repositories.',
    },
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
    status: 'waiting-for-review',
    shortDescription: 'Agents run on the developer machine.',
  },
  {
    id: 'multiple-model-families',
    label: 'Multiple model families (multi-vendor)',
    category: 'integrations',
    shortDescription: 'Supports model families from multiple vendors (not just multiple models of the same vendor).',
    longDescription:
      'A "yes" requires the orchestrator to drive models from several distinct vendors (Anthropic + OpenAI + Google + …). Supporting only multiple Anthropic models (Opus / Sonnet / Haiku) — or only multiple OpenAI models — counts as "no" because it locks the user into a single vendor. Two vendors is treated as "partial" since the surface remains thin compared to broadly multi-vendor orchestrators.',
    whyImportant: {
      short: 'Multi-vendor support reduces lock-in and lets you pick the best model for each task.',
      long: 'Agent quality changes quickly across vendors. A multi-vendor orchestrator lets you switch when one model is better at planning, another is better at edits, or a provider has an outage or pricing change.',
    },
  },
  {
    id: 'pr-creation',
    label: 'Automatic PR creation',
    category: 'integrations',
    shortDescription: 'The agent opens a GitHub/GitLab PR when a task completes.',
    whyImportant: {
      short: 'Automatic PR creation turns agent output into a reviewable team workflow.',
      long: 'For team use, a completed agent task is not done until it is packaged for review. PR creation reduces handoff friction and keeps the audit trail in the same place as normal engineering work.',
    },
  },
  {
    id: 'visual-task-management',
    label: 'Visual task management (e.g. kanban board)',
    category: 'ux',
    shortDescription: 'Visual management of in-progress tasks — e.g. via a kanban board or another board-style surface.',
    whyImportant: {
      short: 'A board makes parallel agent work visible and easier to steer.',
      long: 'When several agents are running, chat lists alone become hard to scan. A visual task surface helps you spot blocked work, completed runs, and tasks that need human input.',
    },
  },
  {
    id: 'live-logs',
    label: 'Live logs',
    category: 'observability',
    shortDescription: 'Streaming logs/output for each agent in real time.',
    whyImportant: {
      short: 'Live logs let you catch failing installs, loops, and risky commands early.',
      long: 'Agents can spend minutes running commands. Streaming output gives you enough visibility to intervene before a task burns time or drifts away from the intended implementation.',
    },
  },
  {
    id: 'diff-viewer',
    label: 'In-app diff viewer',
    category: 'ux',
    shortDescription: 'Built-in UI to display agent-produced code changes directly in-app (file-by-file).',
    whyImportant: {
      short: 'A diff viewer is the fastest way to judge what an agent actually changed.',
      long: 'Agent summaries are useful, but review happens in the diff. Keeping that diff in the orchestrator shortens the loop between supervising, commenting, and sending the agent back to fix issues.',
    },
  },
  {
    id: 'diff-whitespace-toggle',
    label: 'Diff: ignore-whitespace toggle',
    category: 'ux',
    shortDescription: 'Toggle to hide or show whitespace-only changes in the diff viewer.',
  },
  {
    id: 'diff-multi-views',
    label: 'Diff: multiple scopes / views',
    category: 'ux',
    shortDescription: 'Switch the diff scope between several views (per-commit, uncommitted changes, workspace vs. target branch, …).',
    longDescription:
      'Beyond a single static diff, the orchestrator offers multiple selectable diff scopes — e.g. changes from a single commit, currently uncommitted changes, or the cumulative diff against the target branch. "Partial" when only one alternative scope is available, "yes" when several are. Per-turn diffs surfaced inside the chat are tracked separately by the `chat-turn-diff` row.',
  },
  {
    id: 'chat-turn-diff',
    label: 'Per-turn diff in chat',
    category: 'ux',
    shortDescription: 'Show the code changes produced by an individual LLM turn directly from the chat surface, with no manual commit needed.',
    longDescription:
      'From within the chat, each LLM turn exposes the diff it produced — typically as a footer listing the files it touched, or a click-through to a per-turn scope of the diff viewer. This lets the user review what a given turn changed without manually committing after each turn just to delimit the diff. Distinct from `diff-multi-views`, which tracks whether the diff viewer itself offers several scopes to pick from.',
  },
  {
    id: 'self-hosted',
    label: 'Self-hosted',
    category: 'platform',
    status: 'waiting-for-review',
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
    whyImportant: {
      short: 'Multiple sessions let you split investigation, implementation, and review without changing workspace.',
      long: 'A single worktree can carry more than one conversation: one agent can explore, another can implement, and another can review. This matters when you want parallelism but still want all changes to converge in one branch.',
    },
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
    id: 'diff-comments',
    label: 'Comments on diff panel',
    category: 'ux',
    shortDescription: 'Leave comments on the diff and reference them back in the LLM discussion.',
  },
  {
    id: 'github-comment-sync',
    label: 'One-way GitHub comment sync (PR → in-app)',
    category: 'integrations',
    shortDescription: 'Surface GitHub PR review comments inside the in-app changes / diff panel (one-way ingestion).',
    longDescription:
      'GitHub PR review comments are pulled into the orchestrator’s in-app changes panel so the user (and the agent) can read and react to them without leaving the app. This is intentionally a one-way flow — the reverse direction (pushing in-app comments back to GitHub) is out of scope of this row.',
  },
  {
    id: 'terminal-in-worktree',
    label: 'Terminal in worktree',
    category: 'ux',
    shortDescription: 'Open one or several terminal windows rooted in the current worktree.',
    whyImportant: {
      short: 'An embedded terminal keeps manual verification close to the agent workspace.',
      long: 'Even with strong automation, engineers still need to inspect files, run commands, and reproduce failures. A terminal rooted in the right worktree avoids context mistakes.',
    },
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
      'Define custom actions surfaced in the UI — each action being a shell command (git push, git push --force-with-lease, rebase on target branch…) or a parameterized LLM prompt (resolve conflicts during rebase, open a PR on GitHub, run a review prompt…). A single editable run script alone does NOT qualify as "partial": at minimum the user must be able to declare multiple custom actions (multiple shell commands, or a mix of shell + LLM-prompt actions).',
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
    id: 'remote-plan-collaboration',
    label: 'Remote plan collaboration',
    category: 'collaboration',
    shortDescription: 'Share planning artifacts remotely with teammates for async review and annotation.',
    longDescription:
      'A first-class way to publish or share a plan / session artifact with teammates so they can review, comment, or annotate remotely, without needing direct access to the local worktree.',
  },
  {
    id: 'shared-config',
    label: 'Shared configuration with teammates',
    category: 'collaboration',
    shortDescription: 'Any mechanism to share interesting parts of the tool configuration with teammates (committed config file, registry, marketplace…).',
    longDescription:
      'As soon as the orchestrator exposes a way to share the interesting bits of its configuration with team mates — a committed config file in the repo, an OCI/marketplace registry, an organization-wide settings tier… — this row counts as "yes". A full multi-level hierarchy (user / project / project-local / org…) is a plus but not a requirement.',
  },
  {
    id: 'pr-status-sync',
    label: 'GitHub PR status sync & auto-close',
    category: 'integrations',
    shortDescription: 'Track linked PR state, detect merge, allow manual merge, auto-archive the worktree on merge.',
  },
  {
    id: 'remote-session-control',
    label: 'Remote ADE control',
    category: 'workflow',
    shortDescription: 'Drive the ADE itself remotely from another device, not merely the underlying coding agent.',
    longDescription:
      'Remote control of the Agent Development Environment as a product surface — e.g. open the ADE from a phone, inspect sessions, send prompts, approve actions, or manage runs. Remote-control features provided solely by an embedded coding agent do not count unless the ADE exposes and owns the remote control surface.',
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
    longDescription:
      'Pick a different model in the middle of a running discussion. Cross-vendor switches that require spinning up a new session (ideally seeded with a summary of the previous one to preserve continuity) still count as supported — vendor SDKs are usually too different for an in-place swap.',
  },
  {
    id: 'model-effort-support',
    label: 'Reasoning effort control',
    category: 'integrations',
    shortDescription: 'Tune reasoning/thinking effort for models that expose it (e.g. Anthropic extended thinking).',
  },
  {
    id: 'web-preview',
    label: 'Embedded web preview',
    category: 'ux',
    shortDescription: 'Built-in browser preview of a local web server, ideally bound to a run configuration / allocated port.',
    longDescription:
      'In-app web preview pane that renders the output of a local HTTP server. "Partial" covers an external-browser launch or a pane that merely displays the preview. A "yes" requires an embedded preview integrated with the ADE workflow. Annotation and element inspection are tracked as separate feature rows.',
    whyImportant: {
      short: 'Web preview closes the loop for UI work without leaving the orchestrator.',
      long: 'For frontend changes, screenshots and browser interaction are part of the acceptance criteria. A built-in preview helps the agent and the human verify layout, flows, and visual regressions faster.',
    },
  },
  {
    id: 'web-preview-annotation',
    label: 'Web preview annotation',
    category: 'ux',
    shortDescription: 'Annotate regions of the embedded web preview and feed that visual feedback back into the discussion.',
  },
  {
    id: 'web-preview-element-inspector',
    label: 'Web preview element inspector',
    category: 'ux',
    shortDescription: 'Inspect or select DOM elements in the embedded web preview so the discussion can target exact UI nodes.',
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
    label: 'Activity history dashboard',
    category: 'ux',
    shortDescription: 'Historical view of everything that happened across the orchestrator — past runs, completed tasks, archived sessions — complementing the live visual task management surface.',
    longDescription:
      'A dedicated dashboard surfacing the historical activity of the orchestrator across all worktrees / projects: past discussions, completed or archived tasks, prior agent runs, audit-style timeline. Complementary to the live visual-task-management board, which focuses on what is currently in flight.',
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
    id: 'chat-user-questions',
    label: 'Inline user-question tools in chat',
    category: 'ux',
    shortDescription: 'Render coding-agent user-question tools (e.g. AskUserQuestion) inline in the chat surface, instead of as plain prose.',
    longDescription:
      'Modern coding agents expose tools to ask the user a clarifying question (e.g. `AskUserQuestion`). "Yes" means the orchestrator detects these tool calls and renders them inline in the chat as a dedicated interactive surface — radio buttons, multi-choice, free-text prompt — instead of leaving them as raw markdown that the user has to answer manually.',
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
    id: 'readonly-plan-research-mode',
    label: 'Read-only plan/research mode',
    category: 'workflow',
    shortDescription: 'Toggle a read-only discussion mode for researching the codebase and preparing an implementation plan.',
    longDescription:
      'A discussion mode where the agent can inspect and reason over the codebase without editing it, typically using a stronger thinking model to prepare context, architecture notes, and an implementation plan that can then be handed off to a cheaper implementation model without advanced thinking.',
  },
  {
    id: 'predefined-deterministic-workflows',
    label: 'Predefined deterministic workflows',
    category: 'workflow',
    shortDescription: 'Start a chat session that follows a deterministic built-in workflow (research → plan → implement → review, idea-to-PR, bug-repro-and-fix…).',
    longDescription:
      'Launch a discussion that walks through a fixed deterministic sequence of phases, picked from a catalog of built-in workflows — e.g. research → plan → implement → review, idea-to-PR, bug-repro-and-fix, debugging-session — each with phase-specific prompts, models or tool permissions, instead of a free-form single-turn loop.',
  },
  {
    id: 'custom-deterministic-workflows',
    label: 'Custom deterministic workflows',
    category: 'workflow',
    shortDescription: 'Author custom multi-step workflows to add determinism to discussion sessions.',
    longDescription:
      'Define your own deterministic discussion workflows — ordered phases, per-step prompts, gating conditions, model/tool overrides — to make agent sessions repeatable across runs.',
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
  {
    id: 'unarchive-worktree',
    label: 'Unarchive a worktree',
    category: 'workflow',
    shortDescription: 'Restore an archived worktree back to the active list so its session, files and history can be resumed.',
    longDescription:
      'After a worktree has been archived — manually or automatically (e.g. on PR merge) — the orchestrator exposes an action to bring it back as an active workspace, preserving its session/chat history and git state. "Partial" when only the metadata is restored (no underlying worktree/state), "yes" when the restored workspace is fully resumable.',
  },
  {
    id: 'in-app-voice-input',
    label: 'In-app voice input',
    category: 'ux',
    shortDescription: 'Dictate prompts or chat messages directly inside the ADE.',
  },
  {
    id: 'local-target-branch-merge',
    label: 'Local merge to target branch',
    category: 'workflow',
    shortDescription: 'Merge the current work locally into the configured target branch directly from the ADE.',
  },
  {
    id: 'llm-assisted-merge-rebase',
    label: 'LLM-assisted merge/rebase',
    category: 'workflow',
    shortDescription: 'Merge or rebase onto a chosen branch, defaulting to the target branch, with conflicts resolved through the LLM.',
  },
  {
    id: 'chat-message-stacking',
    label: 'Chat message stacking',
    category: 'ux',
    shortDescription: 'Queue several user messages in the chat so they are sent or applied as a stacked sequence.',
  },
  {
    id: 'multi-repository-view',
    label: 'Multi-repository view',
    category: 'workflow',
    shortDescription: 'Show multiple repositories at once and filter the UI to focus on selected repositories.',
  },
  {
    id: 'multi-repository-chat-targeting',
    label: 'Multi-repository chat targeting',
    category: 'workflow',
    shortDescription: 'Target several repositories, such as frontend and backend, within one discussion.',
  },
  {
    id: 'chat-transcript-export',
    label: 'Chat transcript export',
    category: 'observability',
    shortDescription: 'Retrieve the full transcript of a discussion (user messages, agent turns, tool calls) for downstream analysis.',
    longDescription:
      'Expose a frictionless way to extract a complete, machine-readable transcript of a discussion — including user messages, assistant turns, tool calls and their results — through a copy/export action, a file on disk, or a dedicated API. Useful to fork the conversation in another tool, run meta analyses on agent behavior, identify recurring failure modes, or build prompts/skills from past sessions. "Partial" when only the visible chat text can be copied piecemeal; "yes" when a structured export covering the full session (including tool I/O) is available.',
    whyImportant: {
      short: 'A transcript export turns past sessions into reusable material for forking, debugging and improving agent workflows.',
      long: 'Discussions are the richest signal an ADE produces. Being able to extract them in full lets users fork a promising run into another tool, mine recurring agent mistakes, distill new prompts/skills, or share reproducible cases with teammates. Without an export, that knowledge stays locked inside the orchestrator UI.',
    },
  },
];

export const FEATURES: readonly Feature[] = z.array(FeatureSchema).parse(features);
