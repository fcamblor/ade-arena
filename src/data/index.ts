import type { OrchestratorVersion } from './schema';

const modules = import.meta.glob<{ default: OrchestratorVersion }>(
  './orchestrators/*/*.ts',
  { eager: true },
);

export const ORCHESTRATORS: OrchestratorVersion[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.toolName.localeCompare(b.toolName) || a.version.localeCompare(b.version));

export { FEATURES } from './features';
