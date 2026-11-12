import type { OrchestratorMeta } from '../../version-diff';

const SOURCE = 'https://github.com/madeinorbit/podium/blob/33af45509cbcf32b5eb4553966386f67290c7063';

export const META: OrchestratorMeta = {
  toolId: 'podium',
  toolName: 'Podium',
  homepage: 'https://podium.do/',
  vendor: 'Podium contributors',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: `${SOURCE}/README.md`,
    sourceExtract: '[Apache License 2.0](LICENSE).',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: `${SOURCE}/README.md`,
    sourceExtract: 'An open-source agent development environment.',
  },
  platforms: ['macos', 'linux', 'web'],
  platformSources: {
    macos: {
      sourceUrl: `${SOURCE}/README.md`,
      sourceExtract: 'macOS is supported on Apple silicon and Intel',
    },
    linux: {
      sourceUrl: `${SOURCE}/README.md`,
      sourceExtract: 'Install the headless server on Linux x86_64 or ARM64',
    },
    web: {
      sourceUrl: `${SOURCE}/README.md`,
      sourceExtract: 'Reconnect from your desktop, browser, or phone.',
    },
  },
  notes:
    'Uses installed coding agents and their own accounts. Linux desktop is preview. Windows installers are experimental, so Windows is not listed as a supported platform.',
  modelIntegrations: [
    {
      vendor: 'Anthropic (Claude Code)',
      kind: 'cli-subprocess',
      notes: 'Native Claude Code terminal sessions; an optional Claude Agent SDK driver also exists.',
      sourceUrl: `${SOURCE}/packages/harness/src/adapters/claude-code/index.ts`,
      sourceExtract: "driverId: 'generic-pty'",
    },
    {
      vendor: 'OpenAI (Codex)',
      kind: 'app-server-jsonrpc',
      notes: 'Version-gated Codex app-server driver, with native terminal fallback.',
      sourceUrl: `${SOURCE}/packages/harness/src/adapters/codex/index.ts`,
      sourceExtract: "spawn: ['codex', 'app-server']",
    },
    {
      vendor: 'xAI (Grok)',
      kind: 'acp',
      notes: 'Grok ACP over stdio is available alongside native terminal execution.',
      sourceUrl: `${SOURCE}/packages/harness/src/adapters/grok/index.ts`,
      sourceExtract: "driverId: 'grok-acp'",
    },
    {
      vendor: 'OpenCode',
      kind: 'other',
      notes: 'Local OpenCode HTTP/SSE server driver or native CLI; providers are configured in OpenCode.',
      sourceUrl: `${SOURCE}/packages/harness/src/adapters/opencode/index.ts`,
      sourceExtract: "kind: 'http-sse'",
    },
    {
      vendor: 'Cursor',
      kind: 'cli-subprocess',
      notes: 'Native cursor-agent terminal sessions.',
      sourceUrl: `${SOURCE}/packages/harness/src/adapters/cursor/index.ts`,
      sourceExtract: "driverId: 'generic-pty'",
    },
  ],
  trackingSources: [
    { kind: 'other', label: 'Homepage', url: 'https://podium.do/' },
    { kind: 'docs', label: 'Documentation', url: 'https://podium.do/docs' },
    {
      kind: 'docs',
      label: 'Feature availability and experimental features',
      url: 'https://podium.do/docs/reference/feature-availability',
    },
    { kind: 'other', label: 'Source repository', url: 'https://github.com/madeinorbit/podium' },
    { kind: 'github-releases', label: 'Releases', url: 'https://github.com/madeinorbit/podium/releases' },
    { kind: 'github-commits', label: 'Commits', url: 'https://github.com/madeinorbit/podium/commits/main' },
  ],
};
