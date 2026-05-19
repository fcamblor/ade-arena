import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 't3code',
  toolName: 'T3 Code',
  homepage: 'https://t3.codes/',
  vendor: 'T3 Tools Inc',
  pricing: 'oss',
  pricingSource: {
    sourceUrl: 'https://t3.codes/',
    sourceExtract: 'MIT License · commercial-friendly. No telemetry — Unless you opt in. Full stop.',
  },
  codebase: 'open-source',
  codebaseSource: {
    sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/LICENSE',
    sourceExtract: 'MIT License · commercial-friendly.',
  },
  platforms: ['macos', 'windows', 'linux', 'web'],
  platformSources: {
    macos: {
      sourceUrl: 'https://t3.codes/download',
      sourceExtract: 'Apple Silicon (arm64) .dmg / Intel (x64) .dmg.',
    },
    windows: {
      sourceUrl: 'https://t3.codes/download',
      sourceExtract: 'Windows 10, 11 .exe.',
    },
    linux: {
      sourceUrl: 'https://t3.codes/download',
      sourceExtract: 'x86_64 AppImage.',
    },
    web: {
      sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/REMOTE.md',
      sourceExtract:
        'The hosted web app at `https://app.t3.codes` can save a remote backend in browser local storage from a URL like: https://app.t3.codes/pair?host=...',
    },
  },
  modelIntegrations: [
    {
      vendor: 'OpenAI',
      kind: 'app-server-jsonrpc',
      notes: 'Codex via `codex app-server` (JSON-RPC over stdio) — primary integration.',
      sourceUrl: 'https://github.com/pingdotgg/t3code/blob/main/AGENTS.md',
      sourceExtract:
        'T3 Code is currently Codex-first. The server starts `codex app-server` (JSON-RPC over stdio) per provider session, then streams structured events to the browser through WebSocket push messages.',
    },
    {
      vendor: 'Anthropic',
      kind: 'cli-subprocess',
      notes: 'Claude Code via the `claude` binary as a subprocess.',
    },
    {
      vendor: 'OpenCode',
      kind: 'cli-subprocess',
    },
    {
      vendor: 'Cursor',
      kind: 'cli-subprocess',
      notes: 'Cursor Agent CLI as a subprocess.',
    },
  ],
  trackingSources: [
    {
      kind: 'github-releases',
      label: 't3code GitHub releases',
      url: 'https://github.com/pingdotgg/t3code/releases',
    },
    {
      kind: 'github-commits',
      label: 't3code main commits',
      url: 'https://github.com/pingdotgg/t3code/commits/main',
    },
    {
      kind: 'docs',
      label: 't3code README',
      url: 'https://github.com/pingdotgg/t3code/blob/main/README.md',
    },
    {
      kind: 'other',
      label: 't3.codes homepage',
      url: 'https://t3.codes/',
    },
  ],
};
