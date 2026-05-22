import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'openducktor',
  toolName: 'OpenDucktor',
  homepage: 'https://github.com/Maxsky5/openducktor',
  vendor: 'Maxsky5',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://github.com/Maxsky5/openducktor/blob/main/LICENSE',
    sourceExtract: 'This repository is licensed under the Apache License 2.0.',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://api.github.com/repos/Maxsky5/openducktor',
    sourceExtract: '"license":{"key":"apache-2.0","name":"Apache License 2.0","spdx_id":"Apache-2.0"}',
  },
  modelIntegrations: [
    {
      vendor: 'OpenCode',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/Maxsky5/openducktor#readme',
      sourceExtract:
        'OpenDucktor supports local OpenCode and Codex runtimes. OpenCode remains the default runtime.',
    },
    {
      vendor: 'OpenAI (Codex CLI)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/Maxsky5/openducktor#readme',
      sourceExtract: 'Supported runtimes today: OpenCode (`opencode`) and Codex (`codex`)',
    },
    {
      vendor: 'MCP (OpenDucktor MCP server)',
      kind: 'mcp',
      sourceUrl: 'https://github.com/Maxsky5/openducktor#readme',
      sourceExtract:
        'A built-in OpenDucktor MCP server used internally by managed agent sessions and available externally through `@openducktor/mcp`.',
    },
  ],
  platforms: ['macos', 'windows', 'linux', 'web'],
  platformSources: {
    macos: {
      sourceUrl: 'https://github.com/Maxsky5/openducktor/releases/tag/v0.3.1',
      sourceExtract: 'Assets: OpenDucktor_0.3.1_aarch64.dmg, OpenDucktor_0.3.1_x64.dmg (macOS builds)',
    },
    windows: {
      sourceUrl: 'https://github.com/Maxsky5/openducktor#readme',
      sourceExtract:
        'Platform support today: macOS is the primary supported desktop target. Windows and Linux: experimental Electron desktop builds.',
    },
    linux: {
      sourceUrl: 'https://github.com/Maxsky5/openducktor#readme',
      sourceExtract:
        'Platform support today: macOS is the primary supported desktop target. Windows and Linux: experimental Electron desktop builds.',
    },
    web: {
      sourceUrl: 'https://github.com/Maxsky5/openducktor#readme',
      sourceExtract:
        'Local Web Runner (macOS, Linux & Windows) — bunx @openducktor/web — The web runner opens OpenDucktor in your browser.',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'GitHub repository', url: 'https://github.com/Maxsky5/openducktor' },
    { kind: 'docs', label: 'Docs directory', url: 'https://github.com/Maxsky5/openducktor/tree/main/docs' },
    { kind: 'github-releases', label: 'GitHub Releases', url: 'https://github.com/Maxsky5/openducktor/releases' },
    { kind: 'github-commits', label: 'GitHub Commits (main)', url: 'https://github.com/Maxsky5/openducktor/commits/main' },
  ],
};
