# 🥊 Orch Showdown

Feature comparison of coding agent orchestrators (Conductor, Vibe Kanban, GitHub Copilot Coding Agent, t3.codes, …).

## Stack

- [Astro](https://astro.build) + [Svelte 5](https://svelte.dev) (interactive islands)
- Strict TypeScript + [Zod](https://zod.dev) for data validation
- Deploy target: [Cloudflare Pages](https://pages.cloudflare.com) (free tier)
- Phase 2: Cloudflare Workers + D1 for GitHub auth & votes

## Run locally

```bash
pnpm install
pnpm dev
```

## Contributing an orchestrator

Each orchestrator is defined "as code" in `src/data/orchestrators/<tool-id>/<version>.ts`.

1. Fork the repo.
2. Create `src/data/orchestrators/<tool-id>/<version>.ts` (copy an existing version if you're just adding a new version of an existing tool).
3. Run `pnpm check` to validate (Zod + TS).
4. Open a PR.

## Adding a feature

Edit `src/data/features.ts` and add the matching entry to each orchestrator (otherwise the default level is `unknown`).

## Roadmap

See [ROADMAP.md](./ROADMAP.md).
