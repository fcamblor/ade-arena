import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'jetbrains-air',
  toolName: 'JetBrains Air',
  homepage: 'https://air.dev/',
  vendor: 'JetBrains',
  pricing: 'freemium',
  pricingSource: {
    sourceUrl: 'https://air.dev/',
    sourceExtract:
      'Included for JetBrains AI Pro / Ultimate subscribers at no additional cost. BYOK option: direct payment to providers (Anthropic, OpenAI, Google) at standard rates.',
  },
  codebase: 'proprietary',
  modelIntegrations: [
    {
      vendor: 'JetBrains (Junie)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://air.dev/',
      sourceExtract: 'Claude Agent (Anthropic) • Codex (OpenAI) • Gemini CLI (Google) • Junie (JetBrains)',
    },
    {
      vendor: 'Anthropic (Claude Agent)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://air.dev/',
      sourceExtract: 'Claude Agent (Anthropic) • Codex (OpenAI) • Gemini CLI (Google) • Junie (JetBrains)',
    },
    {
      vendor: 'OpenAI (Codex)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://air.dev/',
      sourceExtract: 'Claude Agent (Anthropic) • Codex (OpenAI) • Gemini CLI (Google) • Junie (JetBrains)',
    },
    {
      vendor: 'Google (Gemini CLI)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://air.dev/',
      sourceExtract: 'Claude Agent (Anthropic) • Codex (OpenAI) • Gemini CLI (Google) • Junie (JetBrains)',
    },
    {
      vendor: 'ACP Agent Registry',
      kind: 'acp',
      sourceUrl: 'https://blog.jetbrains.com/air/2026/03/air-launches-as-public-preview-a-new-wave-of-dev-tooling-built-on-26-years-of-experience/',
      sourceExtract:
        'Air supports the Agent Client Protocol (ACP) and will soon add support for other agents available via ACP through the ACP Agent Registry.',
    },
  ],
  platforms: ['macos'],
  platformSources: {
    macos: {
      sourceUrl: 'https://air.dev/',
      sourceExtract: 'macOS: currently available. Windows: COMING SOON. Linux: COMING SOON.',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'Homepage', url: 'https://air.dev/' },
    { kind: 'docs', label: 'JetBrains Air documentation', url: 'https://www.jetbrains.com/help/air/' },
    { kind: 'changelog', label: 'JetBrains Air changelog', url: 'https://air.dev/changelog' },
    {
      kind: 'blog',
      label: 'The Air Blog',
      url: 'https://blog.jetbrains.com/air/',
    },
    { kind: 'twitter', label: '@getsome_air on X', url: 'https://x.com/getsome_air' },
  ],
};
