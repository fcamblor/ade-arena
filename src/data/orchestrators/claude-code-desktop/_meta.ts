import type { OrchestratorMeta } from '../../version-diff';

// Tool-level metadata shared by every version of Claude Code Desktop.
// Documentation sources collected here (homepage, platform docs, tracking
// feeds, pricing reference) can be parsed by an agent doing a full check-up
// of the orchestrator against the feature list.
export const META: OrchestratorMeta = {
  toolId: 'claude-code-desktop',
  toolName: 'Claude Code Desktop',
  homepage: 'https://claude.com/claude-code',
  vendor: 'Anthropic',
  pricing: 'paid',
  pricingSource: {
    sourceUrl: 'https://code.claude.com/docs/en/quickstart',
    sourceExtract:
      'A Claude subscription (Pro, Max, Team, or Enterprise), Claude Console account, or access through a supported cloud provider.',
  },
  codebase: 'proprietary',
  codebaseSource: {
    sourceUrl: 'https://github.com/anthropics/claude-code/blob/main/LICENSE.md',
    sourceExtract:
      "© Anthropic PBC. All rights reserved. Use is subject to Anthropic's Commercial Terms of Service.",
  },
  platforms: ['macos', 'windows'],
  platformSources: {
    macos: {
      sourceUrl: 'https://code.claude.com/docs/en/desktop',
      sourceExtract: 'Download for macOS — Universal build for Intel and Apple Silicon.',
    },
    windows: {
      sourceUrl: 'https://code.claude.com/docs/en/desktop',
      sourceExtract:
        'Download for Windows — For x64 processors. For Windows ARM64, download the ARM64 installer. […] The desktop app is not available on Linux; use the CLI instead.',
    },
  },
  modelRestriction: {
    message: 'Anthropic Claude models only (Opus / Sonnet / Haiku).',
    sourceUrl: 'https://code.claude.com/docs/en/model-config',
  },
  modelIntegrations: [
    {
      vendor: 'Anthropic',
      kind: 'provider-sdk',
      notes: 'Direct Anthropic API; also reachable via AWS Bedrock, Google Vertex AI and Azure Foundry gateways.',
      sourceUrl: 'https://code.claude.com/docs/en/model-config',
      sourceExtract:
        'Anthropic API: A full model name — Bedrock: an inference profile ARN — Foundry: a deployment name — Vertex: a version name.',
    },
  ],
  trackingSources: [
    {
      kind: 'github-releases',
      label: 'claude-code GitHub releases',
      url: 'https://github.com/anthropics/claude-code/releases',
    },
    {
      kind: 'docs',
      label: 'Claude Code docs (overview)',
      url: 'https://code.claude.com/docs/en/overview',
    },
    {
      kind: 'docs',
      label: 'Claude Code desktop docs',
      url: 'https://code.claude.com/docs/en/desktop',
    },
    {
      kind: 'other',
      label: 'Claude Code homepage',
      url: 'https://claude.com/claude-code',
    },
    {
      kind: 'twitter',
      label: 'ClaudeCodeLog on X',
      url: 'https://x.com/ClaudeCodeLog',
    },
    {
      kind: 'twitter',
      label: 'ClaudeDevs on X',
      url: 'https://x.com/ClaudeDevs',
    },
  ],
};
