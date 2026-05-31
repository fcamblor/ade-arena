import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

function safeGit(cmd, fallback) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return fallback;
  }
}

function versionManifest() {
  return {
    name: 'inject-version-manifest',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const manifest = {
          tag: process.env.RELEASE_TAG ?? 'dev',
          commit_sha: process.env.RELEASE_COMMIT_SHA ?? safeGit('git rev-parse HEAD', 'unknown'),
          commit_date:
            process.env.RELEASE_COMMIT_DATE ??
            safeGit('git log -1 --format=%cI', new Date().toISOString()),
          build_date: process.env.RELEASE_BUILD_DATE ?? new Date().toISOString(),
        };
        const outDir = fileURLToPath(dir);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, 'version.json'), JSON.stringify(manifest, null, 2) + '\n');
      },
    },
  };
}

// Recursively list every .html file under `rootDir`.
function listHtmlFiles(rootDir) {
  return readdirSync(rootDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name));
}

// Compute the CSP `sha256-<base64>` hashes of every inline <script> (without a
// `src`) and inline <style> element across the built HTML. Astro emits inline
// hydration bootstrap scripts (client:load / client:idle) and scoped <style>
// blocks; under a strict `script-src 'self'` / `style-src-elem 'self'` they get
// blocked, leaving islands unhydrated (the AuthButton stays on its SSR
// "Loading session" placeholder). Hashing the real build output keeps the CSP
// strict AND correct, and self-heals when Astro or deps change the inline
// payload — unlike hard-coded hashes, which silently break on the next bump.
function collectInlineHashes(rootDir) {
  const scriptHashes = new Set();
  const styleHashes = new Set();
  const sha = (content) =>
    `'sha256-${createHash('sha256').update(content, 'utf8').digest('base64')}'`;
  const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/g;

  for (const file of listHtmlFiles(rootDir)) {
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(scriptRe)) scriptHashes.add(sha(m[1]));
    for (const m of html.matchAll(styleRe)) styleHashes.add(sha(m[1]));
  }
  return { scriptHashes: [...scriptHashes], styleHashes: [...styleHashes] };
}

// Emits `dist/headers.json` — a flat object mapping HTTP header names to their values.
// Consumed by the `ade-arena-infra` workflow, which feeds it as the `security_headers`
// Terraform variable into a Bunny.net `bunnynet_pullzone_edgerule` that injects the
// headers verbatim at the edge. The Content-Security-Policy `connect-src` is tightened
// to the actual Supabase host instead of a `*.supabase.co` wildcard. Falls back to the
// wildcard when PUBLIC_SUPABASE_URL is unset (e.g. local build with no env), keeping
// the build green while logging a warning. `script-src`/`style-src-elem` carry the
// per-build sha256 hashes of Astro's inline scripts/styles (see collectInlineHashes).
function securityHeaders() {
  return {
    name: 'emit-security-headers',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? '';
        let supabaseOrigin = '';
        try {
          if (supabaseUrl) supabaseOrigin = new URL(supabaseUrl).origin;
        } catch {
          // ignore — handled by the empty-origin branch below
        }

        const httpHost = supabaseOrigin || 'https://*.supabase.co';
        const wsHost = supabaseOrigin
          ? supabaseOrigin.replace(/^https?:\/\//, 'wss://')
          : 'wss://*.supabase.co';

        if (!supabaseOrigin) {
          console.warn(
            '[security-headers] PUBLIC_SUPABASE_URL is unset — CSP connect-src falls back to https://*.supabase.co.',
          );
        }

        const outDir = fileURLToPath(dir);

        // Allow Astro's own inline hydration scripts + scoped styles by hash,
        // so a strict CSP does not block island hydration.
        const { scriptHashes, styleHashes } = collectInlineHashes(outDir);
        const scriptSrc = ["'self'", ...scriptHashes].join(' ');
        const styleSrcElem = ["'self'", ...styleHashes].join(' ');

        // CSP backs ADR 001: the JWT lives in localStorage, so the directive is the
        // last line of defence against XSS-driven account takeover.
        //
        // - `style-src 'self'` blocks injected <style> blocks (the only realistic
        //   CSS exfil vector via attribute-selector + background:url tricks).
        // - `style-src-elem` additionally pins inline <style> elements to their
        //   build-time hashes (Astro scoped styles).
        // - `style-src-attr 'unsafe-inline'` keeps inline `style="..."` attributes
        //   working (Astro server-rendered width bars, Svelte progress fills).
        //   Attribute styles have no selector context and cannot exfil.
        // - `script-src` pins inline scripts to their build-time hashes; external
        //   chunks are covered by 'self'.
        // - `connect-src` and `form-action` point at the actual Supabase host when
        //   known, otherwise the platform-wide wildcard as a safe fallback.
        const csp = [
          "default-src 'self'",
          `script-src ${scriptSrc}`,
          // Fonts are self-hosted (see Base.astro), so no third-party CSS
          // host needs to be allowed for stylesheets or font files anymore.
          "style-src 'self'",
          `style-src-elem ${styleSrcElem}`,
          "style-src-attr 'unsafe-inline'",
          "font-src 'self'",
          "img-src 'self' https://avatars.githubusercontent.com data:",
          `connect-src 'self' ${httpHost} ${wsHost}`,
          "frame-ancestors 'none'",
          "base-uri 'self'",
          `form-action 'self' ${httpHost}`,
          "object-src 'none'",
          'upgrade-insecure-requests',
        ].join('; ');

        // Canonical HTTP header names — case matters for the downstream Terraform
        // consumer (`jq` in the infra workflow), which does not normalize keys.
        const headers = {
          'Content-Security-Policy': csp,
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          'X-Frame-Options': 'DENY',
          'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        };

        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, 'headers.json'), JSON.stringify(headers, null, 2) + '\n');
      },
    },
  };
}

// Canonical URL for sitemap + <link rel="canonical">. Provided per-env by the
// deploy pipeline as PUBLIC_SITE_URL (dev → ade-arena-dev.camblor.fr, prod →
// ade-arena.camblor.fr). Falls back to localhost for local dev so canonical
// tags never silently point at a real deployment host.
const siteUrl = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';
if (!process.env.PUBLIC_SITE_URL && process.env.CI) {
  console.warn(
    '[astro] PUBLIC_SITE_URL is unset in CI — canonical URLs/sitemap will use the localhost fallback.',
  );
}

export default defineConfig({
  integrations: [svelte(), versionManifest(), securityHeaders()],
  site: siteUrl,
  // Force component CSS to external <link> stylesheets (served from 'self')
  // instead of inline <style> blocks. The strict CSP pins inline styles by
  // per-build SHA-256 hash (see securityHeaders()), so any inline <style>
  // whose hash drifts between the deployed HTML and the deployed headers.json
  // gets blocked — which silently strips a component's styling. Keeping CSS
  // external means `style-src 'self'` covers it permanently, with no hash
  // dependency, leaving only Astro's single constant inline island style.
  build: { inlineStylesheets: 'never' },
});
