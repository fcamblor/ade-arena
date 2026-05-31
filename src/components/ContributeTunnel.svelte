<script lang="ts">
  import { onMount } from 'svelte';
  import type { Platform, SupportLevel, TrackingSourceKind } from '../data/schema';
  import type {
    ContributionDraft,
    ContributionMode,
    ContributionTrackingSource,
    DraftFeatureSupport,
    DraftScreenshot,
    ToolBaseline,
  } from '../lib/contribution/types';
  import {
    deleteBlob,
    deleteDraft,
    listDrafts,
    loadDraft,
    putBlob,
    getBlob,
    saveDraft,
  } from '../lib/contribution/db';
  import { buildProposal, copyToClipboard, downloadBlob, type BuiltProposal } from '../lib/contribution/export';
  import ContributeDiff from './ContributeDiff.svelte';
  import ProofPreview from './ProofPreview.svelte';

  type ContributeFeature = {
    id: string;
    label: string;
    category: string;
    shortDescription: string;
    longDescription?: string;
    whyImportant?: { short: string; long: string };
  };

  export let features: ContributeFeature[] = [];
  export let baselines: ToolBaseline[] = [];

  // Glyphs mirror the comparison grid (ComparisonTable.astro `supportGlyph`) so
  // the tunnel reads the same as the homepage: ● yes / ◐ partial / ○ no / ? unknown.
  const SUPPORT_GLYPH: Record<SupportLevel, string> = {
    yes: '●',
    partial: '◐',
    no: '○',
    unknown: '?',
  };
  const SUPPORT_OPTIONS: { value: SupportLevel; label: string }[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'partial', label: 'Partial' },
    { value: 'no', label: 'No' },
    { value: 'unknown', label: 'Unknown' },
  ];
  const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
    { value: 'macos', label: 'macOS' },
    { value: 'windows', label: 'Windows' },
    { value: 'linux', label: 'Linux' },
    { value: 'web', label: 'Web' },
  ];
  // Tracking-source kinds mirror `TrackingSourceKindSchema` in src/data/schema.ts.
  // These are the places the dataset watches to stay current on an ADE; the
  // contribution review skill completes whatever the contributor leaves out.
  const TRACKING_KIND_OPTIONS: { value: TrackingSourceKind; label: string }[] = [
    { value: 'docs', label: 'Documentation' },
    { value: 'changelog', label: 'Changelog' },
    { value: 'release-notes', label: 'Release notes' },
    { value: 'github-releases', label: 'GitHub releases' },
    { value: 'github-commits', label: 'GitHub commits' },
    { value: 'rss', label: 'RSS / Atom feed' },
    { value: 'blog', label: 'Blog' },
    { value: 'docs-diff', label: 'Docs diff' },
    { value: 'discord', label: 'Discord' },
    { value: 'twitter', label: 'X / Twitter' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'other', label: 'Other (website, forum…)' },
  ];

  type Step = 'start' | 'meta' | 'features' | 'review';

  let step: Step = 'start';
  let draft: ContributionDraft | null = null;
  let currentIndex = 0;
  let existingDrafts: ContributionDraft[] = [];
  let selectedBaselineId = baselines[0]?.toolId ?? '';
  let error = '';
  let busy = false;
  let dragOver = false;

  // Object-URL previews for screenshots, keyed by screenshot id. Created on
  // upload or when resuming a draft; revoked on removal / teardown.
  let previews: Record<string, string> = {};
  let built: BuiltProposal | null = null;
  let copiedMd = false;
  // Explicit acknowledgement that user-added screenshots carry no sensitive data.
  // Required before generating the proposal whenever at least one screenshot was added.
  let screenshotConsent = false;

  const orderedFeatureIds = features.map((f) => f.id);
  // Feature id → human label, so review remarks read with their feature name in
  // the clipboard summary that feeds the GitHub issue.
  const featureLabels: Record<string, string> = Object.fromEntries(
    features.map((f) => [f.id, f.label]),
  );

  $: currentFeature = features[currentIndex];
  $: currentSupport = draft && currentFeature ? draft.features[currentFeature.id] : undefined;
  $: reviewedCount = draft
    ? Object.values(draft.features).filter((f) => f.reviewed).length
    : 0;
  $: atLast = currentIndex >= features.length - 1;
  // Screenshots freshly uploaded by the contributor (no `baselineSrc`). Baseline
  // screenshots are already public and consented to, so they are excluded from
  // the privacy warning and the consent gate.
  const isUserAdded = (s: DraftScreenshot) => !s.baselineSrc;
  $: addedScreenshots = draft
    ? Object.values(draft.features).reduce(
        (n, f) => n + f.screenshots.filter(isUserAdded).length,
        0,
      )
    : 0;

  function todayStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function compactStamp(): string {
    return todayStamp().replace(/-/g, '');
  }

  function uuid(): string {
    return crypto.randomUUID();
  }

  function slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  onMount(() => {
    void refreshDrafts();
    return () => {
      for (const url of Object.values(previews)) URL.revokeObjectURL(url);
    };
  });

  async function refreshDrafts() {
    existingDrafts = await listDrafts();
  }

  async function persist() {
    if (!draft) return;
    // Any edit invalidates a previously generated proposal: drop the stale recap
    // so the export screen always reflects the current draft (and re-shows the
    // privacy warning / consent gate when needed).
    built = null;
    draft.updatedAt = new Date().toISOString();
    draft = draft; // trigger reactivity
    await saveDraft(draft);
  }

  function emptyFeature(id: string): DraftFeatureSupport {
    return { featureId: id, support: 'unknown', screenshots: [] };
  }

  async function startNewTool() {
    const id = uuid();
    const fresh: ContributionDraft = {
      id,
      schemaVersion: 1,
      mode: 'new-tool',
      meta: { toolId: '', toolName: '', homepage: '', platforms: [] },
      version: '',
      releaseDate: todayStamp(),
      features: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    for (const f of features) fresh.features[f.id] = emptyFeature(f.id);
    draft = fresh;
    await persist();
    step = 'meta';
  }

  async function startNewVersion() {
    const base = baselines.find((b) => b.toolId === selectedBaselineId);
    if (!base) {
      error = 'Pick an orchestrator first.';
      return;
    }
    const id = uuid();
    const fresh: ContributionDraft = {
      id,
      schemaVersion: 1,
      mode: 'new-version',
      meta: {
        toolId: base.toolId,
        toolName: base.toolName,
        homepage: base.homepage,
        vendor: base.vendor,
        pricing: base.pricing,
        codebase: base.codebase,
        platforms: [...base.platforms],
        modelRestriction: base.modelRestriction,
      },
      version: '',
      releaseDate: todayStamp(),
      baseToolId: base.toolId,
      baseVersion: base.baseVersion,
      features: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Pre-fill every feature from the baseline, recording the inherited value
    // so the tunnel can flag changes and the generator can emit overrides.
    const byId = new Map(base.features.map((f) => [f.featureId, f]));
    for (const f of features) {
      const b = byId.get(f.id as any);
      if (b) {
        fresh.features[f.id] = {
          featureId: f.id,
          support: b.support,
          note: b.note,
          sourceUrl: b.sourceUrl,
          sourceExtract: b.sourceExtract,
          // Pre-fill the baseline's published screenshots so the contributor
          // edits/removes against the real shots; each carries its origin so
          // the tunnel can flag text edits and explicit removals.
          screenshots: b.screenshots.map((sc) => ({
            id: uuid(),
            filename: filenameFromSrc(sc.src),
            mimeType: mimeFromSrc(sc.src),
            alt: sc.alt,
            caption: sc.caption,
            baselineSrc: sc.src,
            inherited: { src: sc.src, alt: sc.alt, caption: sc.caption },
          })),
          inherited: {
            support: b.support,
            note: b.note,
            sourceUrl: b.sourceUrl,
            sourceExtract: b.sourceExtract,
            screenshotCount: b.screenshots.length,
          },
        };
      } else {
        fresh.features[f.id] = emptyFeature(f.id);
      }
    }
    draft = fresh;
    await persist();
    error = '';
    step = 'meta';
  }

  async function resumeDraft(id: string) {
    const loaded = await loadDraft(id);
    if (!loaded) return;
    // Backfill feature entries added to the catalog after this draft was first
    // created: the features step iterates the current `features` list, so a
    // missing `draft.features[id]` would crash setSupport/setField. New entries
    // start empty (no baseline to inherit — the draft predates the feature).
    let backfilled = false;
    for (const f of features) {
      if (!loaded.features[f.id]) {
        loaded.features[f.id] = emptyFeature(f.id);
        backfilled = true;
      }
    }
    draft = loaded;
    if (backfilled) await persist();
    // Rebuild previews from the stored blobs.
    for (const fs of Object.values(loaded.features)) {
      for (const shot of fs.screenshots) {
        const blob = await getBlob(shot.id);
        if (blob) previews[shot.id] = URL.createObjectURL(blob);
      }
    }
    previews = previews;
    currentIndex = 0;
    step = loaded.meta.toolName ? 'features' : 'meta';
  }

  async function removeDraft(id: string) {
    await deleteDraft(id);
    if (draft?.id === id) {
      draft = null;
      step = 'start';
    }
    await refreshDrafts();
  }

  // ----- meta step ----------------------------------------------------------

  function onToolNameInput(value: string) {
    if (!draft) return;
    draft.meta.toolName = value;
    if (draft.mode === 'new-tool') draft.meta.toolId = slugify(value);
    void persist();
  }

  // ----- tracking sources (new-tool only) ----------------------------------
  // The contributor lists where to watch for future releases of the ADE
  // (changelog, release notes, GitHub releases/commits, docs, RSS, blog…). The
  // review skill completes whatever is missing with a research pass.

  function addTrackingSource() {
    if (!draft) return;
    const list = draft.meta.trackingSources ?? [];
    draft.meta.trackingSources = [...list, { kind: 'changelog', label: '', url: '' }];
    void persist();
  }

  function setTrackingField(index: number, field: keyof ContributionTrackingSource, value: string) {
    if (!draft?.meta.trackingSources) return;
    const next = [...draft.meta.trackingSources];
    next[index] = { ...next[index], [field]: value };
    draft.meta.trackingSources = next;
    void persist();
  }

  function removeTrackingSource(index: number) {
    if (!draft?.meta.trackingSources) return;
    draft.meta.trackingSources = draft.meta.trackingSources.filter((_, i) => i !== index);
    void persist();
  }

  function togglePlatform(p: Platform) {
    if (!draft) return;
    const has = draft.meta.platforms.includes(p);
    draft.meta.platforms = has
      ? draft.meta.platforms.filter((x) => x !== p)
      : [...draft.meta.platforms, p];
    void persist();
  }

  function metaValid(): boolean {
    if (!draft) return false;
    const m = draft.meta;
    const idOk = /^[a-z0-9-]+$/.test(m.toolId);
    const urlOk = /^https?:\/\/.+/.test(m.homepage);
    const platformsOk = draft.mode === 'new-version' || m.platforms.length > 0;
    const releaseDateOk = /^\d{4}-\d{2}-\d{2}$/.test(draft.releaseDate);
    return Boolean(m.toolName) && idOk && urlOk && Boolean(draft.version) && releaseDateOk && platformsOk;
  }

  function goToFeatures() {
    if (!metaValid()) {
      error = 'Fill in tool name, a valid homepage URL, version, release date and at least one platform.';
      return;
    }
    error = '';
    currentIndex = 0;
    step = 'features';
  }

  // ----- features step ------------------------------------------------------

  // The draft state for the feature on screen, created on the fly if missing —
  // a draft started before this feature joined the catalog has no entry for it,
  // and the features step iterates the *current* catalog. Self-heals mid-session
  // (resumeDraft already backfills on load).
  function featureState(): DraftFeatureSupport | undefined {
    if (!draft || !currentFeature) return undefined;
    let fs = draft.features[currentFeature.id];
    if (!fs) {
      fs = emptyFeature(currentFeature.id);
      draft.features[currentFeature.id] = fs;
    }
    return fs;
  }

  function setSupport(value: SupportLevel) {
    const fs = featureState();
    if (!fs) return;
    fs.support = value;
    fs.reviewed = true;
    void persist();
  }

  function setField(field: 'note' | 'sourceUrl' | 'sourceExtract' | 'reviewRemark', value: string) {
    const fs = featureState();
    if (!fs) return;
    (fs as any)[field] = value;
    void persist();
  }

  function nextUsedIndex(fs: DraftFeatureSupport): number {
    const used = new Set(
      fs.screenshots.map((s) => {
        const m = s.filename.match(/_(\d+)\.[a-z0-9]+$/i);
        return m ? Number(m[1]) : 0;
      }),
    );
    let n = 1;
    while (used.has(n)) n += 1;
    return n;
  }

  // Last path segment of a published screenshot `src`, used as the draft
  // filename so newly-added shots keep numbering past the baseline ones.
  function filenameFromSrc(src: string): string {
    const clean = src.split(/[?#]/)[0];
    const slash = clean.lastIndexOf('/');
    return slash >= 0 ? clean.slice(slash + 1) : clean;
  }

  function mimeFromSrc(src: string): string {
    const ext = filenameFromSrc(src).split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      webp: 'image/webp',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      avif: 'image/avif',
    };
    return map[ext] ?? 'application/octet-stream';
  }

  function extFor(file: File): string {
    const map: Record<string, string> = {
      'image/webp': 'webp',
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'image/avif': 'avif',
    };
    if (map[file.type]) return map[file.type];
    const dot = file.name.lastIndexOf('.');
    return dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : 'bin';
  }

  // The published dataset is 100% WebP and its heaviest screenshot sits around
  // ~150 KB. We re-encode every upload to WebP here, at the source, so a
  // proposal is consistent with the rest of the repo instead of carrying a
  // multi-MB PNG. The width cap is the largest sensible screenshot for the
  // comparison table; anything wider is downscaled.
  const SHOT_MAX_WIDTH = 2000;
  const SHOT_WEBP_QUALITY = 0.85;

  // Best-effort WebP transcode via the Canvas API (no dependency). Returns a new
  // `.webp` File, or the original untouched when the browser cannot decode/encode
  // it (exotic format, decode error) or when re-encoding an already-WebP file
  // would only make it bigger. Note an animated GIF is decoded to its first
  // frame only, so it is flattened to a static WebP rather than preserved —
  // acceptable for screenshots. The skill's Phase-1 format check is the backstop
  // for the rare fall-through.
  async function toWebpFile(file: File): Promise<File> {
    if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
      return file;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, SHOT_MAX_WIDTH / bitmap.width);
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        bitmap.close();
        return file;
      }
      ctx.drawImage(bitmap, 0, 0, w, h);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/webp', SHOT_WEBP_QUALITY),
      );
      // toBlob ignores the type on browsers without WebP encode support and
      // falls back to PNG — keep the original then rather than ship a PNG.
      if (!blob || blob.type !== 'image/webp') return file;
      // No format gain to be had on an already-WebP file: keep the smaller one
      // and avoid a second lossy pass.
      if (file.type === 'image/webp' && blob.size >= file.size) return file;
      const base = file.name.replace(/\.[^.]+$/, '') || 'screenshot';
      return new File([blob], `${base}.webp`, { type: 'image/webp' });
    } catch {
      return file;
    }
  }

  async function addFiles(files: File[]) {
    if (!draft || !currentFeature) return;
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return;
    const fs = featureState();
    if (!fs) return;
    for (const original of images) {
      const file = await toWebpFile(original);
      const n = nextUsedIndex(fs);
      const id = uuid();
      const shot: DraftScreenshot = {
        id,
        filename: `${currentFeature.id}_${compactStamp()}_${n}.${extFor(file)}`,
        mimeType: file.type || 'application/octet-stream',
        alt: '',
      };
      await putBlob(id, draft.id, file);
      previews[id] = URL.createObjectURL(file);
      fs.screenshots = [...fs.screenshots, shot];
    }
    previews = previews;
    // Newly added content must be re-acknowledged before export.
    screenshotConsent = false;
    await persist();
  }

  async function onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    await addFiles(Array.from(input.files));
    input.value = '';
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function onDragLeave() {
    dragOver = false;
  }

  // Collect every image carried by a DataTransfer (drop or paste). Inline
  // screenshots dragged from apps like Skitch never reach `.files`; they only
  // surface as `.items` of kind 'file' or as a `text/html`/`text/uri-list`
  // payload pointing at the bitmap (often a data: URL). Read all string data
  // synchronously here — a DataTransfer becomes inert after the first await.
  function readImageSources(dt: DataTransfer): { files: File[]; urls: string[] } {
    const files: File[] = [];
    const urls: string[] = [];
    // The same bitmap is usually mirrored in both `.files` and `.items` — key
    // by identity to avoid registering one drop/paste as two screenshots.
    const seen = new Set<string>();
    const addFile = (f: File | null) => {
      if (!f || !f.type.startsWith('image/')) return;
      const key = `${f.name}:${f.size}:${f.lastModified}`;
      if (seen.has(key)) return;
      seen.add(key);
      files.push(f);
    };
    if (dt.files) {
      for (const f of Array.from(dt.files)) addFile(f);
    }
    if (dt.items) {
      for (const it of Array.from(dt.items)) {
        if (it.kind === 'file') addFile(it.getAsFile());
      }
    }
    if (files.length === 0) {
      const html = dt.getData('text/html');
      const imgSrc = html?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
      if (imgSrc) urls.push(imgSrc);
      const uriList = dt.getData('text/uri-list');
      if (uriList) {
        for (const line of uriList.split(/\r?\n/)) {
          const t = line.trim();
          if (t && !t.startsWith('#')) urls.push(t);
        }
      }
      const plain = dt.getData('text/plain')?.trim();
      if (plain && (plain.startsWith('data:image/') || /^https?:\/\//i.test(plain))) {
        urls.push(plain);
      }
    }
    return { files, urls };
  }

  // Resolve image URLs (data: or http) extracted from a transfer into Files.
  async function urlsToImageFiles(urls: string[]): Promise<File[]> {
    const out: File[] = [];
    for (const url of [...new Set(urls)]) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const blob = await res.blob();
        if (!blob.type.startsWith('image/')) continue;
        out.push(new File([blob], 'pasted-image', { type: blob.type }));
      } catch {
        // Cross-origin or otherwise unreachable source: skip silently.
      }
    }
    return out;
  }

  async function addFromTransfer(dt: DataTransfer | null): Promise<boolean> {
    if (!dt) return false;
    const { files, urls } = readImageSources(dt);
    const resolved = await urlsToImageFiles(urls);
    const all = [...files, ...resolved];
    if (all.length === 0) return false;
    await addFiles(all);
    return true;
  }

  async function onDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    await addFromTransfer(event.dataTransfer);
  }

  async function onPaste(event: ClipboardEvent) {
    if (!draft || !currentFeature) return;
    const added = await addFromTransfer(event.clipboardData);
    if (added) event.preventDefault();
  }

  async function removeScreenshot(shotId: string) {
    const fs = featureState();
    if (!fs) return;
    const shot = fs.screenshots.find((s) => s.id === shotId);
    if (!shot) return;
    if (shot.inherited) {
      // Baseline-origin: keep it in the list, flagged removed, so the diff
      // against the baseline stays explicit (and can be undone).
      shot.removed = true;
      fs.screenshots = fs.screenshots;
      await persist();
      return;
    }
    // Freshly uploaded: drop it entirely and reclaim its Blob + preview.
    fs.screenshots = fs.screenshots.filter((s) => s.id !== shotId);
    await deleteBlob(shotId);
    if (previews[shotId]) {
      URL.revokeObjectURL(previews[shotId]);
      delete previews[shotId];
      previews = previews;
    }
    await persist();
  }

  function restoreScreenshot(shotId: string) {
    const fs = featureState();
    if (!fs) return;
    const shot = fs.screenshots.find((s) => s.id === shotId);
    if (!shot) return;
    shot.removed = false;
    fs.screenshots = fs.screenshots;
    void persist();
  }

  function setShotMeta(shotId: string, field: 'alt' | 'caption', value: string) {
    const fs = featureState();
    if (!fs) return;
    const shot = fs.screenshots.find((s) => s.id === shotId);
    if (!shot) return;
    shot[field] = value;
    fs.screenshots = fs.screenshots;
    void persist();
  }

  // True if any baseline-origin screenshot was removed, re-captioned, or any
  // brand-new screenshot was attached.
  function screenshotsChanged(fs: DraftFeatureSupport): boolean {
    return fs.screenshots.some((s) => {
      if (!s.inherited) return true; // newly attached
      if (s.removed) return true; // baseline shot dropped
      return (
        (s.alt ?? '') !== (s.inherited.alt ?? '') ||
        (s.caption ?? '') !== (s.inherited.caption ?? '')
      );
    });
  }

  function changedFromBaseline(fs: DraftFeatureSupport | undefined): boolean {
    if (!fs || !fs.inherited) return false;
    const b = fs.inherited;
    return (
      fs.support !== b.support ||
      (fs.note ?? '') !== (b.note ?? '') ||
      (fs.sourceUrl ?? '') !== (b.sourceUrl ?? '') ||
      (fs.sourceExtract ?? '') !== (b.sourceExtract ?? '') ||
      screenshotsChanged(fs)
    );
  }

  // ----- baseline references (new-version mode) ----------------------------
  // When a text field diverges from the baseline, the tunnel keeps the original
  // value visible for history. These helpers drive that reference display.

  function textChanged(current: string | undefined, base: string | undefined): boolean {
    return (current ?? '') !== (base ?? '');
  }

  $: inheritedSupport = currentSupport?.inherited;

  function shotPreview(s: DraftScreenshot): string | undefined {
    return s.baselineSrc ?? previews[s.id];
  }

  function shotAltChanged(s: DraftScreenshot): boolean {
    return Boolean(s.inherited) && textChanged(s.alt, s.inherited?.alt);
  }

  function shotCaptionChanged(s: DraftScreenshot): boolean {
    return Boolean(s.inherited) && textChanged(s.caption, s.inherited?.caption);
  }

  // ----- fullscreen preview (lightbox) -------------------------------------
  // Navigates every screenshot shown for the feature — added, inherited and
  // those flagged removed — full-size with its alt text, so each piece of
  // evidence can be inspected before exporting.

  $: featureShots = currentSupport?.screenshots ?? [];
  let lightboxIndex: number | null = null;
  $: lightboxShot =
    lightboxIndex !== null ? (featureShots[lightboxIndex] ?? null) : null;

  function openLightbox(shot: DraftScreenshot) {
    const idx = featureShots.findIndex((s) => s.id === shot.id);
    if (idx >= 0) lightboxIndex = idx;
  }

  function closeLightbox() {
    lightboxIndex = null;
  }

  function moveLightbox(direction: -1 | 1) {
    if (lightboxIndex === null || featureShots.length <= 1) return;
    lightboxIndex = (lightboxIndex + direction + featureShots.length) % featureShots.length;
  }

  function onLightboxKey(event: KeyboardEvent) {
    if (lightboxShot === null) return;
    if (event.key === 'Escape') closeLightbox();
    else if (event.key === 'ArrowLeft') moveLightbox(-1);
    else if (event.key === 'ArrowRight') moveLightbox(1);
  }

  // Single window-level keydown dispatcher (Svelte allows one <svelte:window>).
  // Lightbox navigation takes precedence while it is open; otherwise the "/"
  // shortcut focuses the feature jump field.
  function onWindowKeydown(event: KeyboardEvent) {
    if (lightboxShot !== null) {
      onLightboxKey(event);
      return;
    }
    onFeatureKey(event);
  }

  // ----- proof popup preview -----------------------------------------------
  // Renders the real `<Evidence>` ("Proof") popover for the current feature,
  // fed from the draft's current state so the contributor sees exactly how the
  // evidence will look. Removed screenshots are excluded from the carousel.

  $: proofShots = (currentSupport?.screenshots ?? [])
    .filter((s) => !s.removed)
    .map((s) => ({ src: shotPreview(s) ?? '', alt: s.alt, caption: s.caption?.trim() ? s.caption : undefined }))
    .filter((s) => s.src);
  $: proofSourceUrl = currentSupport?.sourceUrl?.trim() ?? '';
  $: proofSourceExtract = currentSupport?.sourceExtract?.trim() ?? '';
  $: proofRefLabel = draft
    ? `${draft.meta.toolId.replace(/-/g, ' ')} · ${(currentFeature?.id ?? '').replace(/-/g, ' ')}`
    : '';
  $: hasProof = proofShots.length > 0 || Boolean(proofSourceUrl) || Boolean(proofSourceExtract);
  // Rebuild the <details> whenever the evidence changes so the lazy-mounted
  // gallery (keyed off `data-shots`) never serves a stale snapshot.
  $: proofKey = `${currentFeature?.id ?? ''}|${JSON.stringify(proofShots)}|${proofSourceUrl}|${proofSourceExtract}`;

  function goPrev() {
    if (currentIndex > 0) currentIndex -= 1;
    else step = 'meta';
  }

  function goNext() {
    const fs = featureState();
    if (fs) fs.reviewed = true;
    void persist();
    if (atLast) step = 'review';
    else currentIndex += 1;
  }

  // ----- quick jump (feature search) ----------------------------------------
  // A keyword combobox that jumps straight to a feature by title. With 77
  // features across 6 categories, paging next/prev to reach a specific one is
  // tedious; this lets a contributor type "worktree" or "mcp" and land there.
  let jumpQuery = '';
  let jumpOpen = false;
  let jumpActive = 0; // index into `jumpResults` highlighted for keyboard nav
  let jumpInput: HTMLInputElement | undefined;
  const jumpListId = 'contrib-jump-list';

  type JumpHit = { feature: ContributeFeature; index: number; score: number; marks: boolean[] };

  // Score a query against a target. Higher is better; null means no match.
  // Tiers: exact > prefix > word-start > substring > subsequence (fuzzy), with
  // `marks` flagging which characters of `target` matched so we can highlight.
  function scoreMatch(target: string, q: string): { score: number; marks: boolean[] } | null {
    const t = target.toLowerCase();
    const marks = new Array(target.length).fill(false);
    if (!q) return { score: 0, marks };
    if (t === q) { marks.fill(true); return { score: 1000, marks }; }

    const idx = t.indexOf(q);
    if (idx >= 0) {
      for (let i = idx; i < idx + q.length; i++) marks[i] = true;
      // Prefix beats mid-word; a match right after a separator beats mid-token.
      const atStart = idx === 0;
      const atWord = idx > 0 && /[\s\-/]/.test(t[idx - 1]);
      return { score: atStart ? 800 : atWord ? 600 : 400, marks };
    }

    // Subsequence: every query char appears in order. Reward adjacency so
    // "gwt" on "git worktrees" still reads as a sensible, contiguous-ish hit.
    let ti = 0;
    let streak = 0;
    let bonus = 0;
    for (let qi = 0; qi < q.length; qi++) {
      let found = -1;
      for (let k = ti; k < t.length; k++) {
        if (t[k] === q[qi]) { found = k; break; }
      }
      if (found < 0) return null;
      marks[found] = true;
      streak = found === ti ? streak + 1 : 0;
      bonus += streak;
      ti = found + 1;
    }
    return { score: 100 + bonus, marks };
  }

  $: jumpResults = (() => {
    const q = jumpQuery.trim().toLowerCase();
    const hits: JumpHit[] = [];
    features.forEach((feature, index) => {
      const onLabel = scoreMatch(feature.label, q);
      // Category matches still surface the feature but never outrank a title hit.
      const onCat = scoreMatch(feature.category, q);
      if (!onLabel && !onCat) return;
      const score = onLabel ? onLabel.score : (onCat ? onCat.score / 4 : 0);
      hits.push({
        feature,
        index,
        score,
        marks: onLabel?.marks ?? new Array(feature.label.length).fill(false),
      });
    });
    // Higher score first, then keep canonical feature order for ties. We do NOT
    // cap the list: with an empty query it shows every feature (a scrollable
    // index across all categories), and a query keeps all matches ranked — so a
    // contributor never wonders whether a feature is "missing" from the results.
    hits.sort((a, b) => b.score - a.score || a.index - b.index);
    return hits;
  })();

  // Clamp the highlighted row whenever the result set shrinks/changes.
  $: if (jumpActive >= jumpResults.length) jumpActive = Math.max(0, jumpResults.length - 1);

  // Per-feature verdict glyph + state, so each suggestion doubles as a progress
  // readout (reviewed / changed / has remark) rather than a bare title.
  function jumpMeta(featureId: string) {
    const fs = draft?.features[featureId];
    return {
      support: fs?.support as SupportLevel | undefined,
      reviewed: Boolean(fs?.reviewed),
      changed: changedFromBaseline(fs),
      remark: Boolean(fs?.reviewRemark?.trim()),
    };
  }

  function openJump() {
    jumpOpen = true;
    jumpActive = 0;
  }

  function closeJump() {
    jumpOpen = false;
    jumpQuery = '';
  }

  function jumpTo(index: number) {
    if (index < 0 || index >= features.length) return;
    currentIndex = index;
    closeJump();
    jumpInput?.blur();
  }

  function onJumpKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!jumpOpen) openJump();
      else jumpActive = Math.min(jumpActive + 1, jumpResults.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      jumpActive = Math.max(jumpActive - 1, 0);
    } else if (e.key === 'Enter') {
      if (jumpOpen && jumpResults[jumpActive]) {
        e.preventDefault();
        jumpTo(jumpResults[jumpActive].index);
      }
    } else if (e.key === 'Escape') {
      if (jumpOpen) { e.preventDefault(); closeJump(); }
    }
  }

  // Global "/" shortcut to focus the jump field, like a search box on a docs
  // site — but never hijack typing already happening in another field.
  function onFeatureKey(e: KeyboardEvent) {
    if (step !== 'features') return;
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    const el = e.target as HTMLElement | null;
    const tag = el?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
    e.preventDefault();
    jumpInput?.focus();
    openJump();
  }

  // ----- review / export ----------------------------------------------------

  function validationErrors(): string[] {
    if (!draft) return ['No draft.'];
    const errs: string[] = [];
    if (!metaValid()) errs.push('Tool metadata is incomplete (name, id, homepage, version, release date, platforms).');
    // Screenshot alt/caption text is intentionally NOT required here: it can be
    // authored later during the contribution review, so missing alt text must
    // not block proposal generation.
    return errs;
  }

  $: reviewErrors = step === 'review' ? validationErrors() : [];
  // Human-readable reason the export button is disabled, so the blocker is never
  // a mystery (e.g. metadata incomplete, or consent not yet ticked).
  $: exportBlockReason = busy
    ? ''
    : reviewErrors.length > 0
      ? 'Resolve the issue(s) listed above to enable export.'
      : addedScreenshots > 0 && !screenshotConsent
        ? 'Tick the confirmation above to enable export.'
        : '';

  async function generate() {
    if (!draft) return;
    busy = true;
    error = '';
    try {
      built = await buildProposal(draft, orderedFeatureIds, featureLabels);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to build the proposal.';
    } finally {
      busy = false;
    }
  }

  function doDownloadPart(part: { blob: Blob; filename: string }) {
    downloadBlob(part.blob, part.filename);
  }

  // Fire each part with a small stagger — browsers throttle or block several
  // synchronous programmatic downloads in a row.
  function doDownloadAll() {
    if (!built) return;
    built.parts.forEach((part, i) => {
      setTimeout(() => downloadBlob(part.blob, part.filename), i * 400);
    });
  }

  async function doCopyMarkdown() {
    if (!built) return;
    copiedMd = await copyToClipboard(built.clipboardMarkdown);
    if (copiedMd) setTimeout(() => (copiedMd = false), 2500);
  }
</script>

<section class="contrib">
  {#if step === 'start'}
    <article class="contrib__panel">
      <p class="contrib__eyebrow">Contribute</p>
      <h2>Propose an orchestrator or a new version</h2>
      <p>
        Everything stays on your device (IndexedDB) until you export. At the end you get a ZIP
        (data file + screenshots, repo-relative paths) and a pre-filled GitHub issue. Nothing is
        sent to any server.
      </p>

      <div class="contrib__choice">
        <button type="button" class="contrib__cta" on:click={startNewTool}>
          <strong>New orchestrator</strong>
          <span>Describe a tool from scratch across every feature.</span>
        </button>
        <div class="contrib__cta contrib__cta--form">
          <strong>New version of an existing one</strong>
          <span>Pre-filled from the latest known version; you note what changed.</span>
          <div class="contrib__row">
            <select bind:value={selectedBaselineId} aria-label="Orchestrator">
              {#each baselines as b}
                <option value={b.toolId}>{b.toolName} (from {b.baseVersion})</option>
              {/each}
            </select>
            <button type="button" on:click={startNewVersion} disabled={!baselines.length}>Start</button>
          </div>
        </div>
      </div>
      {#if error}<p class="contrib__error">{error}</p>{/if}

      {#if existingDrafts.length}
        <div class="contrib__drafts">
          <h3>Resume a draft</h3>
          <ul>
            {#each existingDrafts as d}
              <li>
                <button type="button" class="contrib__link" on:click={() => resumeDraft(d.id)}>
                  {d.meta.toolName || 'Untitled'} {d.version || ''} · {d.mode === 'new-tool' ? 'new tool' : 'new version'}
                </button>
                <span class="contrib__muted">{d.updatedAt.slice(0, 16).replace('T', ' ')}</span>
                <button type="button" class="contrib__del" on:click={() => removeDraft(d.id)} aria-label="Delete draft">✕</button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </article>
  {:else if step === 'meta' && draft}
    <article class="contrib__panel">
      <p class="contrib__eyebrow">{draft.mode === 'new-tool' ? 'New orchestrator' : 'New version'}</p>
      <h2>Tool details</h2>
      <div class="contrib__fields">
        <label>
          <span>Tool name</span>
          <input
            type="text"
            value={draft.meta.toolName}
            readonly={draft.mode === 'new-version'}
            on:input={(e) => onToolNameInput(e.currentTarget.value)}
            placeholder="e.g. Conductor"
          />
        </label>
        <label>
          <span>Tool id <em>(lowercase, a-z 0-9 -)</em></span>
          <input
            type="text"
            value={draft.meta.toolId}
            readonly={draft.mode === 'new-version'}
            on:input={(e) => { if (draft) { draft.meta.toolId = e.currentTarget.value; void persist(); } }}
            placeholder="e.g. conductor"
          />
        </label>
        <label>
          <span>Version</span>
          <input
            type="text"
            value={draft.version}
            on:input={(e) => { if (draft) { draft.version = e.currentTarget.value; void persist(); } }}
            placeholder="e.g. 1.4.0"
          />
        </label>
        <label>
          <span>Release date</span>
          <input
            type="date"
            value={draft.releaseDate}
            on:input={(e) => { if (draft) { draft.releaseDate = e.currentTarget.value; void persist(); } }}
          />
        </label>
        <label class="contrib__wide">
          <span>Homepage</span>
          <input
            type="url"
            value={draft.meta.homepage}
            readonly={draft.mode === 'new-version'}
            on:input={(e) => { if (draft) { draft.meta.homepage = e.currentTarget.value; void persist(); } }}
            placeholder="https://…"
          />
        </label>
      </div>

      {#if draft.mode === 'new-tool'}
        <div class="contrib__fields">
          <label>
            <span>Vendor <em>(optional)</em></span>
            <input type="text" value={draft.meta.vendor ?? ''} on:input={(e) => { if (draft) { draft.meta.vendor = e.currentTarget.value; void persist(); } }} />
          </label>
          <label>
            <span>Pricing <em>(optional)</em></span>
            <select value={draft.meta.pricing ?? ''} on:change={(e) => { if (draft) { draft.meta.pricing = (e.currentTarget.value || undefined) as any; void persist(); } }}>
              <option value="">—</option>
              <option value="free">free</option>
              <option value="freemium">freemium</option>
              <option value="paid">paid</option>
              <option value="oss">oss</option>
            </select>
          </label>
          <label>
            <span>Codebase <em>(optional)</em></span>
            <select value={draft.meta.codebase ?? ''} on:change={(e) => { if (draft) { draft.meta.codebase = (e.currentTarget.value || undefined) as any; void persist(); } }}>
              <option value="">—</option>
              <option value="open-source">open-source</option>
              <option value="proprietary">proprietary</option>
            </select>
          </label>
        </div>
        <fieldset class="contrib__platforms">
          <legend>Platforms</legend>
          {#each PLATFORM_OPTIONS as p}
            <label class="contrib__check" class:contrib__check--on={draft.meta.platforms.includes(p.value)}>
              <input type="checkbox" checked={draft.meta.platforms.includes(p.value)} on:change={() => togglePlatform(p.value)} />
              <span>{p.label}</span>
            </label>
          {/each}
        </fieldset>

        <div class="contrib__tracking">
          <div class="contrib__tracking-head">
            <div>
              <span class="contrib__tracking-title">Tracking sources <em>(optional)</em></span>
              <p class="contrib__tracking-hint">
                Where should we watch for future releases of this ADE? Add its changelog, release
                notes, GitHub releases/commits, docs, RSS/Atom feed, blog… A maintainer completes
                whatever you leave out, so even one or two links help.
              </p>
            </div>
            <button type="button" class="contrib__ghost contrib__tracking-add" on:click={addTrackingSource}>+ Add source</button>
          </div>
          {#each draft.meta.trackingSources ?? [] as src, i (i)}
            <div class="contrib__tracking-row">
              <select
                aria-label="Source kind"
                value={src.kind}
                on:change={(e) => setTrackingField(i, 'kind', e.currentTarget.value)}
              >
                {#each TRACKING_KIND_OPTIONS as opt}
                  <option value={opt.value}>{opt.label}</option>
                {/each}
              </select>
              <input
                type="text"
                placeholder="Label (e.g. Conductor changelog)"
                value={src.label}
                on:input={(e) => setTrackingField(i, 'label', e.currentTarget.value)}
              />
              <input
                type="url"
                placeholder="https://…"
                value={src.url}
                on:input={(e) => setTrackingField(i, 'url', e.currentTarget.value)}
              />
              <button type="button" class="contrib__del" on:click={() => removeTrackingSource(i)} aria-label="Remove tracking source">✕</button>
            </div>
          {/each}
        </div>
      {:else}
        <p class="contrib__muted">
          Metadata inherited from {draft.meta.toolName} {draft.baseVersion}. Adjust the version and
          release date above; per-feature changes come next.
        </p>
      {/if}

      <div class="contrib__actions">
        <button type="button" class="contrib__ghost" on:click={() => (step = 'start')}>Back</button>
        <button type="button" on:click={goToFeatures}>Review features →</button>
      </div>
      {#if error}<p class="contrib__error">{error}</p>{/if}
    </article>
  {:else if step === 'features' && draft && currentFeature}
    <div class="contrib__progress">
      <span class="contrib__reviewed">{reviewedCount} / {features.length} reviewed</span>

      <!-- Jump-to-feature combobox: type a keyword, land on the matching feature.
           Doubles as a progress map — each row shows that feature's verdict glyph
           and review state. Sits between the counter and the prev/next nav. -->
      <div class="contrib__jump" class:contrib__jump--open={jumpOpen}>
        <span class="contrib__jump-icon" aria-hidden="true">⌕</span>
        <input
          bind:this={jumpInput}
          type="text"
          class="contrib__jump-input"
          placeholder="Jump to a feature…"
          autocomplete="off"
        spellcheck="false"
        role="combobox"
        aria-expanded={jumpOpen}
        aria-controls={jumpListId}
        aria-autocomplete="list"
        aria-activedescendant={jumpOpen && jumpResults[jumpActive] ? `contrib-jump-opt-${jumpResults[jumpActive].index}` : undefined}
        bind:value={jumpQuery}
        on:focus={openJump}
        on:input={openJump}
        on:keydown={onJumpKeydown}
        on:blur={closeJump}
      />
      {#if jumpQuery}
        <kbd class="contrib__jump-hint">↵ go</kbd>
      {:else}
        <kbd class="contrib__jump-hint">/</kbd>
      {/if}

      {#if jumpOpen}
        <ul class="contrib__jump-list" id={jumpListId} role="listbox" aria-label="Matching features">
          {#each jumpResults as hit, i (hit.feature.id)}
            {@const meta = jumpMeta(hit.feature.id)}
            <li
              id={`contrib-jump-opt-${hit.index}`}
              role="option"
              aria-selected={i === jumpActive}
              class="contrib__jump-opt"
              class:contrib__jump-opt--active={i === jumpActive}
              class:contrib__jump-opt--current={hit.index === currentIndex}
              class:contrib__jump-opt--yes={meta.support === 'yes'}
              class:contrib__jump-opt--partial={meta.support === 'partial'}
              class:contrib__jump-opt--no={meta.support === 'no'}
              class:contrib__jump-opt--unknown={!meta.support || meta.support === 'unknown'}
            >
              <!-- Mousedown (not click) so selection wins the race against the
                   input's blur, which would otherwise close the list first. -->
              <button type="button" on:mousedown|preventDefault={() => jumpTo(hit.index)} on:mouseenter={() => (jumpActive = i)}>
                <span
                  class="contrib__jump-glyph"
                  class:contrib__jump-glyph--reviewed={meta.reviewed}
                  class:contrib__glyph--yes={meta.support === 'yes'}
                  class:contrib__glyph--no={meta.support === 'no'}
                  class:contrib__glyph--partial={meta.support === 'partial'}
                  class:contrib__glyph--unknown={meta.support === 'unknown' || !meta.support}
                  aria-hidden="true"
                >{meta.support ? SUPPORT_GLYPH[meta.support] : '·'}</span>
                <span class="contrib__jump-text">
                  <span class="contrib__jump-label">
                    {#each hit.feature.label.split('') as ch, ci}{#if hit.marks[ci]}<mark>{ch}</mark>{:else}{ch}{/if}{/each}
                  </span>
                  <span class="contrib__jump-cat">{hit.feature.category}</span>
                </span>
                <span class="contrib__jump-tags">
                  {#if meta.changed}<span class="contrib__jump-tag contrib__jump-tag--changed">changed</span>{/if}
                  {#if meta.remark}<span class="contrib__jump-tag contrib__jump-tag--remark">remark</span>{/if}
                  <span class="contrib__jump-num">#{hit.index + 1}</span>
                </span>
              </button>
            </li>
          {:else}
            <li class="contrib__jump-empty" role="presentation">
              No feature matches “{jumpQuery}”.
            </li>
          {/each}
        </ul>
      {/if}
      </div>

      <nav class="contrib__nav">
        <button type="button" class="contrib__step" on:click={goPrev} aria-label="Previous">‹</button>
        <span class="contrib__pos">#{currentIndex + 1}</span>
        <button type="button" class="contrib__step" on:click={goNext} aria-label="Next">›</button>
      </nav>
    </div>

    <div class="contrib__bar"><i style={`width: ${Math.round(((currentIndex + 1) / features.length) * 100)}%`}></i></div>

    <article class="contrib__panel">
      <div class="contrib__feature-head">
        <p class="contrib__eyebrow">
          {currentFeature.category}
          {#if changedFromBaseline(currentSupport)}<span class="contrib__badge">changed</span>{/if}
          {#if currentSupport?.reviewRemark?.trim()}<span class="contrib__badge contrib__badge--remark">remark</span>{/if}
        </p>
        {#if hasProof}
          {#key proofKey}
            <ProofPreview
              refLabel={proofRefLabel}
              shots={proofShots}
              sourceUrl={proofSourceUrl}
              sourceExtract={proofSourceExtract}
            />
          {/key}
        {/if}
      </div>
      <h2>{currentFeature.label}</h2>
      <p>{currentFeature.longDescription ?? currentFeature.shortDescription}</p>

      {#if currentSupport?.inherited}
        <p class="contrib__inherited">
          <span class="contrib__inherited-label">Baseline ({draft.baseVersion})</span>
          <span class="contrib__verdict contrib__verdict--{currentSupport.inherited.support}">
            <span class="contrib__glyph contrib__glyph--{currentSupport.inherited.support}" aria-hidden="true">{SUPPORT_GLYPH[currentSupport.inherited.support]}</span>
            {SUPPORT_OPTIONS.find((o) => o.value === currentSupport.inherited?.support)?.label}
          </span>
          {#if currentSupport.inherited.support !== currentSupport.support}
            <span class="contrib__inherited-arrow" aria-hidden="true">→</span>
            <span class="contrib__verdict contrib__verdict--{currentSupport.support}">
              <span class="contrib__glyph contrib__glyph--{currentSupport.support}" aria-hidden="true">{SUPPORT_GLYPH[currentSupport.support]}</span>
              {SUPPORT_OPTIONS.find((o) => o.value === currentSupport?.support)?.label}
            </span>
          {/if}
        </p>
      {/if}

      <div class="contrib__support" role="group" aria-label="Support level">
        {#each SUPPORT_OPTIONS as opt}
          <button
            type="button"
            class="contrib__toggle contrib__toggle--{opt.value}"
            class:contrib__toggle--on={currentSupport?.support === opt.value}
            aria-pressed={currentSupport?.support === opt.value}
            on:click={() => setSupport(opt.value)}
          >
            <span class="contrib__glyph contrib__glyph--{opt.value}" aria-hidden="true">{SUPPORT_GLYPH[opt.value]}</span>
            {opt.label}
          </button>
        {/each}
      </div>

      <div class="contrib__fields">
        <label class="contrib__wide">
          <span>Note <em>(optional, ≤ 280 chars)</em></span>
          <textarea
            rows="2"
            maxlength="280"
            value={currentSupport?.note ?? ''}
            on:input={(e) => setField('note', e.currentTarget.value)}
          ></textarea>
          {#if inheritedSupport && textChanged(currentSupport?.note, inheritedSupport.note)}
            <ContributeDiff baseline={inheritedSupport.note} current={currentSupport?.note} label={`vs baseline (${draft.baseVersion})`} />
          {/if}
        </label>
        <label class="contrib__wide">
          <span>Source URL <em>(optional)</em></span>
          <input type="url" value={currentSupport?.sourceUrl ?? ''} on:input={(e) => setField('sourceUrl', e.currentTarget.value)} placeholder="https://…" />
          {#if inheritedSupport && textChanged(currentSupport?.sourceUrl, inheritedSupport.sourceUrl)}
            <ContributeDiff baseline={inheritedSupport.sourceUrl} current={currentSupport?.sourceUrl} label={`vs baseline (${draft.baseVersion})`} />
          {/if}
        </label>
        <label class="contrib__wide">
          <span>Source extract <em>(optional quote)</em></span>
          <textarea rows="2" value={currentSupport?.sourceExtract ?? ''} on:input={(e) => setField('sourceExtract', e.currentTarget.value)}></textarea>
          {#if inheritedSupport && textChanged(currentSupport?.sourceExtract, inheritedSupport.sourceExtract)}
            <ContributeDiff baseline={inheritedSupport.sourceExtract} current={currentSupport?.sourceExtract} label={`vs baseline (${draft.baseVersion})`} />
          {/if}
        </label>
      </div>

      <div
        class="contrib__shots"
        class:contrib__shots--drag={dragOver}
        role="group"
        aria-label="Screenshots"
        on:dragover={onDragOver}
        on:dragleave={onDragLeave}
        on:drop={onDrop}
      >
        <div class="contrib__shots-head">
          <span>Screenshots</span>
          <label class="contrib__upload">
            <input type="file" accept="image/*" multiple on:change={onFiles} />
            <span>+ Add</span>
          </label>
        </div>
        <label class="contrib__dropzone">
          <input type="file" accept="image/*" multiple on:change={onFiles} />
          <span>{dragOver ? 'Drop images here' : 'Drag & drop or paste screenshots here, or click to browse'}</span>
        </label>
        {#if (currentSupport?.screenshots?.filter(isUserAdded).length ?? 0) > 0}
          <p class="contrib__warn" role="alert">
            <strong>⚠ Heads up — these screenshots may become public.</strong>
            Anything you attach can end up in a public GitHub issue and repository. Double-check that
            none of them expose sensitive data (credentials, API keys, tokens, personal info, private URLs,
            internal hostnames…). Crop or redact before submitting.
          </p>
        {/if}
        {#each currentSupport?.screenshots ?? [] as shot (shot.id)}
          {#if shot.removed}
            <div class="contrib__shot contrib__shot--removed">
              {#if shot.baselineSrc}
                <button type="button" class="contrib__shot-zoom" on:click={() => openLightbox(shot)} aria-label="View removed screenshot full screen">
                  <img src={shot.baselineSrc} alt={shot.inherited?.alt || 'removed screenshot'} />
                </button>
              {/if}
              <div class="contrib__shot-meta">
                <code>{shot.filename}</code>
                <p class="contrib__removed-trace" role="status">
                  <strong>Removed vs baseline ({draft.baseVersion}).</strong>
                  This screenshot will be dropped from {draft.meta.toolName} {draft.version}.
                </p>
              </div>
              <button type="button" class="contrib__ghost contrib__restore" on:click={() => restoreScreenshot(shot.id)}>Restore</button>
            </div>
          {:else}
            <div class="contrib__shot" class:contrib__shot--baseline={shot.baselineSrc}>
              {#if shotPreview(shot)}
                <button type="button" class="contrib__shot-zoom" on:click={() => openLightbox(shot)} aria-label="View screenshot full screen">
                  <img src={shotPreview(shot)} alt={shot.alt || 'screenshot preview'} />
                </button>
              {/if}
              <div class="contrib__shot-meta">
                <code>
                  {shot.filename}{#if shot.baselineSrc} <span class="contrib__shot-tag">from baseline</span>{/if}
                </code>
                <input
                  type="text"
                  placeholder="Alt text (optional — can be written during review)"
                  value={shot.alt}
                  on:input={(e) => setShotMeta(shot.id, 'alt', e.currentTarget.value)}
                />
                {#if shotAltChanged(shot)}
                  <ContributeDiff baseline={shot.inherited?.alt} current={shot.alt} label="vs baseline alt" />
                {/if}
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={shot.caption ?? ''}
                  on:input={(e) => setShotMeta(shot.id, 'caption', e.currentTarget.value)}
                />
                {#if shotCaptionChanged(shot)}
                  <ContributeDiff baseline={shot.inherited?.caption} current={shot.caption} label="vs baseline caption" />
                {/if}
              </div>
              <button type="button" class="contrib__del" on:click={() => removeScreenshot(shot.id)} aria-label={shot.baselineSrc ? 'Remove baseline screenshot' : 'Remove screenshot'}>✕</button>
            </div>
          {/if}
        {/each}
      </div>

      <div class="contrib__remark">
        <label>
          <span class="contrib__remark-head">
            Review remark
            <em>for the reviewer — not exported</em>
          </span>
          <textarea
            rows="3"
            placeholder="e.g. the docs look stale on this feature — please re-scan and maybe add https://… to this ADE's source list before merging."
            value={currentSupport?.reviewRemark ?? ''}
            on:input={(e) => setField('reviewRemark', e.currentTarget.value)}
          ></textarea>
        </label>
        <p class="contrib__remark-hint">
          Kept out of the ZIP and the dataset. Copied (under this feature) into the summary you paste
          in the GitHub issue, so a maintainer knows what to double-check.
        </p>
      </div>

      <div class="contrib__actions">
        <button type="button" class="contrib__ghost" on:click={goPrev}>← Previous</button>
        <button type="button" class="contrib__ghost" on:click={() => (step = 'review')}>Skip to export</button>
        <button type="button" on:click={goNext}>{atLast ? 'Done →' : 'Next →'}</button>
      </div>
    </article>
  {:else if step === 'review' && draft}
    <article class="contrib__panel">
      <p class="contrib__eyebrow">Export</p>
      <h2>{draft.meta.toolName} {draft.version}</h2>
      <p>{reviewedCount} / {features.length} features reviewed · {draft.mode === 'new-tool' ? 'new orchestrator' : `new version (base ${draft.baseVersion})`}</p>

      {#if reviewErrors.length}
        <ul class="contrib__errlist">
          {#each reviewErrors as e}<li>{e}</li>{/each}
        </ul>
      {/if}

      {#if addedScreenshots > 0 && !built}
        <div class="contrib__warn" role="alert">
          <strong>⚠ Before you export — {addedScreenshots} screenshot(s) you added will be bundled.</strong>
          They are meant to be attached to a public GitHub issue and can end up in a public repository.
          Make sure none of them expose sensitive data (credentials, API keys, tokens, personal info,
          private URLs, internal hostnames…). Crop or redact anything questionable before submitting.
          <label class="contrib__consent">
            <input type="checkbox" bind:checked={screenshotConsent} />
            <span>I confirm the screenshots I added contain no sensitive data and can be made public.</span>
          </label>
        </div>
      {/if}

      <div class="contrib__actions">
        <button type="button" class="contrib__ghost" on:click={() => (step = 'features')}>← Back to features</button>
        <button
          type="button"
          on:click={generate}
          disabled={busy || reviewErrors.length > 0 || (addedScreenshots > 0 && !screenshotConsent)}
        >
          {busy ? 'Building…' : 'Generate proposal'}
        </button>
      </div>

      {#if exportBlockReason && !built}
        <p class="contrib__muted">{exportBlockReason}</p>
      {/if}

      {#if built}
        <div class="contrib__result">
          <p>
            Bundle ready: {built.screenshotCount} screenshot(s)
            {#if draft.mode === 'new-version'}· {built.changedCount} changed feature(s){/if}
            {#if built.remarkCount > 0}· {built.remarkCount} review remark(s){/if}.
          </p>
          {#if built.parts.length > 1}
            <div class="contrib__warn" role="status">
              <strong>⚠ Split into {built.parts.length} ZIPs.</strong>
              The bundle was over GitHub's 25 MB attachment limit, so the screenshots were
              spread across {built.parts.length} parts. Download and attach <strong>all</strong> of them
              to the issue — each part unzips at the repo root and they complement each other.
            </div>
            <div class="contrib__actions contrib__actions--start">
              <button type="button" on:click={doDownloadAll}>⬇ Download all {built.parts.length} ZIPs</button>
            </div>
            <ul class="contrib__partlist">
              {#each built.parts as part}
                <li>
                  <button type="button" class="contrib__ghost" on:click={() => doDownloadPart(part)}>⬇ {part.filename}</button>
                </li>
              {/each}
            </ul>
            <div class="contrib__actions contrib__actions--start">
              <button type="button" class="contrib__ghost" on:click={doCopyMarkdown}>{copiedMd ? '✓ Copied' : 'Copy summary (Markdown)'}</button>
              <a class="contrib__ghost contrib__linkbtn" href={built.issueUrl} target="_blank" rel="noreferrer">Open GitHub issue ↗</a>
            </div>
          {:else}
            <div class="contrib__actions contrib__actions--start">
              <button type="button" on:click={() => doDownloadPart(built.parts[0])}>⬇ Download ZIP</button>
              <button type="button" class="contrib__ghost" on:click={doCopyMarkdown}>{copiedMd ? '✓ Copied' : 'Copy summary (Markdown)'}</button>
              <a class="contrib__ghost contrib__linkbtn" href={built.issueUrl} target="_blank" rel="noreferrer">Open GitHub issue ↗</a>
            </div>
          {/if}
          <p class="contrib__muted">
            Unzip {built.parts.length > 1 ? 'all parts' : ''} at the repo root, then open the issue and paste the copied summary into the
            "Generated payload" field (and drag the screenshots in if you like).
            {#if built.remarkCount > 0}
              The copied summary includes your {built.remarkCount} review remark(s); the ZIP does not.
            {/if}
          </p>
        </div>
      {/if}
      {#if error}<p class="contrib__error">{error}</p>{/if}
    </article>
  {/if}
</section>

{#if lightboxShot}
  <div class="contrib__lightbox" role="dialog" aria-modal="true" aria-label="Screenshot preview">
    <button class="contrib__lightbox-backdrop" type="button" aria-label="Close preview" on:click={closeLightbox}></button>
    <div class="contrib__lightbox-panel" role="document">
      {#if shotPreview(lightboxShot)}
        <img src={shotPreview(lightboxShot)} alt={lightboxShot.alt || 'screenshot preview'} />
      {/if}
      <div class="contrib__lightbox-meta">
        {#if lightboxShot.removed}
          <p class="contrib__lightbox-removed">⛔ Removed vs baseline ({draft?.baseVersion})</p>
        {/if}
        <p class="contrib__lightbox-alt">{lightboxShot.alt?.trim() ? lightboxShot.alt : '⚠ No alt text yet'}</p>
        {#if lightboxShot.caption?.trim()}<p class="contrib__lightbox-caption">{lightboxShot.caption}</p>{/if}
        <code>{lightboxShot.filename}</code>
      </div>
      {#if featureShots.length > 1}
        <div class="contrib__lightbox-nav">
          <button type="button" on:click={() => moveLightbox(-1)} aria-label="Previous screenshot">‹</button>
          <span>{(lightboxIndex ?? 0) + 1} / {featureShots.length}</span>
          <button type="button" on:click={() => moveLightbox(1)} aria-label="Next screenshot">›</button>
        </div>
      {/if}
      <button type="button" class="contrib__ghost" on:click={closeLightbox}>Close</button>
    </div>
  </div>
{/if}

<svelte:window on:keydown={onWindowKeydown} on:paste={onPaste} />

<style>
  .contrib { max-width: min(900px, 100%); margin: 0 auto; display: grid; gap: 16px; }
  /* Grid items default to min-width:auto (their min-content); a wide panel would
     then stretch the column past a narrow viewport and overflow the page. Letting
     them shrink keeps the tunnel within the screen on mobile. */
  .contrib > * { min-width: 0; }
  .contrib__panel {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-elev);
    padding: clamp(18px, 4vw, 30px);
    box-shadow: var(--shadow-card);
  }
  .contrib__eyebrow {
    margin: 0 0 10px;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font: 700 0.75rem var(--font-display);
  }
  /* Feature-level header: category on the left, "Preview proof popup" on the
     right so it reads as previewing the whole feature evidence, not just the
     screenshots section. */
  .contrib__feature-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .contrib__feature-head .contrib__eyebrow { margin-bottom: 10px; }
  @media (max-width: 560px) {
    .contrib__feature-head { flex-direction: column; }
  }
  h2 { margin: 0 0 12px; font: 900 clamp(1.6rem, 4vw, 2.4rem)/0.98 var(--font-display); text-transform: uppercase; }
  h3 { font: 800 1.1rem var(--font-display); margin: 0 0 8px; }
  p { color: var(--fg-soft); }
  .contrib__muted { color: var(--fg-muted); font-size: 0.85rem; }

  .contrib__choice { display: grid; gap: 12px; margin-top: 18px; grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { .contrib__choice { grid-template-columns: 1fr; } }
  .contrib__cta {
    display: flex; flex-direction: column; gap: 6px; text-align: left;
    border: 1px solid var(--border); border-radius: var(--radius-md);
    background: var(--bg-row); color: var(--fg); padding: 16px; cursor: pointer; font: inherit;
  }
  .contrib__cta:hover { border-color: var(--accent); }
  .contrib__cta--form { cursor: default; }
  .contrib__cta strong { font: 800 1.05rem var(--font-display); letter-spacing: 0.04em; }
  .contrib__cta span { color: var(--fg-muted); font-size: 0.9rem; }
  .contrib__row { display: flex; gap: 8px; margin-top: 8px; }
  .contrib__row select { flex: 1 1 auto; }

  .contrib__fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; margin-top: 16px; }
  .contrib__fields label { display: grid; gap: 4px; font-size: 0.85rem; color: var(--fg-soft); }
  .contrib__fields label em { color: var(--fg-muted); font-style: normal; }
  .contrib__wide { grid-column: 1 / -1; }
  @media (max-width: 560px) { .contrib__fields { grid-template-columns: minmax(0, 1fr); } }

  input, select, textarea {
    border: 1px solid var(--border); border-radius: var(--radius-md);
    background: var(--bg-row); color: var(--fg); padding: 9px 11px; font: inherit;
  }
  input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent); }
  input[readonly] { opacity: 0.6; }

  .contrib__platforms { margin-top: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
  .contrib__platforms legend { padding: 0 6px; color: var(--fg-soft); font-size: 0.8rem; }
  .contrib__check, .contrib__upload {
    display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px;
    border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-row);
    color: var(--fg); cursor: pointer; font-weight: 700; font-size: 0.85rem;
  }
  .contrib__check--on { border-color: var(--accent); background: color-mix(in oklch, var(--accent) 14%, var(--bg-row)); }
  .contrib__check input, .contrib__upload input { accent-color: var(--accent); }
  .contrib__upload input { display: none; }

  /* Tracking sources — the contributor's watch list for future releases. */
  .contrib__tracking { margin-top: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 14px; display: grid; gap: 10px; }
  .contrib__tracking-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .contrib__tracking-title { font-weight: 700; color: var(--fg-soft); font-size: 0.85rem; }
  .contrib__tracking-title em { color: var(--fg-muted); font-style: normal; }
  .contrib__tracking-hint { margin: 4px 0 0; color: var(--fg-muted); font-size: 0.78rem; line-height: 1.45; }
  .contrib__tracking-add { min-height: 34px; padding: 6px 12px; font-size: 0.8rem; flex: none; }
  .contrib__tracking-row { display: grid; grid-template-columns: minmax(0, 0.7fr) minmax(0, 1fr) minmax(0, 1.4fr) auto; gap: 8px; align-items: center; }
  @media (max-width: 560px) { .contrib__tracking-row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }

  .contrib__support { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .contrib__toggle {
    display: inline-flex; align-items: center; gap: 8px;
    min-width: 84px; border: 1px solid var(--border); border-radius: var(--radius-md);
    background: var(--bg-row); color: var(--fg-muted); padding: 10px 16px; font: inherit; font-weight: 800; cursor: pointer;
    transition: border-color 140ms ease, background 140ms ease, color 140ms ease;
  }
  .contrib__toggle:hover { color: var(--fg); }
  /* Selected verdict adopts its own support-cell colour, echoing the grid. */
  .contrib__toggle--on { color: var(--fg); }
  .contrib__toggle--yes.contrib__toggle--on     { border-color: var(--cell-yes-ink);     background: color-mix(in oklch, var(--cell-yes) 60%, var(--bg)); }
  .contrib__toggle--no.contrib__toggle--on      { border-color: var(--cell-no-ink);      background: color-mix(in oklch, var(--cell-no) 55%, var(--bg)); }
  .contrib__toggle--partial.contrib__toggle--on { border-color: var(--cell-partial-ink); background: color-mix(in oklch, var(--cell-partial) 55%, var(--bg)); }
  .contrib__toggle--unknown.contrib__toggle--on { border-color: var(--cell-unknown-ink); background: color-mix(in oklch, var(--cell-unknown) 70%, var(--bg)); }

  /* Status glyphs reused from the comparison grid (●/◐/○/?). */
  .contrib__glyph { font: 1.25rem/1 var(--font-body); }
  .contrib__glyph--yes     { color: var(--cell-yes-ink); }
  .contrib__glyph--no      { color: var(--cell-no-ink); }
  .contrib__glyph--partial { color: var(--cell-partial-ink); }
  .contrib__glyph--unknown { color: var(--cell-unknown-ink); font-size: 1rem; font-weight: 800; }

  .contrib__inherited { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding: 8px 12px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); background: var(--bg-row); font-size: 0.85rem; }
  .contrib__inherited-label { color: var(--fg-muted); font-weight: 700; }
  .contrib__inherited-arrow { color: var(--fg-muted); font-weight: 800; }
  .contrib__verdict { display: inline-flex; align-items: center; gap: 6px; font-weight: 800; }
  .contrib__verdict--yes     { color: var(--cell-yes-ink); }
  .contrib__verdict--no      { color: var(--cell-no-ink); }
  .contrib__verdict--partial { color: var(--cell-partial-ink); }
  .contrib__verdict--unknown { color: var(--cell-unknown-ink); }
  .contrib__verdict .contrib__glyph { font-size: 1rem; }

  /* Review remark — visually set apart from the data fields so it reads as a
     note to the maintainer that never ships in the export. */
  .contrib__remark {
    margin-top: 16px; padding: 12px 14px; display: grid; gap: 6px;
    border: 1px dashed var(--border-strong); border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--accent) 5%, var(--bg-row));
  }
  .contrib__remark label { display: grid; gap: 4px; font-size: 0.85rem; color: var(--fg-soft); }
  .contrib__remark-head { display: flex; align-items: baseline; gap: 8px; font-weight: 700; }
  .contrib__remark-head em { color: var(--fg-muted); font-style: normal; font-weight: 600; font-size: 0.78rem; }
  .contrib__remark-hint { margin: 0; color: var(--fg-muted); font-size: 0.78rem; line-height: 1.45; }

  .contrib__shots { margin-top: 18px; min-width: 0; border-top: 1px solid var(--border-soft); padding-top: 14px; display: grid; gap: 12px; border-radius: var(--radius-md); transition: background 140ms ease; }
  .contrib__shots--drag { background: color-mix(in oklch, var(--accent) 12%, transparent); outline: 2px dashed var(--accent); outline-offset: 4px; }
  .contrib__shots-head { display: flex; align-items: center; justify-content: space-between; font-weight: 700; color: var(--fg-soft); }
  .contrib__dropzone {
    display: flex; align-items: center; justify-content: center; text-align: center;
    border: 1px dashed var(--border-strong); border-radius: var(--radius-md);
    padding: 16px; color: var(--fg-muted); font-size: 0.85rem; cursor: pointer;
    transition: border-color 140ms ease, color 140ms ease;
  }
  .contrib__dropzone:hover { border-color: var(--accent); color: var(--fg-soft); }
  .contrib__dropzone input { display: none; }
  .contrib__shot { display: grid; grid-template-columns: 96px minmax(0, 1fr) auto; gap: 12px; align-items: start; border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: 10px; }
  .contrib__shot img { width: 96px; height: 64px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); }
  .contrib__shot-meta { display: grid; gap: 6px; min-width: 0; }
  .contrib__shot-meta input { width: 100%; min-width: 0; }
  .contrib__shot-meta code { font-size: 0.72rem; color: var(--fg-muted); word-break: break-all; }
  /* Reset the global button styling so the thumbnail stays a plain zoom target. */
  .contrib__shot-zoom {
    padding: 0; border: 0; background: none; min-height: 0; cursor: zoom-in;
    border-radius: var(--radius-sm); display: block; width: 96px;
  }
  .contrib__shot-zoom:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .contrib__shot--baseline { border-left: 3px solid var(--border-strong); }
  .contrib__shot-tag {
    display: inline-block; padding: 1px 6px; border-radius: 999px; font-size: 0.62rem; letter-spacing: 0.08em;
    text-transform: uppercase; font-weight: 800; background: var(--bg); border: 1px solid var(--border); color: var(--fg-soft);
  }
  /* Explicit trace of a baseline screenshot the contributor removed. */
  .contrib__shot--removed { border-color: var(--cell-no); border-left: 3px solid var(--cell-no); background: color-mix(in oklch, var(--cell-no) 8%, transparent); }
  .contrib__shot--removed img { opacity: 0.4; filter: grayscale(1); }
  .contrib__removed-trace { margin: 0; font-size: 0.8rem; color: var(--fg-soft); line-height: 1.45; }
  .contrib__removed-trace strong { color: var(--cell-no-ink); }
  .contrib__restore { min-height: 32px; align-self: center; padding: 6px 12px; font-size: 0.8rem; }

  .contrib__actions { margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
  .contrib__actions--start { justify-content: flex-start; }
  button, .contrib__linkbtn {
    display: inline-flex; align-items: center; justify-content: center; min-height: 42px;
    border: 1px solid var(--accent); border-radius: var(--radius-md);
    background: var(--accent); color: var(--bg); padding: 10px 16px; font: inherit; font-weight: 800; cursor: pointer; text-decoration: none;
  }
  .contrib__ghost { border-color: var(--border); background: var(--bg-row); color: var(--fg); }
  button:disabled { cursor: not-allowed; opacity: 0.45; }

  .contrib__progress { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: var(--fg-soft); font-weight: 700; }
  .contrib__reviewed { flex: none; white-space: nowrap; }
  /* On a roomy row the search occupies the centre; on narrow screens it drops to
     its own full-width line below the counter + prev/next nav. */
  @media (max-width: 560px) {
    .contrib__reviewed { order: 1; }
    .contrib__progress .contrib__nav { order: 2; margin-left: auto; }
    .contrib__progress .contrib__jump { order: 3; flex-basis: 100%; }
  }
  .contrib__nav { display: inline-flex; align-items: center; gap: 4px; flex: none; }
  .contrib__pos { min-width: 3ch; text-align: center; font-variant-numeric: tabular-nums; color: var(--fg-muted); font-size: 0.85rem; }
  .contrib__step { min-height: 30px; min-width: 30px; padding: 0; border: 1px solid var(--border); background: var(--bg-row); color: var(--fg); font: 700 1.1rem/1 var(--font-display); }
  .contrib__bar { height: 8px; border-radius: 999px; background: var(--bg-row); overflow: hidden; border: 1px solid var(--border); }
  .contrib__bar i { display: block; height: 100%; background: var(--accent); transition: width 280ms ease; }
  .contrib__badge { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: color-mix(in oklch, var(--cell-partial) 40%, transparent); border: 1px solid var(--cell-partial); color: var(--cell-partial-ink); font-size: 0.7rem; letter-spacing: 0.1em; }
  .contrib__badge--remark { background: color-mix(in oklch, var(--accent) 22%, transparent); border-color: var(--accent); color: var(--accent); }

  /* ----- jump-to-feature combobox (centre of the progress row) ------------- */
  .contrib__jump { position: relative; flex: 1 1 220px; min-width: 0; display: flex; align-items: center; }
  .contrib__jump-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--fg-muted); font-size: 1rem; line-height: 1; pointer-events: none;
  }
  .contrib__jump-input {
    flex: 1 1 auto; width: 100%; padding: 8px 44px 8px 33px;
    background: var(--bg-elev); border: 1px solid var(--border);
    font-size: 0.9rem; font-weight: 400; transition: border-color 140ms ease, background 140ms ease;
  }
  .contrib__jump-input::placeholder { color: var(--fg-faint); }
  .contrib__jump-input:focus { border-color: var(--accent); background: var(--bg-row); }
  /* Square off the bottom corners while the list is open so input + list read
     as one attached surface. */
  .contrib__jump--open .contrib__jump-input { border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-color: var(--accent); }
  .contrib__jump-hint {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    padding: 2px 7px; border-radius: var(--radius-sm); border: 1px solid var(--border);
    background: var(--bg); color: var(--fg-muted); font: 700 0.7rem var(--font-body);
    letter-spacing: 0.04em; pointer-events: none;
  }

  .contrib__jump-list {
    position: absolute; z-index: 30; top: calc(100% - 1px); left: 0; right: 0;
    margin: 0; padding: 4px; list-style: none; display: grid; gap: 2px;
    max-height: min(46vh, 360px); overflow-y: auto;
    background: var(--bg-elev); border: 1px solid var(--accent);
    border-top-color: var(--border-soft);
    border-bottom-left-radius: var(--radius-md); border-bottom-right-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
  }
  .contrib__jump-opt { margin: 0; }
  /* Each option is a full-width plain button; reset the global accent button. */
  .contrib__jump-opt button {
    width: 100%; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px;
    min-height: 0; padding: 9px 11px; text-align: left;
    /* Each row is tinted by its support verdict (--row-tint set per status
       below), turning the list into a colour-coded status map. Tints mix into
       transparent (not a surface) so the verdict hue is preserved exactly —
       mixing into bg-row would drift the hue across the oklch wheel. */
    background: color-mix(in oklch, var(--row-tint, transparent) 15%, transparent);
    border: 1px solid transparent; border-radius: var(--radius-sm);
    color: var(--fg); font: inherit; cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease;
  }
  /* Status palette: the vivid -ink hues (not the dark cell fills) so the row
     reads clearly as green / yellow / red / grey at a glance. */
  .contrib__jump-opt--yes     { --row-tint: var(--cell-yes-ink); }
  .contrib__jump-opt--partial { --row-tint: var(--cell-partial-ink); }
  .contrib__jump-opt--no      { --row-tint: var(--cell-no-ink); }
  .contrib__jump-opt--unknown { --row-tint: var(--cell-unknown-ink); }
  .contrib__jump-opt button:hover,
  .contrib__jump-opt--active button {
    background: color-mix(in oklch, var(--row-tint, var(--fg-faint)) 30%, transparent);
    border-color: color-mix(in oklch, var(--row-tint, var(--border)) 55%, var(--border));
  }
  .contrib__jump-opt--current button { box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--accent) 55%, transparent); }

  .contrib__jump-glyph {
    width: 1.4rem; text-align: center; font: 1.1rem/1 var(--font-body);
    color: var(--fg-faint); opacity: 0.6;
  }
  /* A reviewed feature reads at full strength; unreviewed stays dim. */
  .contrib__jump-glyph--reviewed { opacity: 1; }
  .contrib__jump-text { display: grid; gap: 1px; min-width: 0; }
  .contrib__jump-label {
    font: 700 0.95rem var(--font-body); color: var(--fg);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .contrib__jump-label mark { background: color-mix(in oklch, var(--accent) 32%, transparent); color: var(--fg); border-radius: 2px; }
  .contrib__jump-cat { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-muted); }
  .contrib__jump-tags { display: inline-flex; align-items: center; gap: 6px; }
  .contrib__jump-tag {
    padding: 1px 7px; border-radius: 999px; font: 800 0.62rem var(--font-body);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .contrib__jump-tag--changed { background: color-mix(in oklch, var(--cell-partial) 40%, transparent); border: 1px solid var(--cell-partial); color: var(--cell-partial-ink); }
  .contrib__jump-tag--remark { background: color-mix(in oklch, var(--accent) 22%, transparent); border: 1px solid var(--accent); color: var(--accent); }
  .contrib__jump-num { font-variant-numeric: tabular-nums; color: var(--fg-faint); font-size: 0.78rem; font-weight: 700; }
  .contrib__jump-empty { padding: 14px 12px; color: var(--fg-muted); font-size: 0.88rem; }

  .contrib__drafts { margin-top: 22px; border-top: 1px solid var(--border-soft); padding-top: 14px; }
  .contrib__drafts ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  .contrib__drafts li { display: flex; align-items: center; gap: 10px; }
  .contrib__link { background: none; border: none; color: var(--canvas); padding: 4px 0; min-height: 0; font-weight: 700; cursor: pointer; }
  .contrib__link:hover { color: var(--accent); }
  .contrib__del { min-height: 26px; min-width: 26px; padding: 0; border: 1px solid var(--border); background: var(--bg-row); color: var(--fg-muted); border-radius: var(--radius-sm); margin-left: auto; }

  .contrib__result { margin-top: 18px; border-top: 1px solid var(--border-soft); padding-top: 14px; }
  .contrib__partlist { list-style: none; margin: 10px 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
  .contrib__partlist button { font-variant-numeric: tabular-nums; }
  .contrib__warn {
    margin: 0; padding: 12px 14px; border-radius: var(--radius-md);
    border: 1px solid var(--cell-partial); border-left-width: 4px;
    background: color-mix(in oklch, var(--cell-partial) 16%, var(--bg-row));
    color: var(--fg); font-size: 0.85rem; line-height: 1.5;
  }
  .contrib__warn strong { display: block; margin-bottom: 4px; color: var(--cell-partial-ink); }
  .contrib__consent { display: flex; align-items: flex-start; gap: 8px; margin-top: 10px; font-weight: 700; cursor: pointer; }
  .contrib__consent input { margin-top: 2px; flex: none; width: 16px; height: 16px; accent-color: var(--cell-partial); cursor: pointer; }

  .contrib__error { color: var(--cell-no-ink); margin-top: 12px; }
  .contrib__errlist { color: var(--cell-no-ink); margin: 12px 0 0; padding-left: 18px; font-size: 0.9rem; }

  /* Fullscreen screenshot preview. */
  .contrib__lightbox { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; background: oklch(0 0 0 / 0.72); }
  .contrib__lightbox-backdrop { position: absolute; inset: 0; border: 0; background: transparent; cursor: zoom-out; min-height: 0; border-radius: 0; }
  .contrib__lightbox-panel {
    position: relative; z-index: 1; max-width: min(980px, 96vw); max-height: 92vh; margin: 0;
    padding: 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
    background: var(--bg-elev); display: grid; gap: 10px; overflow: auto;
  }
  .contrib__lightbox-panel img { max-width: 100%; max-height: 70vh; display: block; object-fit: contain; border-radius: var(--radius-sm); }
  .contrib__lightbox-meta { display: grid; gap: 4px; }
  .contrib__lightbox-removed { margin: 0; color: var(--cell-no-ink); font-weight: 800; font-size: 0.85rem; }
  .contrib__lightbox-alt { margin: 0; color: var(--fg); font-size: 0.95rem; }
  .contrib__lightbox-caption { margin: 0; color: var(--fg-soft); font-size: 0.85rem; }
  .contrib__lightbox-meta code { font-size: 0.72rem; color: var(--fg-muted); word-break: break-all; }
  .contrib__lightbox-nav { display: flex; align-items: center; justify-content: center; gap: 10px; }
  .contrib__lightbox-nav button { min-height: 34px; min-width: 34px; padding: 0; border: 1px solid var(--border); background: var(--bg-row); color: var(--fg); font-size: 1.3rem; line-height: 1; }
  .contrib__lightbox-nav span { min-width: 44px; text-align: center; color: var(--fg-muted); font-size: 0.8rem; font-weight: 800; }
</style>
