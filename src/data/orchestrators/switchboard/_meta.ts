import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'switchboard',
  toolName: 'Switchboard',
  homepage: 'https://github.com/doctly/switchboard',
  vendor: 'Doctly',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://github.com/doctly/switchboard/blob/main/LICENSE',
    sourceExtract: 'MIT License — free, open-source desktop app distributed via GitHub Releases.',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/doctly/switchboard/blob/main/LICENSE',
    sourceExtract: 'SPDX: MIT (verified via GitHub license API)',
  },
  modelRestriction: {
    message: 'Switchboard is a UI front-end exclusively for Claude Code CLI sessions; models are whatever Claude Code drives (Anthropic).',
    sourceUrl: 'https://github.com/doctly/switchboard',
  },
  modelIntegrations: [
    {
      vendor: 'Anthropic',
      kind: 'cli-subprocess',
      sourceUrl: 'https://github.com/doctly/switchboard',
      sourceExtract:
        'Launch, resume, fork, and monitor sessions … no more juggling terminal tabs or digging through ~/.claude/projects. Built-in Terminal — Connect to running sessions or launch new ones without leaving the app.',
    },
    {
      vendor: 'Anthropic',
      kind: 'app-server-jsonrpc',
      sourceUrl: 'https://github.com/doctly/switchboard',
      sourceExtract:
        'IDE Emulation — Switchboard acts as an IDE for Claude CLI, showing file diffs and opens in a side panel … Claude IDE MCP Emulator.',
    },
  ],
  platforms: ['macos', 'windows', 'linux'],
  platformSources: {
    macos: {
      sourceUrl: 'https://github.com/doctly/switchboard/releases/tag/v0.0.30',
      sourceExtract: 'Assets include Switchboard-0.0.30.dmg (Apple Silicon & Intel)',
    },
    windows: {
      sourceUrl: 'https://github.com/doctly/switchboard/releases/tag/v0.0.30',
      sourceExtract: 'Assets include Switchboard.Setup.0.0.30.exe (Windows installer)',
    },
    linux: {
      sourceUrl: 'https://github.com/doctly/switchboard/releases/tag/v0.0.30',
      sourceExtract: 'Assets include switchboard_0.0.30_amd64.deb and Switchboard-0.0.30.AppImage',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'GitHub repository', url: 'https://github.com/doctly/switchboard' },
    { kind: 'github-releases', label: 'GitHub Releases', url: 'https://github.com/doctly/switchboard/releases' },
    { kind: 'github-commits', label: 'GitHub Commits (main)', url: 'https://github.com/doctly/switchboard/commits/main' },
  ],
};
