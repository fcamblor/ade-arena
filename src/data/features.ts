import { FeatureSchema, type Feature } from './schema';
import { z } from 'zod';

// Features are grouped by category, in the same order the comparison table
// renders them (see `categoryOrder` in ComparisonTable.astro):
// workflow → ux → integrations → observability → collaboration → platform.
// Within a category, related features (the diff-*, web-preview-*,
// *-deterministic-workflows families, etc.) are kept adjacent. The source
// order has no runtime effect — the table groups by `category` — but keeping
// it aligned makes the file readable and easy to maintain.
const features: Feature[] = [
  // ───────────────────────── workflow ─────────────────────────
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
    id: 'no-worktree-mode',
    label: 'Work without a worktree',
    category: 'workflow',
    shortDescription: 'Run the agent directly inside an existing repository, without creating a git worktree.',
    whyImportant: {
      short: "Working in-place matters when a task is too small to justify a worktree, or when the project's build setup doesn't tolerate parallel checkouts.",
      long: 'Multi-worktree setups can clash with heavy native build caches, IDE locks, or repos that ship hardcoded absolute paths. Running the agent directly in the existing checkout keeps the orchestrator usable on those projects without forcing a worktree everywhere.',
    },
  },
  {
    id: 'multi-sessions-per-worktree',
    label: 'Multiple sessions per worktree',
    category: 'workflow',
    shortDescription: 'Attach several chat sessions to one worktree for context resets, mixed models, or parallel sub-topics.',
    longDescription:
      'A single worktree can host multiple independent agent sessions running in parallel, each with its own context, model, and topic — useful to reset context, mix models, or split unrelated subjects without leaving the worktree. Each session must also be visually attached to its parent worktree in the UI, so it stays obvious at a glance which sessions share the same workspace.',
    whyImportant: {
      short: 'Multiple sessions let you split investigation, implementation, and review without changing workspace.',
      long: 'A single worktree can carry more than one conversation: one agent can explore, another can implement, and another can review. This matters when you want parallelism but still want all changes to converge in one branch.',
    },
  },
  {
    id: 'workflow-shell-hooks',
    label: 'Workflow shell hooks',
    category: 'workflow',
    shortDescription: 'Trigger custom shell scripts at workflow lifecycle events (worktree creation, archival, …).',
    longDescription:
      'Run arbitrary shell scripts at predefined points of the discussion/worktree lifecycle — e.g. on worktree creation, archival, session start/stop — to bootstrap services, seed data, or clean up resources.',
    whyImportant: {
      short: "Lifecycle hooks wire the orchestrator into your project's bootstrap and cleanup needs without manual steps.",
      long: 'Most repos need extra steps before an agent can be productive: install dependencies, seed a database, copy local config. Hooks make those steps automatic and reproducible across every worktree the team creates.',
    },
  },
  {
    id: 'worktree-port-env-vars',
    label: 'Per-worktree port allocation & env vars',
    category: 'workflow',
    shortDescription: 'Expose env vars to shell scripts, including a pool of free ports allocated to the current worktree.',
    longDescription:
      'Each worktree gets a dedicated pool of free ports, exposed via environment variables to scripts and run configurations, so multiple worktrees can run their own web server / DB / backend in parallel without conflicts.',
    whyImportant: {
      short: 'Per-worktree port pools avoid collisions when several agents start dev servers in parallel.',
      long: 'Without dedicated ports, two agents bringing up a backend on 3000 will clash. A per-worktree pool exposed as env vars lets each workspace run its full stack independently.',
    },
  },
  {
    id: 'copy-from-origin-workspace',
    label: 'Copy files from origin workspace',
    category: 'workflow',
    shortDescription: 'Bring files (e.g. .env, local secrets) from the source repo into the agent worktree by copy.',
    whyImportant: {
      short: 'Copying local-only files (.env, secrets, caches) makes a new worktree immediately runnable.',
      long: 'A fresh worktree is missing every gitignored file the original checkout has accumulated. Copying these on creation is often the fastest path to a working dev environment for the agent.',
    },
  },
  {
    id: 'symlink-from-origin-workspace',
    label: 'Symlink files from origin workspace',
    category: 'workflow',
    shortDescription: 'Expose files from the source repo inside the agent worktree via symlinks (ln -s).',
    whyImportant: {
      short: 'Symlinks keep large or frequently-changing local files in sync across worktrees without duplication.',
      long: 'For files that change often (state databases, build caches) or are too large to copy, symlinks share them across worktrees at zero storage cost and with no risk of drift between copies.',
    },
  },
  {
    id: 'session-handoff',
    label: 'Session handoff via shared context dir',
    category: 'workflow',
    shortDescription: 'Persist files (e.g. plan.md) in a gitignored dir to hand off context between sessions.',
    longDescription:
      'A dedicated gitignored directory (e.g. .context) lets sessions persist artifacts like plans, notes or handoff files that subsequent sessions on the same worktree can reference.',
    whyImportant: {
      short: 'A shared context dir keeps plans and notes alive across sessions on the same worktree.',
      long: 'When chat history is reset or a session is replaced, useful artifacts like an implementation plan would be lost. A gitignored shared directory lets sessions hand off context to one another without polluting the repo.',
    },
  },
  {
    id: 'readonly-plan-research-mode',
    label: 'Read-only plan/research mode',
    category: 'workflow',
    shortDescription: 'Toggle a read-only discussion mode for researching the codebase and preparing an implementation plan.',
    longDescription:
      'A discussion mode where the agent can inspect and reason over the codebase without editing it, typically using a stronger thinking model to prepare context, architecture notes, and an implementation plan that can then be handed off to a cheaper implementation model without advanced thinking.',
    whyImportant: {
      short: 'A read-only mode lets a heavy thinking model plan without burning tokens on edits.',
      long: 'Splitting research/planning from implementation lets you use a stronger (and pricier) reasoning model only where it matters, then hand the plan to a cheaper model for the actual edits — without risking unwanted code changes during exploration.',
    },
  },
  {
    id: 'predefined-deterministic-workflows',
    label: 'Predefined deterministic workflows',
    category: 'workflow',
    shortDescription: 'Start a chat session that follows a deterministic built-in workflow (research → plan → implement → review, idea-to-PR, bug-repro-and-fix…).',
    longDescription:
      'Launch a discussion that walks through a fixed deterministic sequence of phases, picked from a catalog of built-in workflows — e.g. research → plan → implement → review, idea-to-PR, bug-repro-and-fix, debugging-session — each with phase-specific prompts, models or tool permissions, instead of a free-form single-turn loop.',
    whyImportant: {
      short: 'Built-in workflows give you a vetted recipe instead of reinventing prompting strategy each task.',
      long: 'Patterns like research → plan → implement → review have proven track records. Shipping them as first-class workflows lets users get reproducible quality without designing the orchestration themselves.',
    },
  },
  {
    id: 'custom-deterministic-workflows',
    label: 'Custom deterministic workflows',
    category: 'workflow',
    shortDescription: 'Author custom multi-step workflows to add determinism to discussion sessions.',
    longDescription:
      'Define your own deterministic discussion workflows — ordered phases, per-step prompts, gating conditions, model/tool overrides — to make agent sessions repeatable across runs.',
    whyImportant: {
      short: 'Authored workflows make team-specific processes reproducible across agent runs.',
      long: 'Every team has its own conventions — ADR-first, repro-first, security-pass-required. Encoding them as authored workflows turns ad-hoc prompting into a repeatable playbook anyone on the team can run.',
    },
  },
  {
    id: 'fork-workspace',
    label: 'Fork workspace to a new worktree',
    category: 'workflow',
    shortDescription: 'Clone the current workspace (worktree state + session history) into a new worktree to branch off explorations.',
    longDescription:
      'Fork the entire state of a workspace — git worktree contents, session/chat history, and any local-only files — into a brand-new worktree, so you can branch off an alternative exploration without disturbing the original session.',
    whyImportant: {
      short: 'Forking lets you explore an alternative from a known-good point without losing the original conversation state.',
      long: 'Sometimes you want to try a different approach from mid-session. Forking the entire workspace — code state plus chat history — preserves both branches of the exploration so you can compare them later.',
    },
  },
  {
    id: 'unarchive-worktree',
    label: 'Unarchive a worktree',
    category: 'workflow',
    shortDescription: 'Restore an archived worktree back to the active list so its session, files and history can be resumed.',
    longDescription:
      'After a worktree has been archived — manually or automatically (e.g. on PR merge) — the orchestrator exposes an action to bring it back as an active workspace, preserving its session/chat history and git state. "Partial" when only the metadata is restored (no underlying worktree/state), "yes" when the restored workspace is fully resumable.',
    whyImportant: {
      short: 'Unarchiving recovers prior work when a merged or closed thread needs to be reopened.',
      long: 'PRs get rejected, tasks come back from review, decisions get reversed. Being able to restore an archived worktree with its full session history avoids re-bootstrapping the context from scratch.',
    },
  },
  {
    id: 'local-target-branch-merge',
    label: 'Local merge to target branch',
    category: 'workflow',
    shortDescription: 'Merge the current work locally into the configured target branch directly from the ADE.',
    whyImportant: {
      short: 'A local merge action shortens the loop when no PR review is needed.',
      long: "For solo work, small fixes, or repos without a PR workflow, integrating directly to the target branch removes a step. Doing it from the ADE keeps the chronology aligned with the agent's session.",
    },
  },
  {
    id: 'llm-assisted-merge-rebase',
    label: 'LLM-assisted merge/rebase',
    category: 'workflow',
    shortDescription: 'Merge or rebase onto a chosen branch, defaulting to the target branch, with conflicts resolved through the LLM.',
    whyImportant: {
      short: 'LLM-assisted resolution removes the manual cost of frequent rebases against a moving target.',
      long: 'Rebasing onto a fast-moving main is one of the steepest costs of parallel agent work. Letting the LLM resolve conflicts with the surrounding context keeps multiple branches alive without forcing a human to arbitrate every collision.',
    },
  },
  {
    id: 'multi-repository-view',
    label: 'Multi-repository view',
    category: 'workflow',
    shortDescription: 'Show multiple repositories at once and filter the UI to focus on selected repositories.',
    whyImportant: {
      short: 'A unified view matters when work spans repos that share a delivery pipeline.',
      long: 'Polyrepo setups force users to mentally stitch state across projects. Surfacing several repos in one workspace makes it possible to track them at a glance and focus the UI on the subset that matters right now.',
    },
  },
  {
    id: 'multi-repository-chat-targeting',
    label: 'Multi-repository chat targeting',
    category: 'workflow',
    shortDescription: 'Target several repositories, such as frontend and backend, within one discussion.',
    whyImportant: {
      short: 'Multi-repo chat sessions handle changes that need to cross frontend/backend boundaries.',
      long: 'Feature work routinely touches more than one repo — API schema plus client, mobile plus backend. A discussion that can target several repositories at once lets the agent reason about both sides without juggling separate sessions and losing context.',
    },
  },

  // ─────────────────────────── ux ───────────────────────────
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
    id: 'mission-control',
    label: 'Activity history dashboard',
    category: 'ux',
    shortDescription: 'Historical view of everything that happened across the orchestrator — past runs, completed tasks, archived sessions — complementing the live visual task management surface.',
    longDescription:
      'A dedicated dashboard surfacing the historical activity of the orchestrator across all worktrees / projects: past discussions, completed or archived tasks, prior agent runs, audit-style timeline. Complementary to the live visual-task-management board, which focuses on what is currently in flight.',
    whyImportant: {
      short: 'A history surface turns past runs into searchable institutional memory.',
      long: "Once you've run dozens of tasks, finding the run where a tricky bug was fixed becomes hard. A dedicated dashboard lets you reopen, audit, or learn from prior work instead of recreating it.",
    },
  },
  {
    id: 'file-tree-browser',
    label: 'File tree browser',
    category: 'ux',
    shortDescription: 'Browse the worktree file tree from within the app.',
    whyImportant: {
      short: 'An in-app tree is the fastest way to navigate what the agent created or modified without context-switching.',
      long: 'Inspecting files is part of every review, even a quick one. Keeping a tree inside the orchestrator avoids hopping to an IDE or terminal just to confirm a path or read a small file.',
    },
  },
  {
    id: 'inline-file-editing',
    label: 'Inline file editing',
    category: 'ux',
    shortDescription: 'Edit and save files directly from the in-app file browser.',
    whyImportant: {
      short: "Inline edits handle the small, targeted fixes that don't justify another agent turn.",
      long: 'Sometimes you spot a typo, a misplaced semicolon, or a constant that needs tweaking. Editing directly in the ADE avoids burning a whole prompt cycle on a one-character change.',
    },
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
    id: 'run-configurations',
    label: 'Run configurations',
    category: 'ux',
    shortDescription: 'Define and launch shell commands ("run configurations") directly from the UI.',
    whyImportant: {
      short: 'Saved run configs make it easy to launch and verify the project without leaving the ADE.',
      long: 'Running tests, starting a dev server, or invoking a build belongs to every verification loop. Declarative run configs surface those commands as one-click actions instead of typed shell incantations.',
    },
  },
  {
    id: 'custom-ui-actions',
    label: 'Custom UI actions (prompts or commands)',
    category: 'ux',
    shortDescription: 'Customize the UI with buttons running either shell commands or LLM prompts.',
    longDescription:
      'Define custom actions surfaced in the UI — each action being a shell command (git push, git push --force-with-lease, rebase on target branch…) or a parameterized LLM prompt (resolve conflicts during rebase, open a PR on GitHub, run a review prompt…). A single editable run script alone does NOT qualify as "partial": at minimum the user must be able to declare multiple custom actions (multiple shell commands, or a mix of shell + LLM-prompt actions).',
    whyImportant: {
      short: 'Custom buttons put team-specific shortcuts (open PR, force push, rebase) one click away.',
      long: 'Workflows usually need a handful of glue commands or canned prompts to wrap up a task. Exposing them as named UI actions makes them safer, faster, and shareable instead of typed by hand each time.',
    },
  },
  {
    id: 'ui-commit',
    label: 'In-app commit',
    category: 'ux',
    shortDescription: 'Commit changes directly from the UI with file selection and a manual or AI-generated commit message.',
    longDescription:
      'The orchestrator provides a built-in commit surface — file staging checkboxes, a commit message field, and optionally an AI-generated message — so the user can commit without leaving the ADE. "Partial" when file selection or message generation is missing. A simple "commit all" one-click with no staging control does NOT qualify as "yes".',
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
    whyImportant: {
      short: 'A whitespace toggle strips reformat noise so review focuses on the real change.',
      long: 'Agents often reformat surrounding lines or change indentation alongside a real edit. Being able to hide whitespace lets reviewers spot the substantive change in a sea of cosmetic diff lines.',
    },
  },
  {
    id: 'diff-multi-views',
    label: 'Diff: multiple scopes / views',
    category: 'ux',
    shortDescription: 'Switch the diff scope between several views (per-commit, uncommitted changes, workspace vs. target branch, …).',
    longDescription:
      'Beyond a single static diff, the orchestrator offers multiple selectable diff scopes — e.g. changes from a single commit, currently uncommitted changes, or the cumulative diff against the target branch. "Partial" when only one alternative scope is available, "yes" when several are. Per-turn diffs surfaced inside the chat are tracked separately by the `chat-turn-diff` row.',
    whyImportant: {
      short: 'Multiple diff scopes let you review at the right altitude — turn, branch, or workspace.',
      long: "What you want to see depends on the question: the last turn's edits, all uncommitted changes, or the full delta against main. Switching diff scope without leaving the viewer keeps review fast and unambiguous.",
    },
  },
  {
    id: 'chat-turn-diff',
    label: 'Per-turn diff in chat',
    category: 'ux',
    shortDescription: 'Show the code changes produced by an individual LLM turn directly from the chat surface, with no manual commit needed.',
    longDescription:
      'From within the chat, each LLM turn exposes the diff it produced — typically as a footer listing the files it touched, or a click-through to a per-turn scope of the diff viewer. This lets the user review what a given turn changed without manually committing after each turn just to delimit the diff. Distinct from `diff-multi-views`, which tracks whether the diff viewer itself offers several scopes to pick from.',
    whyImportant: {
      short: "A per-turn diff in chat removes the need to commit just to bound an agent's edits.",
      long: "Reviewing what each turn actually changed used to require committing between turns. Surfacing it inline lets you grade the agent's last move directly from the chat without polluting the git history.",
    },
  },
  {
    id: 'diff-comments',
    label: 'Comments on diff panel',
    category: 'ux',
    shortDescription: 'Leave comments on the diff and reference them back in the LLM discussion.',
    whyImportant: {
      short: 'Comments on the diff let you feed targeted feedback back to the agent without retyping context.',
      long: "Highlighting a line and writing 'this should also handle null' is much faster than copy-pasting code into chat. Comments anchored to the diff give the agent precise pointers to act on.",
    },
  },
  {
    id: 'chat-user-questions',
    label: 'Inline user-question tools in chat',
    category: 'ux',
    shortDescription: 'Render coding-agent user-question tools (e.g. AskUserQuestion) inline in the chat surface, instead of as plain prose.',
    longDescription:
      'Modern coding agents expose tools to ask the user a clarifying question (e.g. `AskUserQuestion`). "Yes" means the orchestrator detects these tool calls and renders them inline in the chat as a dedicated interactive surface — radio buttons, multi-choice, free-text prompt — instead of leaving them as raw markdown that the user has to answer manually.',
    whyImportant: {
      short: 'Rendering question tools inline turns clarifying prompts into one-click answers.',
      long: "Modern agents pause to ask the user to pick between options. When that surface is raw markdown, users either skim past it or type a free-form reply the agent can't parse cleanly — defeating the point of the tool.",
    },
  },
  {
    id: 'chat-rewind',
    label: 'Rewind chat to a past message',
    category: 'ux',
    shortDescription: 'Jump back to a previous message in the chat to fork or rewrite the conversation history.',
    longDescription:
      'Navigate back to any past message in a discussion and resume from there — truncating or branching the conversation history. An advanced variant also rolls back the workspace filesystem state to match the message, so the agent restarts from the exact code context it had at that point.',
    whyImportant: {
      short: 'Rewinding the chat saves a session that has drifted off-course without starting from scratch.',
      long: 'A bad turn can derail an otherwise promising session. Jumping back before the mistake — ideally with the workspace rolled back too — lets you redirect the agent instead of throwing away the whole conversation.',
    },
  },
  {
    id: 'chat-message-stacking',
    label: 'Chat message stacking',
    category: 'ux',
    shortDescription: 'Queue several user messages in the chat so they are sent or applied as a stacked sequence.',
    whyImportant: {
      short: 'Stacked messages let you queue follow-ups while the agent is mid-turn.',
      long: 'Watching an agent work and noticing a new thing to ask is common. Queuing the next message instead of waiting for the turn to end captures your train of thought without interrupting the agent.',
    },
  },
  {
    id: 'in-app-voice-input',
    label: 'In-app voice input',
    category: 'ux',
    shortDescription: 'Dictate prompts or chat messages directly inside the ADE.',
    whyImportant: {
      short: 'Voice input lowers the friction of long, exploratory prompts.',
      long: 'Some thoughts are faster to speak than to type — especially when steering the agent during an active session. Dictation built into the ADE removes a context switch to an OS-level tool.',
    },
  },
  {
    id: 'quick-chat',
    label: 'Repo-less quick chat',
    category: 'ux',
    shortDescription: 'Chat with a model without attaching the conversation to a repository / worktree.',
    longDescription:
      'A lightweight, repo-less chat surface for ad-hoc questions to a model — useful for one-off prompts, brainstorming, or scripting tasks that should not pollute a worktree session.',
    whyImportant: {
      short: 'A repo-less chat handles ad-hoc questions without spinning up a worktree.',
      long: "Not every prompt needs a project: a regex, a quick shell snippet, an explanation of an error. A lightweight chat surface keeps those one-offs out of any worktree's tracked history.",
    },
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
    whyImportant: {
      short: 'Annotating the preview turns visual feedback into prompts the agent can act on.',
      long: "Pointing at a UI element and saying 'fix this padding' is faster than describing it in words. Annotation lets the user mark exactly what's wrong and send it back to the agent without screen-sharing or external tools.",
    },
  },
  {
    id: 'web-preview-element-inspector',
    label: 'Web preview element inspector',
    category: 'ux',
    shortDescription: 'Inspect or select DOM elements in the embedded web preview so the discussion can target exact UI nodes.',
    whyImportant: {
      short: 'An element inspector lets the agent target exact DOM nodes instead of guessing from text.',
      long: "Asking 'change the button on the right' is brittle. Selecting a DOM element gives the agent a concrete selector to work from and removes most of the back-and-forth about which node the user actually meant.",
    },
  },

  // ─────────────────────── integrations ───────────────────────
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
    id: 'model-effort-support',
    label: 'Reasoning effort control',
    category: 'integrations',
    shortDescription: 'Tune reasoning/thinking effort for models that expose it (e.g. Anthropic extended thinking).',
    whyImportant: {
      short: 'Tuning effort matches model spend to the difficulty of the task.',
      long: "Hard architectural questions deserve heavy thinking; one-line refactors don't. Exposing the effort dial saves both tokens and wall-clock time on the easy cases while keeping headroom for the hard ones.",
    },
  },
  {
    id: 'switch-model-mid-session',
    label: 'Switch model mid-session',
    category: 'integrations',
    shortDescription: 'Change the underlying LLM at any point during a discussion.',
    longDescription:
      'Pick a different model in the middle of a running discussion. Cross-vendor switches that require spinning up a new session (ideally seeded with a summary of the previous one to preserve continuity) still count as supported — vendor SDKs are usually too different for an in-place swap.',
    whyImportant: {
      short: 'Mid-session model switches let you pick the best model for each phase without restarting.',
      long: 'Planning, implementation, and review often want different models. Switching in place — even via a context-preserving re-seed — beats abandoning the session every time the right model changes.',
    },
  },
  {
    id: 'open-in-ide',
    label: 'Open in IDE / external app',
    category: 'integrations',
    shortDescription: 'Open the worktree in an IDE or external app — including user-defined custom apps.',
    longDescription:
      'Launch the current worktree in an IDE / editor / app. Covers which apps ship built-in (VS Code, JetBrains, Cursor…) and whether custom apps can be configured by the user.',
    whyImportant: {
      short: 'Opening in an IDE makes the agent a starting point, not a dead end, for deeper work.',
      long: 'Some changes still need full IDE features (refactor tools, debugger, language server). Handing the worktree off in one click keeps the agent useful without locking the user into the ADE for everything.',
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
    id: 'pr-status-sync',
    label: 'GitHub PR status sync & auto-close',
    category: 'integrations',
    shortDescription: 'Track linked PR state, detect merge, allow manual merge, auto-archive the worktree on merge.',
    whyImportant: {
      short: "PR state sync keeps the workspace list aligned with what's actually shipped, instead of accumulating stale entries.",
      long: 'Once a PR is merged, the local worktree should usually be archived. Detecting that automatically — and letting the user merge from the ADE — removes a manual housekeeping step the moment work leaves the orchestrator for review.',
    },
  },
  {
    id: 'github-comment-sync',
    label: 'One-way GitHub comment sync (PR → in-app)',
    category: 'integrations',
    shortDescription: 'Surface GitHub PR review comments inside the in-app changes / diff panel (one-way ingestion).',
    longDescription:
      'GitHub PR review comments are pulled into the orchestrator’s in-app changes panel so the user (and the agent) can read and react to them without leaving the app. This is intentionally a one-way flow — the reverse direction (pushing in-app comments back to GitHub) is out of scope of this row.',
    whyImportant: {
      short: 'Pulling PR comments inline keeps review feedback in the same place as the code.',
      long: 'Hopping between GitHub and the ADE to triage review comments is slow and error-prone. Surfacing them next to the diff lets the user (and the agent) act on each one without leaving the orchestrator.',
    },
  },

  // ─────────────────────── observability ───────────────────────
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
    id: 'context-fill-indicator',
    label: 'Context usage indicator',
    category: 'observability',
    shortDescription: 'Visualize the current context window fill ratio in the ongoing discussion.',
    whyImportant: {
      short: 'A context gauge warns you before the agent silently truncates or compacts the conversation.',
      long: 'Sessions that exceed the model window degrade quietly: summarization loses fidelity, older instructions get dropped. Seeing the fill ratio lets you stop, branch, or hand off proactively instead of debugging a confused agent later.',
    },
  },
  {
    id: 'sound-notifications',
    label: 'Configurable sound notifications',
    category: 'observability',
    shortDescription: 'Configure sound alerts for key agent events (idle, awaiting input, task done…).',
    whyImportant: {
      short: 'Sound cues free you to look away while keeping you aware of agent state.',
      long: 'Once you trust an agent to run for minutes, watching the screen is wasteful. Audible alerts on key transitions (idle, awaiting input, done) let you multitask without missing the moment the agent needs you.',
    },
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

  // ─────────────────────── collaboration ───────────────────────
  {
    id: 'remote-plan-collaboration',
    label: 'Remote plan collaboration',
    category: 'collaboration',
    shortDescription: 'Share planning artifacts remotely with teammates for async review and annotation.',
    longDescription:
      'A first-class way to publish or share a plan / session artifact with teammates so they can review, comment, or annotate remotely, without needing direct access to the local worktree.',
    whyImportant: {
      short: 'Sharing plans remotely lets teammates review direction before any code is written.',
      long: 'Plans benefit from a second pair of eyes long before they become a PR. A shareable surface for asynchronous review catches design mistakes early, when the cost of changing direction is still low.',
    },
  },
  {
    id: 'shared-config',
    label: 'Shared configuration with teammates',
    category: 'collaboration',
    shortDescription: 'Any mechanism to share interesting parts of the tool configuration with teammates (committed config file, registry, marketplace…).',
    longDescription:
      'As soon as the orchestrator exposes a way to share the interesting bits of its configuration with team mates — a committed config file in the repo, an OCI/marketplace registry, an organization-wide settings tier… — this row counts as "yes". A full multi-level hierarchy (user / project / project-local / org…) is a plus but not a requirement.',
    whyImportant: {
      short: 'Shared config makes good orchestrator setups team-wide instead of personal.',
      long: "Workspace hooks, run configurations, custom actions — the best ones deserve to spread. A sharing mechanism turns one developer's productivity improvement into something the whole team can opt into.",
    },
  },
  {
    id: 'shared-discussion-workflows',
    label: 'Share discussion workflows with teammates',
    category: 'collaboration',
    shortDescription: 'Share custom discussion workflows with team mates (export/import, git-tracked, registry…).',
    longDescription:
      'Distribute authored discussion workflows to team mates — via a shared repository, an in-app registry, or import/export files — so a whole team can run the same deterministic agent playbooks.',
    whyImportant: {
      short: 'Shared workflows make team-defined processes reproducible across engineers.',
      long: "A custom workflow that lives only on its author's machine isn't a process — it's a habit. Distributing it via a repo, registry, or import file makes the same agent playbook available to everyone.",
    },
  },

  // ───────────────────────── platform ─────────────────────────
  {
    id: 'remote-agent-execution',
    label: 'Remote agent execution',
    category: 'platform',
    shortDescription: 'The orchestrator runs agents in a remote environment, not locally.',
    whyImportant: {
      short: 'Remote agent execution lets long-running agents work while your laptop is closed.',
      long: "Tasks that take hours, run on weak hardware, or depend on remote-only resources benefit from running off the local machine. Remote agent execution also unlocks parallelism a single developer machine couldn't sustain.",
    },
  },
  {
    id: 'local-execution',
    label: 'Local execution',
    category: 'platform',
    status: 'waiting-for-review',
    shortDescription: 'Agents run on the developer machine.',
    whyImportant: {
      short: 'Local execution keeps code and data on the developer machine when policy or speed requires it.',
      long: "Some codebases can't leave the laptop — sensitive IP, strict data residency, offline development. Local execution keeps the orchestrator usable in those settings, at the cost of giving up cloud-only conveniences.",
    },
  },
  {
    id: 'self-hosted',
    label: 'Self-hosted',
    category: 'platform',
    status: 'waiting-for-review',
    shortDescription: 'Can be deployed on your own infrastructure.',
    whyImportant: {
      short: "Self-hosting puts code, data, and execution under the organization's control.",
      long: 'Regulated environments, air-gapped networks, and compliance regimes often forbid SaaS. A self-hosted deployment makes the orchestrator viable in those settings, in exchange for taking on the operational burden.',
    },
  },
  {
    id: 'plugin-system',
    label: 'Plugin system',
    category: 'platform',
    shortDescription: 'Extend the orchestrator with third-party or user-authored plugins.',
    whyImportant: {
      short: "A plugin system lets the community fill gaps the core product can't ship fast enough.",
      long: 'Niche integrations and team-specific surfaces grow faster than any vendor roadmap. A real plugin system turns those needs into addressable extensions instead of feature requests stuck in a backlog.',
    },
  },
  {
    id: 'remote-session-control',
    label: 'Remote ADE control',
    category: 'platform',
    shortDescription: 'Drive the ADE itself remotely from another device, not merely the underlying coding agent.',
    longDescription:
      'Remote control of the Agent Development Environment as a product surface — e.g. open the ADE from a phone, inspect sessions, send prompts, approve actions, or manage runs. Remote-control features provided solely by an embedded coding agent do not count unless the ADE exposes and owns the remote control surface.',
    whyImportant: {
      short: 'Remote ADE control lets you supervise agents from any device, not just your dev box.',
      long: "Long-running agents need only occasional human attention — approving an action, redirecting after a tool call. Being able to do that from a phone or another machine means you don't have to stay tethered to the original session.",
    },
  },
];

export const FEATURES: readonly Feature[] = z.array(FeatureSchema).parse(features);
