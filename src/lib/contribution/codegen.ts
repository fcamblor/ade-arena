import type { SupportLevel } from '../../data/schema';
import type { ContributionMeta } from './types';

// Generates the source artefacts a maintainer drops into the repo:
//   - new tool:    `_meta.ts`, `_latest-known-features.ts`, `<version>.ts`
//   - new version: `<version>.ts` expressed as a diff over LATEST_KNOWN_FEATURES
// plus a human-readable `PROPOSAL.md` summary for the GitHub issue.
//
// Output mirrors the hand-written data files (single quotes, 2-space indent,
// key order) closely enough that `astro check` + the maintainer's formatter
// only need a light pass. It is seed data for a reviewed PR, not authoritative.

export type GenScreenshot = { src: string; alt: string; caption?: string };

export type GenFeatureSupport = {
  featureId: string;
  support: SupportLevel;
  note?: string;
  screenshots: GenScreenshot[];
  sourceUrl?: string;
  sourceExtract?: string;
};

// ----- low-level TS literal helpers --------------------------------------

function q(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

function pad(depth: number): string {
  return '  '.repeat(depth);
}

function screenshotLiteral(s: GenScreenshot, depth: number): string {
  const lines = [`${pad(depth)}{`, `${pad(depth + 1)}src: ${q(s.src)},`, `${pad(depth + 1)}alt: ${q(s.alt)},`];
  if (s.caption) lines.push(`${pad(depth + 1)}caption: ${q(s.caption)},`);
  lines.push(`${pad(depth)}}`);
  return lines.join('\n');
}

// Emit the body fields shared by a FeatureSupport object — used both for a full
// entry (with featureId) and for a diff `with: {…}` payload (without it).
function supportBody(fs: GenFeatureSupport, depth: number, includeFeatureId: boolean): string[] {
  const lines: string[] = [];
  if (includeFeatureId) lines.push(`${pad(depth)}featureId: ${q(fs.featureId)},`);
  lines.push(`${pad(depth)}support: ${q(fs.support)},`);
  if (fs.note) lines.push(`${pad(depth)}note: ${q(fs.note)},`);
  if (fs.screenshots.length === 0) {
    lines.push(`${pad(depth)}screenshots: [],`);
  } else {
    lines.push(`${pad(depth)}screenshots: [`);
    lines.push(fs.screenshots.map((s) => `${screenshotLiteral(s, depth + 1)},`).join('\n'));
    lines.push(`${pad(depth)}],`);
  }
  if (fs.sourceUrl) lines.push(`${pad(depth)}sourceUrl: ${q(fs.sourceUrl)},`);
  if (fs.sourceExtract) lines.push(`${pad(depth)}sourceExtract: ${q(fs.sourceExtract)},`);
  return lines;
}

function featureSupportLiteral(fs: GenFeatureSupport, depth: number): string {
  return [`${pad(depth)}{`, ...supportBody(fs, depth + 1, true), `${pad(depth)}}`].join('\n');
}

// ----- _meta.ts -----------------------------------------------------------

export function genMetaFile(meta: ContributionMeta): string {
  const lines: string[] = [
    "import type { OrchestratorMeta } from '../../version-diff';",
    '',
    'export const META: OrchestratorMeta = {',
    `  toolId: ${q(meta.toolId)},`,
    `  toolName: ${q(meta.toolName)},`,
    `  homepage: ${q(meta.homepage)},`,
  ];
  if (meta.vendor) lines.push(`  vendor: ${q(meta.vendor)},`);
  if (meta.pricing) lines.push(`  pricing: ${q(meta.pricing)},`);
  if (meta.codebase) lines.push(`  codebase: ${q(meta.codebase)},`);
  lines.push(`  platforms: [${meta.platforms.map((p) => q(p)).join(', ')}],`);
  // platformSources is required by the schema but needs maintainer-provided
  // evidence. Leave a typed placeholder the maintainer fills in during review.
  lines.push('  // TODO(maintainer): add a sourceUrl + sourceExtract for every platform above.');
  lines.push('  platformSources: {');
  for (const p of meta.platforms) {
    lines.push(`    ${p}: { sourceUrl: '', sourceExtract: '' },`);
  }
  lines.push('  },');
  if (meta.modelRestriction) {
    lines.push('  modelRestriction: {');
    lines.push(`    message: ${q(meta.modelRestriction)},`);
    lines.push('  },');
  }
  lines.push('};', '');
  return lines.join('\n');
}

// ----- _latest-known-features.ts -----------------------------------------

export function genLatestKnownFile(features: GenFeatureSupport[]): string {
  const body = features.map((f) => `${featureSupportLiteral(f, 1)},`).join('\n');
  return [
    "import type { FeatureSupport } from '../../schema';",
    '',
    'export const LATEST_KNOWN_FEATURES: FeatureSupport[] = [',
    body,
    '];',
    '',
  ].join('\n');
}

// ----- <version>.ts (new tool) -------------------------------------------

export function genVersionFileNewTool(version: string, releaseDate: string): string {
  return [
    "import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';",
    "import { META } from './_meta';",
    "import { LATEST_KNOWN_FEATURES } from './_latest-known-features';",
    '',
    'const data: OrchestratorVersion = {',
    '  ...META,',
    `  version: ${q(version)},`,
    `  releaseDate: ${q(releaseDate)},`,
    "  status: 'waiting-for-review',",
    '  features: LATEST_KNOWN_FEATURES,',
    '};',
    '',
    'export default OrchestratorVersionSchema.parse(data);',
    '',
  ].join('\n');
}

// ----- <version>.ts (new version of an existing tool) --------------------

export function genVersionFileDiff(
  version: string,
  releaseDate: string,
  baseVersion: string,
  overrides: GenFeatureSupport[],
): string {
  const diffLines: string[] = [];
  for (const fs of overrides) {
    diffLines.push('  {');
    diffLines.push(`    override: ${q(fs.featureId)},`);
    diffLines.push('    with: {');
    diffLines.push(...supportBody(fs, 3, false));
    diffLines.push('    },');
    diffLines.push('  },');
  }
  return [
    "import { OrchestratorVersionSchema, type OrchestratorVersion } from '../../schema';",
    "import { META } from './_meta';",
    "import { LATEST_KNOWN_FEATURES } from './_latest-known-features';",
    "import { deriveVersionFeatures, type FeatureDiff } from '../../version-diff';",
    '',
    `// Proposed via the in-app contribution tunnel. Diff computed against`,
    `// ${baseVersion}; maintainer should reconcile with the current`,
    '// LATEST_KNOWN_FEATURES baseline before merging.',
    'const diffs: FeatureDiff[] = [',
    ...diffLines,
    '];',
    '',
    'const data: OrchestratorVersion = {',
    '  ...META,',
    `  version: ${q(version)},`,
    `  releaseDate: ${q(releaseDate)},`,
    "  status: 'waiting-for-review',",
    '  features: deriveVersionFeatures(LATEST_KNOWN_FEATURES, diffs),',
    '};',
    '',
    'export default OrchestratorVersionSchema.parse(data);',
    '',
  ].join('\n');
}

// ----- PROPOSAL.md --------------------------------------------------------

const SUPPORT_GLYPH: Record<SupportLevel, string> = {
  yes: '✅ yes',
  partial: '🟡 partial',
  no: '⛔ no',
  unknown: '❔ unknown',
};

export type ProposalSummary = {
  mode: 'new-tool' | 'new-version';
  toolId: string;
  toolName: string;
  version: string;
  releaseDate: string;
  homepage: string;
  baseVersion?: string;
  features: GenFeatureSupport[];
  /** featureIds that changed vs the baseline (new-version mode). */
  changedFeatureIds: string[];
  screenshotCount: number;
};

export function genProposalMarkdown(s: ProposalSummary): string {
  const lines: string[] = [];
  const heading =
    s.mode === 'new-tool'
      ? `Proposal: add orchestrator **${s.toolName}** \`${s.version}\``
      : `Proposal: add **${s.toolName}** \`${s.version}\` (new version)`;
  lines.push(`# ${heading}`, '');
  lines.push(`- **Tool id**: \`${s.toolId}\``);
  lines.push(`- **Version**: \`${s.version}\``);
  lines.push(`- **Release date**: ${s.releaseDate}`);
  lines.push(`- **Homepage**: ${s.homepage}`);
  if (s.mode === 'new-version' && s.baseVersion) {
    lines.push(`- **Diffed against**: \`${s.baseVersion}\``);
  }
  lines.push(`- **Screenshots attached**: ${s.screenshotCount}`);
  lines.push('');
  lines.push(
    s.mode === 'new-tool'
      ? 'Generated by the ADE Arena contribution tunnel. The attached ZIP contains `src/data/orchestrators/' +
          s.toolId +
          '/` (meta + latest-known features + version file) and any screenshots under `public/screenshots/' +
          s.toolId +
          '/`.'
      : 'Generated by the ADE Arena contribution tunnel. The attached ZIP contains the new version file and any screenshots. Only changed feature rows are listed below.',
  );
  lines.push('');
  lines.push('## Feature support', '');
  lines.push('| Feature | Support | Note | Source |');
  lines.push('| --- | --- | --- | --- |');
  const rows = s.mode === 'new-version'
    ? s.features.filter((f) => s.changedFeatureIds.includes(f.featureId))
    : s.features;
  for (const f of rows) {
    const note = (f.note ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const source = f.sourceUrl ? `[link](${f.sourceUrl})` : '';
    lines.push(`| \`${f.featureId}\` | ${SUPPORT_GLYPH[f.support]} | ${note} | ${source} |`);
  }
  lines.push('');
  if (s.mode === 'new-version' && rows.length === 0) {
    lines.push('_No feature changes recorded versus the baseline._', '');
  }
  return lines.join('\n');
}
