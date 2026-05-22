import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'antigravity',
  toolName: 'Google Antigravity',
  homepage: 'https://antigravity.google/',
  vendor: 'Google',
  pricing: 'freemium',
  pricingSource: {
    sourceUrl: 'https://www.antigravity.google/blog/changes-to-antigravity-plans',
    sourceExtract:
      'We are now introducing a new $100/month Google AI Ultra plan… and reducing the price of our top-tier AI Ultra plan from $250 to $200 per month.',
  },
  codebase: 'proprietary',
  codebaseSource: {
    sourceUrl: 'https://www.antigravity.google/blog/introducing-google-antigravity-2-0',
    sourceExtract:
      'Google Antigravity 2.0 is a new, standalone desktop application… available on macOS, Linux, and Windows (download here).',
  },
  modelIntegrations: [
    {
      vendor: 'Google',
      kind: 'provider-sdk',
      sourceUrl: 'https://www.antigravity.google/blog/introducing-google-antigravity-2-0',
      sourceExtract:
        'powered by the latest Gemini models, and orchestrates agents capable of completing complex tasks.',
    },
    {
      vendor: 'Anthropic',
      kind: 'provider-sdk',
      sourceUrl: 'https://www.antigravity.google/pricing',
      sourceExtract:
        'Agent model: access to Gemini 3.5 Flash, Gemini 3.1 Pro, Gemini 3 Flash, Claude Sonnet & Opus 4.6, gpt-oss-120b',
    },
    {
      vendor: 'OpenAI',
      kind: 'provider-sdk',
      sourceUrl: 'https://www.antigravity.google/pricing',
      sourceExtract:
        'Agent model: access to Gemini 3.5 Flash, Gemini 3.1 Pro, Gemini 3 Flash, Claude Sonnet & Opus 4.6, gpt-oss-120b',
    },
  ],
  platforms: ['macos', 'windows', 'linux'],
  platformSources: {
    macos: {
      sourceUrl: 'https://www.antigravity.google/blog/introducing-google-antigravity-2-0',
      sourceExtract:
        'Google Antigravity 2.0 is a new, standalone desktop application… available on macOS, Linux, and Windows.',
    },
    windows: {
      sourceUrl: 'https://www.antigravity.google/blog/introducing-google-antigravity-2-0',
      sourceExtract:
        'Google Antigravity 2.0 is a new, standalone desktop application… available on macOS, Linux, and Windows.',
    },
    linux: {
      sourceUrl: 'https://www.antigravity.google/blog/introducing-google-antigravity-2-0',
      sourceExtract:
        'Google Antigravity 2.0 is a new, standalone desktop application… available on macOS, Linux, and Windows.',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'Homepage', url: 'https://antigravity.google/' },
    { kind: 'docs', label: 'Antigravity Docs', url: 'https://antigravity.google/docs' },
    { kind: 'changelog', label: 'Antigravity Changelog', url: 'https://antigravity.google/changelog' },
    { kind: 'blog', label: 'Antigravity Blog', url: 'https://antigravity.google/blog' },
    {
      kind: 'release-notes',
      label: 'Antigravity 2.0 Launch Post',
      url: 'https://www.antigravity.google/blog/introducing-google-antigravity-2-0',
    },
    { kind: 'other', label: 'Pricing & Plans', url: 'https://antigravity.google/pricing' },
    { kind: 'twitter', label: '@antigravity on X', url: 'https://x.com/antigravity' },
    {
      kind: 'discord',
      label: 'Antigravity community on discuss.ai.google.dev',
      url: 'https://discuss.ai.google.dev/c/antigravity/64',
    },
    { kind: 'youtube', label: 'Google Antigravity on YouTube', url: 'https://www.youtube.com/@GoogleAntigravity' },
    {
      kind: 'github-releases',
      label: 'Antigravity SDK Python (GitHub)',
      url: 'https://github.com/google-antigravity/antigravity-sdk-python',
    },
  ],
};
