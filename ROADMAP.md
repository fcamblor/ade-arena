# Roadmap — Orch Showdown

Broken down into incrementally shippable milestones. Each feature is small enough to fit in a single PR.

---

## 🪨 Milestone 0 — Bootstrap (✅ done)

- [x] Astro + Svelte + TS + Zod stack
- [x] `Feature` / `OrchestratorVersion` schema validated by Zod
- [x] Auto-loading of orchestrators via `import.meta.glob`
- [x] Sample data (Conductor, Vibe Kanban, GitHub Copilot Coding Agent)
- [x] Home page with a basic comparison table

---

## 🥇 Milestone 1 — Static MVP table

> Goal: a readable table, deployable to Cloudflare Pages, contributable via PR.

- [ ] **F1.1 — Layout & design system**: palette, typography, proper dark mode, final header/footer, logo/favicon.
- [ ] **F1.2 — Sticky header** on both rows AND columns (feature name stays visible on horizontal scroll, orchestrator stays visible on vertical scroll).
- [ ] **F1.3 — Group by feature category** (workflow, integrations, pricing…) with collapsible header rows.
- [ ] **F1.4 — Feature detail modal** (Svelte island) on cell click: long description + screenshot list + note + source link.
- [ ] **F1.5 — Screenshot gallery** inside the modal (simple lightbox), with assets in `public/screenshots/<tool>/<version>/`.
- [ ] **F1.6 — Filter & search** (category filter bar, text search on features, toggle "show only ✅/❌").
- [ ] **F1.7 — Permalinks**: URL hashes to share `#feature/<id>` or `#tool/<id>@<version>`.
- [ ] **F1.8 — Orchestrator detail page** (`/tools/<id>/<version>`) with identity card + full feature recap.
- [ ] **F1.9 — GitHub Actions CI**: `pnpm check` + build on every PR + Cloudflare Pages preview.
- [ ] **F1.10 — Data lint**: `pnpm validate` script that verifies consistency (all `featureId`s exist, no duplicate versions, etc.).
- [ ] **F1.11 — Cloudflare Pages deploy** + custom domain.
- [ ] **F1.12 — CONTRIBUTING docs**: step-by-step tutorial + orchestrator template.

---

## 📝 Milestone 2 — Assisted submission form

> Goal: lower the contribution bar without writing TS by hand.

- [ ] **F2.1 — `/contribute` page**: form to submit a new orchestrator version (name, version, homepage, pricing, …).
- [ ] **F2.2 — Per-feature input**: for each feature, pick `yes/partial/no/unknown` + note + upload screenshots.
- [ ] **F2.3 — Pre-fill from previous version**: "base on version X" selector that pre-populates all fields.
- [ ] **F2.4 — TS file generation**: preview of the generated code in a textarea.
- [ ] **F2.5 — "PR-as-link" mode**: button opening `github.com/.../new/main?filename=...&value=...` to create the PR in one click (no backend needed).
- [ ] **F2.6 — (optional) PR via GitHub OAuth App**: GitHub auth from the form → a Worker creates the fork + branch + PR automatically.

---

## 🔐 Milestone 3 — Lightweight backend (Workers + D1)

> Goal: lay down the serverless infra for Phase 2.

- [ ] **F3.1 — Cloudflare Worker `api/`** (Hono or itty-router) with routing + CORS.
- [ ] **F3.2 — D1 database**: `users`, `votes`, `feature_scores`, `sessions` schemas.
- [ ] **F3.3 — GitHub OAuth**: `/api/auth/github` flow (redirect) + `/api/auth/callback` (exchange code → access token → upsert user → HttpOnly session cookie).
- [ ] **F3.4 — `GET /api/me` endpoint** + header component displaying the logged-in user.
- [ ] **F3.5 — Rate limiting** per IP (KV or Durable Object).

---

## 💘 Milestone 4 — "Tinder-style" voting

> Goal: gather relative importance of features and recommend orchestrators.

- [ ] **F4.1 — Pairing algorithm**: pick feature pairs to show (balanced round-robin to cover the space).
- [ ] **F4.2 — Svelte swipe UI**: card with two features facing each other, left/right animations, touch gestures, ←/→ keyboard shortcuts.
- [ ] **F4.3 — `POST /api/votes` endpoint**: stores `{userId, winnerId, loserId, ts}`.
- [ ] **F4.4 — Server-side scoring**: Elo-like or simple per-feature win-rate, persisted in `feature_scores`.
- [ ] **F4.5 — Personal results page**: user's top-N features + recommended 2-3 best-matching orchestrators (weighted score).
- [ ] **F4.6 — Public stats page** `/insights`: global ranking of most-voted features + heatmap.
- [ ] **F4.7 — Anti-spam**: votes-per-session cap, pair deduplication.

---

## ✨ Milestone 5 — Polish & extras

- [ ] **F5.1 — i18n EN/FR**.
- [ ] **F5.2 — RSS / OG images** for social sharing.
- [ ] **F5.3 — Selective comparator**: pick N orchestrators to compare, export the table to PNG/Markdown.
- [ ] **F5.4 — Version history**: timeline of each tool's versions and diff between versions.
- [ ] **F5.5 — "Listed on Orch Showdown" badges** for vendors.
- [ ] **F5.6 — Print/PDF mode**.

---

## Milestone dependencies

```
M0 ──► M1 ──► M2 (form without backend)
        │
        └──► M3 ──► M4 (tinder voting)
                    │
                    └──► M5 (polish)
```

M2 and M3+M4 can be pursued in parallel.
