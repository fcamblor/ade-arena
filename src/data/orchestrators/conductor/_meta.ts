import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'conductor',
  toolName: 'Conductor',
  homepage: 'https://conductor.build',
  vendor: 'Melty Labs',
  pricing: 'free',
  pricingSource: {
    sourceUrl: 'https://www.conductor.build/docs/faq',
    sourceExtract:
      "At some point we plan to charge for collaboration features that help teams make the most of AI agents, but for now we're focused on making Conductor an amazing free tool.",
  },
  codebase: 'proprietary',
  platforms: ['macos'],
  platformSources: {
    macos: {
      sourceUrl: 'https://www.conductor.build/docs/installation',
      sourceExtract:
        'Conductor is available for macOS. […] Conductor is not available for Windows or Linux yet.',
    },
  },
  modelRestriction: {
    message: 'Only Claude Code and Codex agents are supported.',
    sourceUrl: 'https://www.conductor.build/docs/concepts/agent-modes',
  },
  modelIntegrations: [
    {
      vendor: 'Anthropic',
      kind: 'cli-subprocess',
      notes: 'Wraps the Claude Code CLI as a subprocess; auth delegated to the underlying CLI (subscription or API key).',
      sourceUrl: 'https://www.conductor.build/docs/concepts/agent-modes',
      sourceExtract: 'Use Claude Code or Codex when you want a coding agent in a Conductor workspace.',
    },
    {
      vendor: 'OpenAI',
      kind: 'cli-subprocess',
      notes: 'Wraps the Codex CLI as a subprocess; auth delegated to the underlying CLI.',
      sourceUrl: 'https://www.conductor.build/docs/concepts/agent-modes',
      sourceExtract: 'Use Claude Code or Codex when you want a coding agent in a Conductor workspace.',
    },
  ],
  trackingSources: [
    {
      kind: 'changelog',
      label: 'Conductor changelog',
      url: 'https://www.conductor.build/changelog',
    },
    {
      kind: 'docs',
      label: 'Conductor documentation',
      url: 'https://www.conductor.build/docs/installation',
    },
    {
      kind: 'other',
      label: 'Conductor homepage',
      url: 'https://conductor.build',
    },
  ],
};
