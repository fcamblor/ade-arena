import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'cmux',
  toolName: 'cmux',
  homepage: 'https://cmux.com/',
  vendor: 'Manaflow',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://github.com/manaflow-ai/cmux',
    sourceExtract:
      'GPL-3.0-or-later with commercial licensing available. Contact: founders@manaflow.com',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/manaflow-ai/cmux/blob/main/LICENSE',
    sourceExtract: 'GPL-3.0-or-later',
  },
  modelIntegrations: [
    {
      vendor: 'Anthropic (Claude Code)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract:
        'Agents with native resume support: Claude Code, Codex, Grok, OpenCode, Pi, Amp, Cursor CLI, Gemini, Rovo Dev, Copilot, CodeBuddy, Factory, Qoder',
    },
    {
      vendor: 'OpenAI (Codex)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract:
        'Agents with native resume support: Claude Code, Codex, Grok, OpenCode, Pi, Amp, Cursor CLI, Gemini, Rovo Dev, Copilot, CodeBuddy, Factory, Qoder',
    },
    {
      vendor: 'xAI (Grok)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: 'Claude Code, Codex, Grok, OpenCode, Pi, Amp, Cursor CLI…',
    },
    {
      vendor: 'OpenCode',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: 'Claude Code, Codex, Grok, OpenCode, Pi, Amp, Cursor CLI…',
    },
    {
      vendor: 'Pi',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: 'Claude Code, Codex, Grok, OpenCode, Pi, Amp, Cursor CLI…',
    },
    {
      vendor: 'Sourcegraph Amp',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: '… Pi, Amp, Cursor CLI, Gemini, Rovo Dev, Copilot, CodeBuddy, Factory, Qoder',
    },
    {
      vendor: 'Cursor CLI',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: '… Pi, Amp, Cursor CLI, Gemini, Rovo Dev, Copilot, CodeBuddy, Factory, Qoder',
    },
    {
      vendor: 'Google (Gemini CLI)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: '… Cursor CLI, Gemini, Rovo Dev, Copilot, CodeBuddy, Factory, Qoder',
    },
    {
      vendor: 'Atlassian Rovo Dev',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: '… Cursor CLI, Gemini, Rovo Dev, Copilot, CodeBuddy, Factory, Qoder',
    },
    {
      vendor: 'GitHub Copilot',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: '… Rovo Dev, Copilot, CodeBuddy, Factory, Qoder',
    },
    {
      vendor: 'CodeBuddy',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: '… Copilot, CodeBuddy, Factory, Qoder',
    },
    {
      vendor: 'Factory (Droid CLI)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: '… CodeBuddy, Factory, Qoder',
    },
    {
      vendor: 'Qoder',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: '… Factory, Qoder',
    },
  ],
  platforms: ['macos'],
  platformSources: {
    macos: {
      sourceUrl: 'https://github.com/manaflow-ai/cmux',
      sourceExtract: 'macOS only. Distribution via DMG installer, Homebrew tap, and nightly builds.',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'Homepage', url: 'https://cmux.com/' },
    { kind: 'docs', label: 'Documentation', url: 'https://cmux.com/docs/getting-started' },
    { kind: 'other', label: 'GitHub repository', url: 'https://github.com/manaflow-ai/cmux' },
    { kind: 'github-releases', label: 'GitHub Releases', url: 'https://github.com/manaflow-ai/cmux/releases' },
    { kind: 'twitter', label: '@manaflowai on X', url: 'https://x.com/manaflowai' },
    { kind: 'discord', label: 'Manaflow Discord', url: 'https://discord.gg/xsgFEVrWCZ' },
    { kind: 'youtube', label: 'Manaflow on YouTube', url: 'https://www.youtube.com/channel/UCAa89_j-TWkrXfk9A3CbASw' },
  ],
};
