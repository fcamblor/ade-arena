import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'codex-app',
  toolName: 'Codex App',
  homepage: 'https://openai.com/codex/',
  vendor: 'OpenAI',
  platforms: ['macos'],
  platformSources: {
    macos: {
      sourceUrl: 'https://openai.com/codex/',
      sourceExtract: 'TODO — confirm Codex App macOS distribution channel and supported architectures.',
    },
  },
  trackingSources: [
    {
      kind: 'other',
      label: 'OpenAI Codex homepage',
      url: 'https://openai.com/codex/',
    },
    {
      kind: 'github-releases',
      label: 'openai/codex GitHub releases',
      url: 'https://github.com/openai/codex/releases',
    },
  ],
};
