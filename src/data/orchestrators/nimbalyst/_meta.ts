import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'nimbalyst',
  toolName: 'Nimbalyst',
  homepage: 'https://nimbalyst.com/',
  vendor: 'Nimbalyst',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://nimbalyst.com/',
    sourceExtract:
      'The individual plan is free with no feature limits and no trial period; MIT-licensed desktop app distributed via GitHub Releases.',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/Nimbalyst/nimbalyst/blob/main/LICENSE',
    sourceExtract: 'MIT License',
  },
  modelIntegrations: [
    {
      vendor: 'Anthropic (Claude Code)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://nimbalyst.com/features/',
      sourceExtract:
        'The individual plan includes the full workspace, all seven editors, session management, Claude Code and Codex integration, MCP support, file link sharing, git management, and worktrees.',
    },
    {
      vendor: 'OpenAI (Codex)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://nimbalyst.com/features/',
      sourceExtract:
        'session management, Claude Code and Codex integration, MCP support.',
    },
    {
      vendor: 'OpenCode',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/Nimbalyst/nimbalyst',
      sourceExtract: 'Supported Agents: Codex, Claude Code, Opencode (alpha), Copilot (alpha)',
    },
    {
      vendor: 'GitHub (Copilot)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/Nimbalyst/nimbalyst',
      sourceExtract: 'Supported Agents: Codex, Claude Code, Opencode (alpha), Copilot (alpha)',
    },
    {
      vendor: 'MCP',
      kind: 'mcp',
      sourceUrl: 'https://nimbalyst.com/features/',
      sourceExtract: 'Claude Code and Codex integration, MCP support, file link sharing, git management, and worktrees.',
    },
  ],
  platforms: ['macos', 'windows', 'linux'],
  platformSources: {
    macos: {
      sourceUrl: 'https://nimbalyst.com/',
      sourceExtract:
        'Nimbalyst is a desktop application available for macOS (Apple Silicon and Intel), Windows, and Linux.',
    },
    windows: {
      sourceUrl: 'https://nimbalyst.com/',
      sourceExtract:
        'Nimbalyst is a desktop application available for macOS (Apple Silicon and Intel), Windows, and Linux.',
    },
    linux: {
      sourceUrl: 'https://nimbalyst.com/',
      sourceExtract:
        'Nimbalyst is a desktop application available for macOS (Apple Silicon and Intel), Windows, and Linux.',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'Homepage', url: 'https://nimbalyst.com/' },
    { kind: 'docs', label: 'Documentation', url: 'https://docs.nimbalyst.com/' },
    { kind: 'blog', label: 'Nimbalyst blog', url: 'https://nimbalyst.com/blog/' },
    { kind: 'other', label: 'Features', url: 'https://nimbalyst.com/features/' },
    { kind: 'other', label: 'GitHub repository', url: 'https://github.com/Nimbalyst/nimbalyst' },
    { kind: 'github-releases', label: 'GitHub Releases', url: 'https://github.com/Nimbalyst/nimbalyst/releases' },
    { kind: 'discord', label: 'Nimbalyst Discord', url: 'https://discord.gg/FgD9S2MCYB' },
  ],
};
