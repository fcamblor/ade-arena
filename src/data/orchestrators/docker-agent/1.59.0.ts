import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';

const data: OrchestratorVersion = {
  toolId: 'docker-agent',
  toolName: 'Docker Agent (cagent)',
  version: '1.59.0',
  releaseDate: '2026-05-13',
  homepage: 'https://docs.docker.com/ai/docker-agent/',
  vendor: 'Docker, Inc.',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://github.com/docker/cagent',
    sourceExtract: 'Apache-2.0 license.',
  },
  platforms: ['macos', 'windows', 'linux'],
  platformSources: {
    macos: {
      sourceUrl: 'https://docs.docker.com/ai/docker-agent/',
      sourceExtract: 'Homebrew: `brew install docker-agent`.',
    },
    windows: {
      sourceUrl: 'https://docs.docker.com/ai/docker-agent/',
      sourceExtract: 'Winget: `winget install Docker.Agent`.',
    },
    linux: {
      sourceUrl: 'https://docs.docker.com/ai/docker-agent/',
      sourceExtract: 'Homebrew: `brew install docker-agent`. Pre-built binaries available from GitHub releases.',
    },
  },
  notes:
    'Docker Agent (binary: cagent) is a CLI framework for building YAML-defined teams of AI agents. It is not a parallel-task / kanban orchestrator: a single `cagent run` executes one agent (optionally delegating to sub-agents) inside the current working directory.',
  trackingSources: [
    {
      kind: 'github-releases',
      label: 'cagent GitHub releases',
      url: 'https://github.com/docker/cagent/releases',
    },
    {
      kind: 'github-commits',
      label: 'cagent main commits',
      url: 'https://github.com/docker/cagent/commits/main',
    },
    {
      kind: 'docs',
      label: 'Docker Agent docs',
      url: 'https://docs.docker.com/ai/docker-agent/',
    },
  ],
  features: [
    {
      featureId: 'sandbox-isolation',
      support: 'yes',
      note: 'Tool capabilities can be wired through Docker-based MCP servers, so external tools run inside their own container instead of on the host.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract:
        'Rich tool ecosystem — Built-in tools + any MCP server (local, remote, or Docker-based).',
    },
    {
      featureId: 'git-worktrees',
      support: 'no',
      note: 'No worktree concept; the agent runs against the directory passed via --working-dir.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract:
        '--working-dir string  Set the working directory for the session (applies to tools and relative paths).',
    },
    {
      featureId: 'cloud-execution',
      support: 'no',
      note: 'Executes locally as a CLI / standalone binary; no managed cloud runtime is offered.',
      screenshots: [],
      sourceUrl: 'https://docs.docker.com/ai/docker-agent/',
      sourceExtract:
        'Docker Agent is included in Docker Desktop 4.63 and later. Alternatively, it can be used as a standalone binary.',
    },
    {
      featureId: 'local-execution',
      support: 'yes',
      screenshots: [],
      sourceUrl: 'https://docs.docker.com/ai/docker-agent/',
      sourceExtract:
        'Docker Agent is included in Docker Desktop 4.63 and later and can be used with the `docker agent` command.',
    },
    {
      featureId: 'multi-model',
      support: 'yes',
      note: 'BYOK; the agent talks directly to the chosen provider SDK.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract:
        'AI provider agnostic — OpenAI, Anthropic, Gemini, AWS Bedrock, Mistral, xAI, Docker Model Runner, and more.',
    },
    {
      featureId: 'pr-creation',
      support: 'no',
      note: 'No built-in GitHub/GitLab PR action; an agent could shell out to `gh`, but nothing is shipped.',
      screenshots: [],
    },
    {
      featureId: 'kanban-board',
      support: 'no',
      note: 'CLI / TUI tool; no kanban surface.',
      screenshots: [],
    },
    {
      featureId: 'live-logs',
      support: 'yes',
      note: 'Streaming agent output rendered in the built-in TUI.',
      screenshots: [],
      sourceUrl: 'https://docker.github.io/docker-agent/features/tui',
      sourceExtract: '--tui  Run the agent with a Terminal User Interface (TUI) (default true).',
    },
    {
      featureId: 'diff-review',
      support: 'no',
      note: 'No built-in diff UI; file edits land directly on disk subject to tool-call approval prompts.',
      screenshots: [],
    },
    {
      featureId: 'oss',
      support: 'yes',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract: 'Apache-2.0 license.',
    },
    {
      featureId: 'free-tier',
      support: 'yes',
      note: 'The runtime itself is free; users supply their own model-provider API keys.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract:
        'Build, run, and share AI agents with a declarative YAML config, rich tool ecosystem, and multi-agent orchestration.',
    },
    {
      featureId: 'self-hosted',
      support: 'yes',
      note: 'Runs as a local CLI; an HTTP API server mode (`cagent api`) can be hosted on any machine.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract: 'cagent api <agent-file>|<agents-dir> — Start the API server that exposes the agent via an HTTP API.',
    },
    {
      featureId: 'sound-notifications',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'multi-sessions-per-worktree',
      support: 'no',
      note: 'No worktree model; each invocation is its own process.',
      screenshots: [],
    },
    {
      featureId: 'no-worktree-mode',
      support: 'yes',
      note: 'Always operates in the current directory (or --working-dir); there is no worktree layer.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract: '--working-dir string  Set the working directory for the session.',
    },
    {
      featureId: 'workflow-shell-hooks',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'run-configurations',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'worktree-port-env-vars',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'supported-assistants',
      support: 'no',
      note: 'cagent is itself an agent runtime, not a wrapper around third-party coding CLIs (Claude Code, Codex, etc.).',
      screenshots: [],
    },
    {
      featureId: 'diff-panel-files-list',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'diff-comments',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'github-comment-sync',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'terminal-in-worktree',
      support: 'no',
      note: 'cagent is itself a terminal tool — no embedded shell pane in a worktree because there is no worktree UI.',
      screenshots: [],
    },
    {
      featureId: 'open-in-ide',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'file-tree-browser',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'inline-file-editing',
      support: 'no',
      note: 'Agents can edit files via the filesystem toolset, but there is no in-app editor surface.',
      screenshots: [],
    },
    {
      featureId: 'custom-ui-actions',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'session-handoff',
      support: 'partial',
      note: 'Sessions are persisted to a SQLite-style session DB (`--session-db`) accessible through the API server, but no shared context-dir convention is documented for CLI runs.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract: '-s, --session-db string  Path to the session database (default "session.db").',
    },
    {
      featureId: 'remote-file-sharing',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'shared-config-levels',
      support: 'partial',
      note: 'Agent teams are declared in versionable YAML files and can be pushed/pulled as OCI artifacts on Docker Hub or any registry, but there is no built-in user/project/local override hierarchy.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract:
        'Package & share — Push agents to any OCI registry, pull and run them anywhere. YAML-based configuration — Declarative, versionable, and shareable agent definitions.',
    },
    {
      featureId: 'pr-status-sync',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'remote-session-control',
      support: 'partial',
      note: '`cagent api` exposes the agent over HTTP on a configurable port, which enables remote drivers, but no first-party mobile/remote client is shipped.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract: 'Start the API server that exposes the agent via an HTTP API. -l, --listen string  Address to listen on (default ":8080").',
    },
    {
      featureId: 'context-fill-indicator',
      support: 'unknown',
      screenshots: [],
    },
    {
      featureId: 'switch-model-mid-session',
      support: 'no',
      note: 'The model is pinned in the agent YAML config; switching requires editing the file and re-running.',
      screenshots: [],
      sourceUrl: 'https://docs.docker.com/ai/docker-agent/',
      sourceExtract: 'Agent configurations are YAML files with defined structure for agents, models, and instructions.',
    },
    {
      featureId: 'model-effort-support',
      support: 'unknown',
      screenshots: [],
    },
    {
      featureId: 'multi-model-integration',
      support: 'yes',
      note: 'Direct provider SDK integration plus Docker Model Runner; tools exposed via the MCP Gateway.',
      screenshots: [],
      sourceUrl: 'https://docs.docker.com/ai/docker-agent/',
      sourceExtract:
        'run these agent teams from your terminal using any LLM provider. Connect agents to external tools via the Docker MCP Gateway.',
    },
    {
      featureId: 'web-preview',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'plugin-system',
      support: 'yes',
      note: 'External tools are added by wiring MCP servers (local, remote or Docker-based) into the agent YAML.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract:
        'Rich tool ecosystem — Built-in tools + any MCP server (local, remote, or Docker-based).',
    },
    {
      featureId: 'quick-chat',
      support: 'yes',
      note: 'A one-shot prompt can be piped to any agent file without attaching the session to a repository.',
      screenshots: [],
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract: 'cagent run ./echo.yaml "INSTRUCTIONS" — echo "INSTRUCTIONS" | cagent run ./echo.yaml -.',
    },
    {
      featureId: 'mission-control',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'copy-from-origin-workspace',
      support: 'no',
      screenshots: [],
    },
    {
      featureId: 'symlink-from-origin-workspace',
      support: 'no',
      screenshots: [],
    },
  ],
};

export default OrchestratorVersionSchema.parse(data);
