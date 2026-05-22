import type { OrchestratorMeta } from '../../version-diff';

export const META: OrchestratorMeta = {
  toolId: 'genie-builder',
  toolName: 'GenieBuilder',
  homepage: 'https://geniebuilder.ai/',
  vendor: 'Stephan Janssen BV',
  codebase: 'proprietary',
  modelIntegrations: [
    {
      vendor: 'OpenAI',
      kind: 'provider-sdk',
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract:
        'Cloud: OpenAI, Anthropic, Google Gemini. Local: Ollama, LM Studio, llama.cpp. CLI runners: Claude Code, Kimi CLI, Codex, Copilot CLI.',
    },
    {
      vendor: 'Anthropic',
      kind: 'provider-sdk',
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract:
        'Cloud: OpenAI, Anthropic, Google Gemini. Local: Ollama, LM Studio, llama.cpp. CLI runners: Claude Code, Kimi CLI, Codex, Copilot CLI.',
    },
    {
      vendor: 'Google',
      kind: 'provider-sdk',
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract:
        'Cloud: OpenAI, Anthropic, Google Gemini. Local: Ollama, LM Studio, llama.cpp. CLI runners: Claude Code, Kimi CLI, Codex, Copilot CLI.',
    },
    {
      vendor: 'Anthropic (Claude Code CLI)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract: 'CLI runners: Claude Code, Kimi CLI, Codex, Copilot CLI.',
    },
    {
      vendor: 'OpenAI (Codex CLI)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract: 'CLI runners: Claude Code, Kimi CLI, Codex, Copilot CLI.',
    },
    {
      vendor: 'GitHub (Copilot CLI)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract: 'CLI runners: Claude Code, Kimi CLI, Codex, Copilot CLI.',
    },
    {
      vendor: 'Moonshot (Kimi CLI)',
      kind: 'cli-subprocess',
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract: 'CLI runners: Claude Code, Kimi CLI, Codex, Copilot CLI.',
    },
    {
      vendor: 'Ollama',
      kind: 'openai-compatible-api',
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract: 'Local: Ollama, LM Studio, llama.cpp.',
    },
  ],
  platforms: ['macos', 'windows', 'linux'],
  platformSources: {
    macos: {
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract: 'Available for macOS (Apple Silicon), Windows, and Linux.',
    },
    windows: {
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract: 'Available for macOS (Apple Silicon), Windows, and Linux.',
    },
    linux: {
      sourceUrl: 'https://geniebuilder.ai/',
      sourceExtract: 'Available for macOS (Apple Silicon), Windows, and Linux.',
    },
  },
  trackingSources: [
    { kind: 'other', label: 'Homepage', url: 'https://geniebuilder.ai/' },
    { kind: 'docs', label: 'Documentation', url: 'https://geniebuilder.ai/docs/getting-started/introduction' },
    { kind: 'blog', label: 'GenieBuilder blog', url: 'https://geniebuilder.ai/blog' },
    { kind: 'release-notes', label: 'Releases', url: 'https://geniebuilder.ai/releases' },
    { kind: 'youtube', label: '@GenieBuilder on YouTube', url: 'https://www.youtube.com/@GenieBuilder' },
    { kind: 'twitter', label: '@DevoxxGenie on X', url: 'https://x.com/DevoxxGenie' },
    { kind: 'github-commits', label: 'GitHub issues (stephanj/GenieBuilder)', url: 'https://github.com/stephanj/GenieBuilder/issues' },
  ],
};
