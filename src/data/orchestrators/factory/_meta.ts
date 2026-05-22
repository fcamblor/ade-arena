import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'factory',
  toolName: 'Factory',
  homepage: 'https://factory.ai/',
  vendor: 'Factory AI',
  pricing: 'paid',
  pricingSource: {
    sourceUrl: 'https://docs.factory.ai/pricing',
    sourceExtract:
      'Pro $20/mo (individuals, Factory App + Droid CLI + Droid SDK); Plus $100/mo (~5x Pro usage + Droid Computers); Max $200/mo (~10x Pro usage).',
  },
  codebase: 'proprietary',
  codebaseSource: {
    sourceUrl: 'https://github.com/Factory-AI/factory',
    sourceExtract: 'Copyright © 2025-2026 Factory AI. All rights reserved.',
  },
  modelIntegrations: [
    {
      vendor: 'Factory (Droid Core)',
      kind: 'provider-sdk',
      sourceUrl: 'https://docs.factory.ai/pricing',
      sourceExtract:
        'Droid Core: ensemble of open-weight models included at no additional cost.',
    },
    {
      vendor: 'BYOK (Anthropic, OpenAI, Google, …)',
      kind: 'provider-sdk',
      sourceUrl: 'https://docs.factory.ai/pricing',
      sourceExtract:
        'All Individual, Teams, and Enterprise plans include an allowance of free BYOK usage.',
    },
  ],
  platforms: ['macos', 'windows', 'linux', 'web'],
  platformSources: {
    macos: {
      sourceUrl: 'https://github.com/Factory-AI/factory',
      sourceExtract:
        'macOS/Linux: curl install. Desktop app grants Droids supervised access to local filesystem, browser, and command line.',
    },
    windows: {
      sourceUrl: 'https://github.com/Factory-AI/factory',
      sourceExtract: 'Windows installation via PowerShell.',
    },
    linux: {
      sourceUrl: 'https://github.com/Factory-AI/factory',
      sourceExtract: 'macOS/Linux: curl install. CLI distributed as npm package.',
    },
    web: {
      sourceUrl: 'https://factory.ai/',
      sourceExtract:
        'Web-based interface at app.factory.ai. The agent-native development platform — Works across CLI, Web, Slack/Teams, Linear/Jira and Mobile.',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'Homepage', url: 'https://factory.ai/' },
    { kind: 'docs', label: 'Factory Documentation', url: 'https://docs.factory.ai/' },
    { kind: 'changelog', label: 'Factory Changelog', url: 'https://docs.factory.ai/changelog' },
    { kind: 'other', label: 'Pricing', url: 'https://factory.ai/pricing' },
    { kind: 'other', label: 'Factory IDE product page', url: 'https://factory.ai/product/ide' },
    { kind: 'other', label: 'Factory GitHub org', url: 'https://github.com/Factory-AI' },
    { kind: 'other', label: 'Factory CLI repo', url: 'https://github.com/Factory-AI/factory' },
    { kind: 'twitter', label: '@FactoryAI on X', url: 'https://x.com/FactoryAI' },
    { kind: 'other', label: 'Factory on LinkedIn', url: 'https://www.linkedin.com/company/factory-hq/' },
  ],
};
