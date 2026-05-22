import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'github-copilot-app',
  toolName: 'GitHub Copilot app',
  homepage: 'https://github.com/features/preview/github-app',
  vendor: 'GitHub (Microsoft)',
  pricing: 'paid',
  pricingSource: {
    sourceUrl: 'https://github.blog/changelog/2026-05-14-github-copilot-app-is-now-available-in-technical-preview/',
    sourceExtract:
      'Pro and Pro+ subscribers join the waitlist first, Business and Enterprise tiers roll out across the week, and free plans are excluded.',
  },
  codebase: 'proprietary',
  modelIntegrations: [
    {
      vendor: 'GitHub (Copilot agent)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.blog/changelog/2026-05-14-github-copilot-app-is-now-available-in-technical-preview/',
      sourceExtract:
        'requires admin enablement of previews and Copilot CLI in policy settings. Agent Merge addresses review comments, fixes failing checks, and merges.',
    },
  ],
  platforms: ['macos', 'windows', 'linux'],
  platformSources: {
    macos: {
      sourceUrl: 'https://github.com/features/preview/github-app',
      sourceExtract:
        'The app is available now in technical preview on Windows, macOS, and Linux for paid Copilot subscribers.',
    },
    windows: {
      sourceUrl: 'https://github.com/features/preview/github-app',
      sourceExtract:
        'The app is available now in technical preview on Windows, macOS, and Linux for paid Copilot subscribers.',
    },
    linux: {
      sourceUrl: 'https://github.com/features/preview/github-app',
      sourceExtract:
        'The app is available now in technical preview on Windows, macOS, and Linux for paid Copilot subscribers.',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'GitHub Copilot app preview page', url: 'https://github.com/features/preview/github-app' },
    {
      kind: 'release-notes',
      label: 'Technical preview announcement (GitHub Changelog)',
      url: 'https://github.blog/changelog/2026-05-14-github-copilot-app-is-now-available-in-technical-preview/',
    },
    { kind: 'blog', label: 'GitHub Blog', url: 'https://github.blog/' },
    { kind: 'docs', label: 'GitHub Docs', url: 'https://docs.github.com/' },
  ],
};
