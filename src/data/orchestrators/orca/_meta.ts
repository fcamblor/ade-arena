import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'orca',
  toolName: 'Orca',
  homepage: 'https://www.onorca.dev/',
  vendor: 'Stably (Lovecast Inc.), YC-backed',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://github.com/stablyai/orca',
    sourceExtract:
      "Open source (MIT License); 'Run any coding agent with your own subscription' — bring-your-own-subscription, no Orca fee.",
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/stablyai/orca',
    sourceExtract: 'MIT License. Official open-source repository (stablyai/orca), TypeScript.',
  },
  modelIntegrations: [
    {
      vendor: 'Multiple CLI agents',
      kind: 'cli-subprocess',
      notes:
        'Provider-agnostic: launches each vendor CLI (Claude Code, Codex, Gemini, Grok, Cursor CLI, GitHub Copilot, OpenCode, Antigravity…) as a subprocess. Supports any CLI agent, not just this list.',
      sourceUrl: 'https://github.com/stablyai/orca',
      sourceExtract: 'supports any CLI agent (not just this list).',
    },
  ],
  platforms: ['macos', 'windows', 'linux'],
  platformSources: {
    macos: {
      sourceUrl: 'https://www.onorca.dev/changelog',
      sourceExtract: 'Install Orca via Homebrew — brew install --cask orca',
    },
    windows: {
      sourceUrl: 'https://github.com/stablyai/orca',
      sourceExtract: 'cross-platform macOS, Windows, Linux (Windows/Linux Parity).',
    },
    linux: {
      sourceUrl: 'https://github.com/stablyai/orca',
      sourceExtract: 'cross-platform … Linux (Universal via AppImage).',
    },
  },
  trackingSources: [
    {
      kind: 'docs',
      label: 'Orca documentation',
      url: 'https://www.onorca.dev/docs',
      notes: 'Install + per-agent setup (Claude Code, Codex, Cursor CLI…).',
    },
    {
      kind: 'changelog',
      label: 'Orca changelog',
      url: 'https://www.onorca.dev/changelog',
      notes: 'Web changelog lags GitHub releases (trailed at 1.3.41 at research time).',
    },
    {
      kind: 'github-releases',
      label: 'stablyai/orca GitHub releases',
      url: 'https://github.com/stablyai/orca/releases',
      notes: 'Authoritative source for the latest version — ahead of the website changelog.',
    },
    {
      kind: 'github-commits',
      label: 'stablyai/orca commits (main)',
      url: 'https://github.com/stablyai/orca/commits/main',
    },
    {
      kind: 'rss',
      label: 'GitHub releases Atom feed',
      url: 'https://github.com/stablyai/orca/releases.atom',
    },
    {
      kind: 'rss',
      label: 'GitHub commits Atom feed',
      url: 'https://github.com/stablyai/orca/commits.atom',
    },
    {
      kind: 'twitter',
      label: 'X / @orca_build',
      url: 'https://x.com/orca_build',
    },
    {
      kind: 'discord',
      label: 'Orca Discord',
      url: 'https://discord.gg/fzjDKHxv8Q',
    },
    {
      kind: 'other',
      label: 'stablyai/orca repository',
      url: 'https://github.com/stablyai/orca',
    },
    {
      kind: 'other',
      label: 'Stably (vendor site)',
      url: 'https://stably.ai',
    },
  ],
};
