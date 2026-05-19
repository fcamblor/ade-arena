import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'vibe-kanban',
  toolName: 'Vibe Kanban',
  homepage: 'https://www.vibekanban.com',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://github.com/BloopAI/vibe-kanban',
    sourceExtract: 'Apache-2.0 license.',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/BloopAI/vibe-kanban',
    sourceExtract: 'Apache-2.0 license.',
  },
  platforms: ['macos', 'windows', 'linux'],
  platformSources: {
    macos: {
      sourceUrl: 'https://github.com/BloopAI/vibe-kanban/releases/tag/v0.1.44-20260424091429',
      sourceExtract:
        'Release assets include `Vibe.Kanban_0.1.44_aarch64.dmg` and `Vibe.Kanban_0.1.44_x64.dmg` macOS installers.',
    },
    windows: {
      sourceUrl: 'https://github.com/BloopAI/vibe-kanban/releases/tag/v0.1.44-20260424091429',
      sourceExtract:
        'Release assets include `Vibe-Kanban-0.1.44-aarch64.msi`, `Vibe-Kanban-0.1.44-x86_64.msi`, `Vibe.Kanban_0.1.44_arm64-setup.exe` and `Vibe.Kanban_0.1.44_x64-setup.exe` Windows installers.',
    },
    linux: {
      sourceUrl: 'https://github.com/BloopAI/vibe-kanban/releases/tag/v0.1.44-20260424091429',
      sourceExtract:
        'Release assets include `Vibe.Kanban_0.1.44_amd64.deb`, `Vibe.Kanban_0.1.44_arm64.deb`, `Vibe.Kanban_0.1.44_amd64.AppImage` and `Vibe.Kanban_0.1.44_aarch64.AppImage` Linux packages.',
    },
  },
  misc: {
    message: 'The company behind Vibe Kanban announced its shutdown.',
    sourceUrl: 'https://vibekanban.com/blog/shutdown',
  },
  modelIntegrations: [
    {
      vendor: 'Multi-vendor',
      kind: 'cli-subprocess',
      notes:
        'Wraps 10+ coding-agent CLIs as subprocesses — Claude Code, Codex, Gemini CLI, GitHub Copilot, Amp, Cursor, OpenCode, Droid, Claude Code Router, Qwen Code. Each must be installed and authenticated locally before use.',
      sourceUrl: 'https://vibekanban.com/docs/supported-coding-agents',
      sourceExtract:
        'Vibe Kanban integrates with a variety of coding agents […]. Each agent requires installation and authentication before use.',
    },
  ],
  trackingSources: [
    {
      kind: 'github-releases',
      label: 'vibe-kanban GitHub releases',
      url: 'https://github.com/BloopAI/vibe-kanban/releases',
    },
    {
      kind: 'github-commits',
      label: 'vibe-kanban main commits',
      url: 'https://github.com/BloopAI/vibe-kanban/commits/main',
    },
    {
      kind: 'docs',
      label: 'Vibe Kanban documentation',
      url: 'https://vibekanban.com/docs/getting-started',
    },
    {
      kind: 'blog',
      label: 'Vibe Kanban blog',
      url: 'https://vibekanban.com/blog/shutdown',
      notes: 'Only the shutdown announcement is currently linked; no public blog index found.',
    },
  ],
};
