import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'codex-app',
  toolName: 'Codex App',
  homepage: 'https://developers.openai.com/codex/app',
  vendor: 'OpenAI',
  pricing: 'paid',
  pricingSource: {
    sourceUrl: 'https://developers.openai.com/codex/changelog',
    sourceExtract:
      'Anyone with a ChatGPT Plus, Pro, Business, Enterprise or Edu subscription can use Codex across the CLI, web, IDE-extension and app with their ChatGPT login.',
  },
  codebase: 'proprietary',
  codebaseSource: {
    sourceUrl: 'https://developers.openai.com/codex/open-source',
    sourceExtract: 'IDE extension and Codex web: Not open source.',
  },
  modelRestriction: {
    message: 'OpenAI models only. ChatGPT login required.',
    sourceUrl: 'https://developers.openai.com/codex/changelog',
  },
  modelIntegrations: [
    {
      vendor: 'OpenAI',
      kind: 'provider-sdk',
      notes: 'Direct OpenAI integration via ChatGPT login; CLI sibling can also route through AWS Bedrock for OpenAI models.',
      sourceUrl: 'https://developers.openai.com/codex/changelog',
      sourceExtract:
        'GPT-5.5 is now available in Codex as OpenAI’s newest frontier model and is the recommended choice for most Codex tasks.',
    },
  ],
  platforms: ['macos', 'windows'],
  platformSources: {
    macos: {
      sourceUrl: 'https://developers.openai.com/codex/app',
      sourceExtract:
        'The Codex app runs on macOS and Intel-based Macs. […] Get notified for Linux.',
    },
    windows: {
      sourceUrl: 'https://developers.openai.com/codex/concepts/sandboxing',
      sourceExtract:
        'On Windows, Codex uses the native Windows sandbox when you run in PowerShell and the Linux sandbox implementation when you run in WSL2.',
    },
  },
  trackingSources: [
    {
      kind: 'docs',
      label: 'Codex App documentation',
      url: 'https://developers.openai.com/codex/app',
    },
    {
      kind: 'changelog',
      label: 'Codex changelog',
      url: 'https://developers.openai.com/codex/changelog',
    },
    {
      kind: 'blog',
      label: 'OpenAI news — Codex tag',
      url: 'https://openai.com/news/?tags=codex',
    },
    {
      kind: 'github-releases',
      label: 'openai/codex GitHub releases (CLI sibling)',
      url: 'https://github.com/openai/codex/releases',
    },
  ],
};
