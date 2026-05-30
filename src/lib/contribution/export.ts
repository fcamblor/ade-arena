import { getBlob } from './db';
import {
  genLatestKnownFile,
  genMetaFile,
  genProposalMarkdown,
  genVersionFileDiff,
  genVersionFileNewTool,
  type GenFeatureSupport,
  type GenScreenshot,
  type ProposalSummary,
} from './codegen';
import { blobEntry, makeZip, textEntry, type ZipEntry } from './zip';
import type { ContributionDraft, DraftFeatureSupport } from './types';

const REPO = 'fcamblor/ade-arena';

function norm(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function screenshotSrc(toolId: string, filename: string): string {
  return `/screenshots/${toolId}/${filename}`;
}

function toGenScreenshots(toolId: string, fs: DraftFeatureSupport): GenScreenshot[] {
  return fs.screenshots
    // Baseline screenshots flagged removed are dropped from the generated
    // feature so the override expresses the deletion against the baseline.
    .filter((s) => !s.removed)
    .map((s) => ({
      // Baseline-origin shots keep their already-published path; freshly added
      // ones get the repo-convention path under the tool's screenshot folder.
      src: s.baselineSrc ?? screenshotSrc(toolId, s.filename),
      alt: s.alt,
      caption: norm(s.caption),
    }));
}

function toGenFeatureSupport(toolId: string, fs: DraftFeatureSupport): GenFeatureSupport {
  return {
    featureId: fs.featureId,
    support: fs.support,
    note: norm(fs.note),
    screenshots: toGenScreenshots(toolId, fs),
    sourceUrl: norm(fs.sourceUrl),
    sourceExtract: norm(fs.sourceExtract),
  };
}

// A feature differs from its inherited baseline if any persisted field changed
// or its screenshot set changed. Drives which rows become `override` diffs.
function screenshotsChanged(fs: DraftFeatureSupport): boolean {
  return fs.screenshots.some((s) => {
    if (!s.inherited) return true; // freshly attached
    if (s.removed) return true; // baseline shot dropped
    return norm(s.alt) !== norm(s.inherited.alt) || norm(s.caption) !== norm(s.inherited.caption);
  });
}

function hasChanged(fs: DraftFeatureSupport): boolean {
  const base = fs.inherited;
  if (!base) return true;
  return (
    fs.support !== base.support ||
    norm(fs.note) !== norm(base.note) ||
    norm(fs.sourceUrl) !== norm(base.sourceUrl) ||
    norm(fs.sourceExtract) !== norm(base.sourceExtract) ||
    screenshotsChanged(fs)
  );
}

export type BuiltProposal = {
  zip: Blob;
  markdown: string;
  filename: string;
  issueUrl: string;
  changedCount: number;
  screenshotCount: number;
};

// Assemble every artefact for a draft: the ZIP (repo-relative paths so the
// contributor unzips at the repo root), the Markdown summary, and the
// pre-filled GitHub issue URL. `orderedFeatureIds` keeps output deterministic
// and aligned with the canonical feature order.
export async function buildProposal(
  draft: ContributionDraft,
  orderedFeatureIds: string[],
): Promise<BuiltProposal> {
  const toolId = draft.meta.toolId;
  const ordered = orderedFeatureIds
    .map((id) => draft.features[id])
    .filter((fs): fs is DraftFeatureSupport => Boolean(fs));

  const allGen = ordered.map((fs) => toGenFeatureSupport(toolId, fs));
  const changedFeatureIds: string[] = ordered.filter(hasChanged).map((fs) => fs.featureId);

  const entries: ZipEntry[] = [];
  const dir = `src/data/orchestrators/${toolId}`;
  const versionFile = `${dir}/${draft.version}.ts`;

  if (draft.mode === 'new-tool') {
    entries.push(textEntry(`${dir}/_meta.ts`, genMetaFile(draft.meta)));
    entries.push(textEntry(`${dir}/_latest-known-features.ts`, genLatestKnownFile(allGen)));
    entries.push(textEntry(versionFile, genVersionFileNewTool(draft.version, draft.releaseDate)));
  } else {
    const overrides = allGen.filter((g) => changedFeatureIds.includes(g.featureId));
    entries.push(
      textEntry(
        versionFile,
        genVersionFileDiff(
          draft.version,
          draft.releaseDate,
          draft.baseVersion ?? 'unknown baseline',
          overrides,
        ),
      ),
    );
  }

  // Screenshots — only the freshly added ones carry a Blob to bundle. Baseline
  // screenshots already live in the repo (skipped), and removed ones are
  // excluded from both the feature data and the ZIP.
  let screenshotCount = 0;
  for (const fs of ordered) {
    for (const shot of fs.screenshots) {
      if (shot.baselineSrc || shot.removed) continue;
      const blob = await getBlob(shot.id);
      if (!blob) continue;
      entries.push(await blobEntry(`public/screenshots/${toolId}/${shot.filename}`, blob));
      screenshotCount += 1;
    }
  }

  const summary: ProposalSummary = {
    mode: draft.mode,
    toolId,
    toolName: draft.meta.toolName,
    version: draft.version,
    releaseDate: draft.releaseDate,
    homepage: draft.meta.homepage,
    baseVersion: draft.baseVersion,
    features: allGen,
    changedFeatureIds,
    screenshotCount,
  };
  const markdown = genProposalMarkdown(summary);
  entries.unshift(textEntry('PROPOSAL.md', markdown));

  return {
    zip: makeZip(entries),
    markdown,
    filename: `${toolId}-${draft.version}-proposal.zip`,
    issueUrl: buildIssueUrl(draft),
    changedCount: changedFeatureIds.length,
    screenshotCount,
  };
}

// Pre-fill the GitHub issue *form* via its field ids. The full markdown payload
// is too large to reliably pass through a URL, so it is copied to the clipboard
// separately and the contributor pastes it into the "payload" field.
export function buildIssueUrl(draft: ContributionDraft): string {
  const params = new URLSearchParams({
    template: 'orchestrator-proposal.yml',
    title: `feat(data): ${draft.meta.toolName} ${draft.version}`,
    'tool-name': draft.meta.toolName,
    'tool-id': draft.meta.toolId,
    version: draft.version,
    homepage: draft.meta.homepage,
    mode: draft.mode === 'new-tool' ? 'New orchestrator' : 'New version of an existing orchestrator',
  });
  return `https://github.com/${REPO}/issues/new?${params.toString()}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
