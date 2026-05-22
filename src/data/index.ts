import type { OrchestratorVersion } from './schema';

// Only version files. Files prefixed with `_` (e.g. `_meta.ts`,
// `_latest-known-features.ts`) are pure data modules composed by version
// files and must not be picked up as versions themselves.
const modules = import.meta.glob<{ default: OrchestratorVersion }>(
  ['./orchestrators/*/*.ts', '!./orchestrators/*/_*.ts'],
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

export function isApproved(v: OrchestratorVersion): boolean {
  return (v.status ?? 'approved') === 'approved';
}

// Public table: every known version of every tool, rendered as columns. One
// column per tool is "default-visible" (the latest approved one); all others
// — older approved versions and waiting-for-review versions — are hidden until
// a viewer opts in via the preview query param. The dropdown switcher in each
// header lets readers jump between versions.
export const ORCHESTRATORS: OrchestratorVersion[] = (() => {
  const toolIds = Object.keys(ORCHESTRATORS_BY_TOOL).sort((a, b) => {
    const an = ORCHESTRATORS_BY_TOOL[a][0].toolName;
    const bn = ORCHESTRATORS_BY_TOOL[b][0].toolName;
    return an.localeCompare(bn);
  });
  const out: OrchestratorVersion[] = [];
  for (const id of toolIds) {
    const versions = ORCHESTRATORS_BY_TOOL[id];
    const defaultVisible = versions.find(isApproved);
    if (defaultVisible) out.push(defaultVisible);
    for (const v of versions) {
      if (v !== defaultVisible) out.push(v);
    }
  }
  return out;
})();

// True for the single column shown per tool by default (the latest approved
// version). Every other version is rendered but kept invisible until opted in
// via the preview query param.
export function isDefaultVisible(v: OrchestratorVersion): boolean {
  const versions = ORCHESTRATORS_BY_TOOL[v.toolId];
  return versions.find(isApproved) === v;
}

export { FEATURES } from './features';
