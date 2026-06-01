import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'emdash',
  toolName: 'Emdash',
  homepage: 'https://www.emdash.sh/',
  vendor: 'Emdash (YC W26)',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://www.emdash.sh/docs',
    sourceExtract:
      'Emdash is open source and part of Y Combinator. Available for macOS, Windows, and Linux.',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/generalaction/emdash',
    sourceExtract:
      "Apache-2.0 license. 'Emdash is the Open-Source Agentic Development Environment (YC W26).'",
  },
  // No modelRestriction: emdash is provider-agnostic and drives 27+ agent CLIs
  // (BYOK). Model breadth is captured in the multiple-model-families row.
  modelIntegrations: [
    {
      vendor: 'Multiple (27+ CLI agents)',
      kind: 'cli-subprocess',
      notes:
        'Provider-agnostic: launches each vendor CLI (Claude Code, Codex, Gemini, OpenCode, Amp, Cursor, Copilot…) as a subprocess inside the task worktree.',
      sourceUrl: 'https://www.emdash.sh/docs/providers',
      sourceExtract: 'Emdash supports 28 coding agent CLIs.',
    },
  ],
  platforms: ['macos', 'windows', 'linux'],
  platformSources: {
    macos: {
      sourceUrl: 'https://github.com/generalaction/emdash/blob/main/README.md',
      sourceExtract: 'macOS - Homebrew: brew install --cask emdash',
    },
    windows: {
      sourceUrl: 'https://github.com/generalaction/emdash/blob/main/README.md',
      sourceExtract: 'Windows - Installer (x64): https://releases.emdash.sh/emdash-x64.msi',
    },
    linux: {
      sourceUrl: 'https://github.com/generalaction/emdash/blob/main/README.md',
      sourceExtract: 'Linux - AppImage (x64): https://releases.emdash.sh/emdash-x86_64.AppImage',
    },
  },
  trackingSources: [
    {
      kind: 'docs',
      label: 'Emdash documentation',
      url: 'https://www.emdash.sh/docs',
    },
    {
      kind: 'changelog',
      label: 'Emdash changelog',
      url: 'https://www.emdash.sh/changelog',
      notes: 'Lags slightly behind GitHub Releases (site changelog newest entry trailed the latest tag at research time).',
    },
    {
      kind: 'blog',
      label: 'Emdash blog',
      url: 'https://www.emdash.sh/blog',
    },
    {
      kind: 'rss',
      label: 'Emdash blog RSS feed',
      url: 'https://www.emdash.sh/blog/rss.xml',
    },
    {
      kind: 'github-releases',
      label: 'generalaction/emdash GitHub releases',
      url: 'https://github.com/generalaction/emdash/releases',
      notes: 'Authoritative source for the latest version — ahead of the website changelog.',
    },
    {
      kind: 'github-commits',
      label: 'generalaction/emdash commits (main)',
      url: 'https://github.com/generalaction/emdash/commits/main',
    },
    {
      kind: 'rss',
      label: 'GitHub releases Atom feed',
      url: 'https://github.com/generalaction/emdash/releases.atom',
    },
    {
      kind: 'twitter',
      label: 'X / @emdashsh',
      url: 'https://x.com/emdashsh',
      notes: "Correct handle is 'emdashsh'; 'x.com/emdash' is an unrelated account.",
    },
    {
      kind: 'discord',
      label: 'Emdash Discord',
      url: 'https://discord.gg/f2fv7YxuR2',
    },
    {
      kind: 'other',
      label: 'Show HN: Emdash announcement thread',
      url: 'https://news.ycombinator.com/item?id=47140322',
    },
    {
      kind: 'other',
      label: 'Y Combinator company page (W26)',
      url: 'https://www.ycombinator.com/companies/emdash',
    },
  ],
};
