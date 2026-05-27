-- Sync the features catalog with `src/data/features.ts`.
--
-- Adds feature IDs introduced after the initial catalog seed:
--   - chat-transcript-export
--   - chat-turn-diff
--   - unarchive-worktree

insert into public.features_catalog (id) values
  ('chat-transcript-export'),
  ('chat-turn-diff'),
  ('unarchive-worktree')
on conflict (id) do nothing;
