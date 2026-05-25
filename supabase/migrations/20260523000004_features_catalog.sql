-- Catalog of valid feature IDs.
--
-- Before this migration, `ratings.feature_id` and `feature_skips.feature_id`
-- were free-form `text` columns. An authenticated user could spam those
-- tables with arbitrary identifiers (`feature_id = '<anything>'`) and
-- consume storage / pad community stats with garbage rows. This migration
-- introduces a single source of truth for valid feature IDs and pins both
-- business tables to it via foreign keys.
--
-- The catalog is kept in sync with `src/data/features.ts`. The
-- `.claude/scripts/check-features-catalog-sync.sh` hook fails any Claude
-- session that mutates `features.ts` without producing a matching
-- catalog-sync migration.

create table if not exists public.features_catalog (
  id text primary key
);

-- Public read so the frontend can validate IDs offline if needed.
-- The catalog contains no PII and no user-tied data.
grant select on public.features_catalog to anon, authenticated;
alter table public.features_catalog enable row level security;
create policy "anyone can read the feature catalog"
  on public.features_catalog
  for select
  to anon, authenticated
  using (true);

-- Seed with every ID currently shipped in src/data/features.ts.
-- Kept in alphabetical order so future diffs are noise-free.
insert into public.features_catalog (id) values
  ('chat-message-stacking'),
  ('chat-rewind'),
  ('chat-user-questions'),
  ('cloud-execution'),
  ('context-fill-indicator'),
  ('copy-from-origin-workspace'),
  ('custom-deterministic-workflows'),
  ('custom-ui-actions'),
  ('diff-comments'),
  ('diff-multi-views'),
  ('diff-viewer'),
  ('diff-whitespace-toggle'),
  ('file-tree-browser'),
  ('fork-workspace'),
  ('git-worktrees'),
  ('github-comment-sync'),
  ('in-app-voice-input'),
  ('inline-file-editing'),
  ('live-logs'),
  ('llm-assisted-merge-rebase'),
  ('local-execution'),
  ('local-target-branch-merge'),
  ('mission-control'),
  ('model-effort-support'),
  ('multi-repository-chat-targeting'),
  ('multi-repository-view'),
  ('multi-sessions-per-worktree'),
  ('multiple-model-families'),
  ('no-worktree-mode'),
  ('open-in-ide'),
  ('plugin-system'),
  ('pr-creation'),
  ('pr-status-sync'),
  ('predefined-deterministic-workflows'),
  ('quick-chat'),
  ('readonly-plan-research-mode'),
  ('remote-plan-collaboration'),
  ('remote-session-control'),
  ('run-configurations'),
  ('sandbox-isolation'),
  ('self-hosted'),
  ('session-handoff'),
  ('shared-config'),
  ('shared-discussion-workflows'),
  ('sound-notifications'),
  ('switch-model-mid-session'),
  ('symlink-from-origin-workspace'),
  ('terminal-in-worktree'),
  ('visual-task-management'),
  ('web-preview'),
  ('web-preview-annotation'),
  ('web-preview-element-inspector'),
  ('workflow-shell-hooks'),
  ('worktree-port-env-vars')
on conflict (id) do nothing;

-- Pin business tables to the catalog. `on update cascade` lets a future
-- rename migration update both tables in one go; `on delete restrict`
-- forces a deliberate clean-up before a feature can be removed (we never
-- want to silently lose user ratings to a typo upstream).
alter table public.ratings
  add constraint ratings_feature_id_fkey
  foreign key (feature_id)
  references public.features_catalog(id)
  on update cascade
  on delete restrict;

alter table public.feature_skips
  add constraint feature_skips_feature_id_fkey
  foreign key (feature_id)
  references public.features_catalog(id)
  on update cascade
  on delete restrict;
