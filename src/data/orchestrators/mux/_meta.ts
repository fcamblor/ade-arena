import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'mux',
  toolName: 'mux (Coder)',
  homepage: 'https://mux.coder.com/',
  vendor: 'Coder Technologies, Inc.',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://github.com/coder/mux/blob/main/LICENSE',
    sourceExtract: 'GNU Affero General Public License v3.0',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/coder/mux/blob/main/LICENSE',
    sourceExtract: 'AGPL-3.0',
  },
  modelIntegrations: [
    {
      vendor: 'Anthropic',
      kind: 'provider-sdk',
      sourceUrl: 'https://github.com/coder/mux',
      sourceExtract: 'Multi-model support includes: `sonnet-4-*`, `grok-*`, `gpt-5-*`, `opus-4-*`',
    },
    {
      vendor: 'OpenAI',
      kind: 'provider-sdk',
      sourceUrl: 'https://github.com/coder/mux',
      sourceExtract: 'Multi-model support includes: `sonnet-4-*`, `grok-*`, `gpt-5-*`, `opus-4-*`',
    },
    {
      vendor: 'xAI (Grok)',
      kind: 'provider-sdk',
      sourceUrl: 'https://github.com/coder/mux',
      sourceExtract: 'Multi-model support includes: `sonnet-4-*`, `grok-*`, `gpt-5-*`, `opus-4-*`',
    },
    {
      vendor: 'Ollama',
      kind: 'openai-compatible-api',
      sourceUrl: 'https://github.com/coder/mux',
      sourceExtract: 'Ollama supported for local LLMs',
    },
    {
      vendor: 'OpenRouter',
      kind: 'openai-compatible-api',
      sourceUrl: 'https://github.com/coder/mux',
      sourceExtract: 'OpenRouter supported for long-tail of LLMs',
    },
  ],
  platforms: ['macos', 'linux', 'web'],
  platformSources: {
    macos: {
      sourceUrl: 'https://github.com/coder/mux',
      sourceExtract: 'macOS and Linux pre-built binaries available',
    },
    linux: {
      sourceUrl: 'https://github.com/coder/mux',
      sourceExtract: 'macOS and Linux pre-built binaries available',
    },
    web: {
      sourceUrl: 'https://github.com/coder/mux',
      sourceExtract:
        'A desktop & browser application for parallel agentic development. Browser-based application also available; mobile responsive UI via server mode.',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'Homepage / Documentation', url: 'https://mux.coder.com/' },
    { kind: 'other', label: 'GitHub repository', url: 'https://github.com/coder/mux' },
    { kind: 'github-releases', label: 'GitHub Releases', url: 'https://github.com/coder/mux/releases' },
    { kind: 'discord', label: 'Coder Discord', url: 'https://discord.gg/thkEdtwm8c' },
  ],
};
