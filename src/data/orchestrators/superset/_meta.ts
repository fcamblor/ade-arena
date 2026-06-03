import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'superset',
  toolName: 'Superset',
  homepage: 'https://superset.sh/',
  vendor: 'Superset Inc.',
  pricing: 'freemium',
  pricingSource: {
    sourceUrl: 'https://superset.sh/pricing',
    sourceExtract:
      'Free $0 — Free for everyone. Pro $15 per user/month. Enterprise — Custom pricing.',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/superset-sh/superset/blob/main/LICENSE.md',
    sourceExtract: 'Elastic License 2.0 (ELv2) — source-available public repository.',
  },
  platforms: ['macos'],
  platformSources: {
    macos: {
      sourceUrl: 'https://docs.superset.sh/',
      sourceExtract: 'macOS (Apple Silicon or Intel) — Windows and Linux coming soon',
    },
  },
  trackingSources: [
    {
      kind: 'other',
      label: 'Superset homepage',
      url: 'https://superset.sh/',
    },
    {
      kind: 'docs',
      label: 'Superset documentation',
      url: 'https://docs.superset.sh/',
    },
    {
      kind: 'changelog',
      label: 'Superset changelog',
      url: 'https://superset.sh/changelog',
    },
    {
      kind: 'blog',
      label: 'Superset blog',
      url: 'https://superset.sh/blog',
    },
    {
      kind: 'github-releases',
      label: 'Superset GitHub releases',
      url: 'https://github.com/superset-sh/superset/releases',
    },
    {
      kind: 'github-commits',
      label: 'superset-sh/superset repository',
      url: 'https://github.com/superset-sh/superset',
    },
    {
      kind: 'rss',
      label: 'GitHub releases Atom feed',
      url: 'https://github.com/superset-sh/superset/releases.atom',
      notes: 'Most reliable automatable release-tracking source; no first-party RSS feed found.',
    },
    {
      kind: 'discord',
      label: 'Superset Discord',
      url: 'https://discord.gg/cZeD9WYcV7',
    },
    {
      kind: 'twitter',
      label: 'X @superset_sh',
      url: 'https://x.com/superset_sh',
    },
    {
      kind: 'youtube',
      label: 'YouTube @superset-sh',
      url: 'https://www.youtube.com/@superset-sh',
    },
  ],
};
