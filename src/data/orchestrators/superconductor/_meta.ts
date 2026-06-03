import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'superconductor',
  toolName: 'Superconductor',
  homepage: 'https://super.engineering/',
  // No vendor: no legal entity is published on super.engineering. The only
  // identifiable maintainer is Daniel Zarifpour (github.com/zarifpour, owner of
  // the docs/landing repo). NOT to be confused with superconductor.com
  // (Volition, Inc.), an unrelated product.
  pricing: 'free',
  // No pricingSource: the macOS build is a free download (/api/download) with
  // no pricing page (the product is in Alpha), but no first-party copy states
  // "free" verbatim. Left unsourced rather than fabricating a quote.
  codebase: 'proprietary',
  // No modelRestriction: Superconductor is provider-agnostic and drives many
  // coding-agent CLIs (BYOK). Model breadth is captured in the
  // multiple-model-families feature row.
  modelIntegrations: [
    {
      vendor: 'Multiple (agent CLIs)',
      kind: 'cli-subprocess',
      notes:
        "Provider-agnostic: runs each vendor's coding-agent CLI as a local terminal-backed process (Claude Code, Codex, Gemini CLI, Cursor Agent, OpenCode, Copilot, Grok, Pi, Kiro…).",
      sourceUrl: 'https://super.engineering/docs/agent-orchestration/',
      sourceExtract:
        'Run Claude Code, Codex, Pi, Grok, Cursor Agent, Gemini CLI, Kiro, OpenCode, Copilot, or another CLI.',
    },
  ],
  platforms: ['macos'],
  platformSources: {
    macos: {
      sourceUrl: 'https://super.engineering/docs/install/',
      sourceExtract:
        'Requirements: macOS 14 or newer. A Metal-capable Mac. […] Download the latest macOS build: Download for macOS.',
    },
  },
  trackingSources: [
    {
      kind: 'other',
      label: 'Superconductor homepage',
      url: 'https://super.engineering/',
    },
    {
      kind: 'docs',
      label: 'Superconductor documentation (Astro Starlight)',
      url: 'https://super.engineering/docs/',
    },
    {
      kind: 'discord',
      label: 'Superconductor community Discord',
      url: 'https://discord.gg/3uRuntNU2K',
    },
    {
      kind: 'twitter',
      label: 'X / @superdoteng',
      url: 'https://x.com/superdoteng',
      notes:
        "Official handle is 'superdoteng' (display name super.engineering). 'x.com/_Superconductor' is an unrelated account.",
    },
  ],
};
