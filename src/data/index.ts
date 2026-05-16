import type { OrchestratorVersion } from './schema';

const modules = import.meta.glob<{ default: OrchestratorVersion }>(
  './orchestrators/*/*.ts',
  { eager: true },
);

const ALL_VERSIONS: OrchestratorVersion[] = Object.values(modules).map((m) => m.default);

// Newest-first comparator. Prefers ISO releaseDate; falls back to numeric-aware
// version string comparison so e.g. "0.52.3" sorts above "0.5.0".
function compareNewestFirst(a: OrchestratorVersion, b: OrchestratorVersion): number {
  if (a.releaseDate && b.releaseDate) {
    return b.releaseDate.localeCompare(a.releaseDate);
  }
  if (a.releaseDate) return -1;
  if (b.releaseDate) return 1;
  return b.version.localeCompare(a.version, undefined, { numeric: true });
}

export const ORCHESTRATORS_BY_TOOL: Record<string, OrchestratorVersion[]> = {};
for (const v of ALL_VERSIONS) {
  (ORCHESTRATORS_BY_TOOL[v.toolId] ??= []).push(v);
}
for (const toolId of Object.keys(ORCHESTRATORS_BY_TOOL)) {
  ORCHESTRATORS_BY_TOOL[toolId].sort(compareNewestFirst);
}

// Public table: latest version of each tool, sorted by tool name.
export const ORCHESTRATORS: OrchestratorVersion[] = Object.values(ORCHESTRATORS_BY_TOOL)
  .map((versions) => versions[0])
  .sort((a, b) => a.toolName.localeCompare(b.toolName));

export { FEATURES } from './features';
