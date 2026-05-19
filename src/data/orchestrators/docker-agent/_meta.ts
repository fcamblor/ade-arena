import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'docker-agent',
  toolName: 'Docker Agent (cagent)',
  homepage: 'https://docs.docker.com/ai/docker-agent/',
  vendor: 'Docker, Inc.',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://github.com/docker/cagent',
    sourceExtract: 'Apache-2.0 license.',
  },
  codebase: 'open-source',
  codebaseSource: {
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
  modelIntegrations: [
    {
      vendor: 'Multi-vendor',
      kind: 'provider-sdk',
      notes:
        'AI provider agnostic — direct SDKs for OpenAI, Anthropic, Gemini, AWS Bedrock, Mistral, xAI, Docker Model Runner, and more. External tools wired via the Docker MCP Gateway.',
      sourceUrl: 'https://github.com/docker/cagent',
      sourceExtract:
        'AI provider agnostic — OpenAI, Anthropic, Gemini, AWS Bedrock, Mistral, xAI, Docker Model Runner, and more.',
    },
    {
      vendor: '(tools)',
      kind: 'mcp',
      notes: 'Tools (not models) plug in via MCP servers — local, remote, or Docker-based.',
      sourceUrl: 'https://docs.docker.com/ai/docker-agent/',
      sourceExtract: 'Connect agents to external tools via the Docker MCP Gateway.',
    },
  ],
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
};
