import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'multica',
  toolName: 'Multica',
  homepage: 'https://multica.ai/',
  vendor: 'Multica',
  pricing: 'freemium',
  pricingSource: {
    sourceUrl: 'https://multica.ai/',
    sourceExtract:
      'You can self-host Multica on your own infrastructure with Docker Compose or Kubernetes, or use our hosted cloud version.',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/multica-ai/multica/blob/main/LICENSE',
    sourceExtract: 'Multica is licensed under a modified version of the Apache License 2.0',
  },
  modelIntegrations: [
    {
      vendor: 'Anthropic (Claude Code)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/multica-ai/multica/blob/main/README.md',
      sourceExtract:
        'Works with Claude Code, Codex, GitHub Copilot CLI, OpenClaw, OpenCode, Hermes, Gemini, Pi, Cursor Agent, Kimi, and Kiro CLI.',
    },
    {
      vendor: 'OpenAI (Codex)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/multica-ai/multica/blob/main/README.md',
      sourceExtract: 'Works with Claude Code, Codex, GitHub Copilot CLI…',
    },
    {
      vendor: 'GitHub Copilot CLI',
      kind: 'cli-subprocess',
      sourceUrl: 'https://multica.ai/changelog',
      sourceExtract:
        'GitHub Copilot CLI runtime support; Copilot CLI model catalog expanded with correct dotted IDs',
    },
    {
      vendor: 'OpenClaw',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/multica-ai/multica/blob/main/README.md',
      sourceExtract: 'Works with Claude Code, Codex, GitHub Copilot CLI, OpenClaw, OpenCode…',
    },
    {
      vendor: 'OpenCode',
      kind: 'cli-subprocess',
      sourceUrl: 'https://multica.ai/changelog',
      sourceExtract:
        'OpenCode skills are written under `.opencode/skills/` so they are discovered natively',
    },
    {
      vendor: 'Hermes',
      kind: 'unknown',
      sourceUrl: 'https://github.com/multica-ai/multica/blob/main/README.md',
      sourceExtract: 'Works with … Hermes …',
    },
    {
      vendor: 'Google (Gemini CLI)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://multica.ai/changelog',
      sourceExtract:
        'Gemini runtime model list now includes Gemini 3 and CLI aliases',
    },
    {
      vendor: 'Pi',
      kind: 'cli-subprocess',
      sourceUrl: 'https://multica.ai/changelog',
      sourceExtract:
        '`pi --list-models` table format parses correctly, restoring model discovery',
    },
    {
      vendor: 'Cursor Agent',
      kind: 'cli-subprocess',
      sourceUrl: 'https://multica.ai/changelog',
      sourceExtract: 'Cursor agent on Windows preserves multi-line prompts',
    },
    {
      vendor: 'Moonshot (Kimi CLI)',
      kind: 'acp',
      sourceUrl: 'https://multica.ai/changelog',
      sourceExtract:
        "Kimi CLI as a new agent runtime (Moonshot AI's `kimi-cli` over ACP)",
    },
    {
      vendor: 'Kiro CLI',
      kind: 'cli-subprocess',
      sourceUrl: 'https://multica.ai/changelog',
      sourceExtract: 'Kiro CLI added as a local agent runtime option',
    },
    {
      vendor: 'MCP (Model Context Protocol)',
      kind: 'mcp',
      sourceUrl: 'https://multica.ai/changelog',
      sourceExtract: 'Sub-Issues from Editor, Self-Host Gating & MCP',
    },
  ],
  platforms: ['macos', 'windows', 'linux', 'web'],
  platformSources: {
    macos: {
      sourceUrl: 'https://github.com/multica-ai/multica/releases/tag/v0.3.6',
      sourceExtract: 'multica-desktop-0.3.6-mac-arm64.dmg',
    },
    windows: {
      sourceUrl: 'https://github.com/multica-ai/multica/releases/tag/v0.3.6',
      sourceExtract: 'multica-desktop-0.3.6-windows-x64.exe',
    },
    linux: {
      sourceUrl: 'https://github.com/multica-ai/multica/releases/tag/v0.3.6',
      sourceExtract:
        'multica-desktop-0.3.6-linux-amd64.deb / multica-desktop-0.3.6-linux-x86_64.AppImage / .rpm',
    },
    web: {
      sourceUrl: 'https://multica.ai/',
      sourceExtract: "Hosted cloud version available; JSON-LD SoftwareApplication operatingSystem: 'Web'",
    },
  },
  trackingSources: [
    { kind: 'other', label: 'Multica — official site', url: 'https://multica.ai/' },
    { kind: 'docs', label: 'Multica Docs', url: 'https://multica.ai/docs' },
    { kind: 'changelog', label: 'Multica Changelog', url: 'https://multica.ai/changelog' },
    { kind: 'blog', label: 'Multica About / story', url: 'https://multica.ai/about' },
    { kind: 'github-releases', label: 'multica-ai/multica releases', url: 'https://github.com/multica-ai/multica/releases' },
    { kind: 'twitter', label: '@MulticaAI on X', url: 'https://x.com/MulticaAI' },
  ],
};
