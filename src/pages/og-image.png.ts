import type { APIRoute } from 'astro';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Prerendered at build time -> served as a static PNG by the CDN.
// Re-runs of `astro build` regenerate the file from this code, so any change
// to the layout, brand colors, or wording propagates without a manual export.
export const prerender = true;

// Brand tokens kept in sync with `:root` declarations in Base.astro / Minimal.astro
// and with `site.webmanifest`. Satori cannot evaluate oklch, so these are the
// closest sRGB equivalents of the design tokens.
const BG = '#140807';            // very dark warm charcoal
const ACCENT = '#e84a3d';        // brand red
const FG = '#f0e8e1';            // off-white
const FG_MUTED = '#a89891';

// Read the boxing-ring brand mark straight from the favicon — one source of
// truth, so tweaking public/favicon.svg automatically updates the OG image.
// We override its built-in `ui-monospace` font reference for the "vs" letters
// with a TTF we actually load below (resvg has no system-font fallback we
// can rely on across build environments).
//
// Anchored on the project root (`process.cwd()`) rather than `import.meta.url`:
// since Astro 6 this endpoint is prerendered from a bundled chunk under
// `dist/.prerender/chunks/`, so a path relative to the module file would
// resolve to a non-existent `dist/public/favicon.svg`. `astro build` always
// runs from the project root, where `public/favicon.svg` lives.
const FAVICON_PATH = join(process.cwd(), 'public', 'favicon.svg');
const ICON_SVG = readFileSync(FAVICON_PATH, 'utf-8')
  .replace(/font-family="[^"]*"/g, 'font-family="Big Shoulders Display"');

// fontsource.org serves bare TTFs at predictable URLs — perfect for satori,
// which only reads TTF/OTF (no woff2). The first build fetches and caches
// them; subsequent builds reuse the npm/pnpm fetch cache.
async function loadFont(family: string, weight: number): Promise<Buffer> {
  const url = `https://api.fontsource.org/v1/fonts/${family}/latin-${weight}-normal.ttf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font ${family}@${weight}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export const GET: APIRoute = async () => {
  const [displayFont, bodyFont] = await Promise.all([
    loadFont('big-shoulders-display', 900),
    loadFont('hanken-grotesk', 500),
  ]);

  // resvg-js only accepts font files by path (no in-memory buffers), so write
  // the TTFs we just downloaded to a tmp dir for the embedded SVG to render
  // its "vs" text. Cleaned up at the end of the handler.
  const fontDir = mkdtempSync(join(tmpdir(), 'ade-arena-og-fonts-'));
  const displayFontPath = join(fontDir, 'big-shoulders-display.ttf');
  const bodyFontPath = join(fontDir, 'hanken-grotesk.ttf');
  writeFileSync(displayFontPath, displayFont);
  writeFileSync(bodyFontPath, bodyFont);

  try {
    // First pass: rasterize the favicon SVG to a 256x256 PNG with resvg, so
    // the "vs" text (which needs a font that resvg has access to) is baked
    // into raster pixels. Satori embeds raster images verbatim, so passing
    // this PNG as <img src> avoids the second-pass font issue we hit when
    // the SVG was embedded directly as a data URL.
    const iconPngBuffer = new Resvg(ICON_SVG, {
      fitTo: { mode: 'width', value: 256 },
      font: {
        fontFiles: [displayFontPath],
        loadSystemFonts: false,
        defaultFontFamily: 'Big Shoulders Display',
      },
    }).render().asPng();
    const iconDataUrl = `data:image/png;base64,${iconPngBuffer.toString('base64')}`;

    const tree = {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: BG,
          borderLeft: `14px solid ${ACCENT}`,
          padding: '70px',
          color: FG,
          fontFamily: 'Hanken Grotesk',
        },
        children: [
          // Brand row: icon + ADE ARENA wordmark
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                marginBottom: '50px',
                padding: '12px 20px',
                borderRadius: '12px',
                border: `1px solid ${ACCENT}80`,
                background: `${ACCENT}1a`,
                alignSelf: 'flex-start',
              },
              children: [
                {
                  type: 'img',
                  props: { src: iconDataUrl, width: 64, height: 64 },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Big Shoulders Display',
                      fontWeight: 900,
                      fontSize: 56,
                      letterSpacing: '0.16em',
                      color: ACCENT,
                      textTransform: 'uppercase',
                      lineHeight: 1,
                    },
                    children: 'ADE Arena',
                  },
                },
              ],
            },
          },
          // Headline
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'Big Shoulders Display',
                fontWeight: 900,
                fontSize: 68,
                lineHeight: 1.05,
                color: FG,
                marginBottom: '28px',
                maxWidth: '1000px',
              },
              children: 'Agentic Dev Environments & orchestrators, scored side by side.',
            },
          },
          // Tagline
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'Hanken Grotesk',
                fontWeight: 500,
                fontSize: 26,
                lineHeight: 1.4,
                color: FG_MUTED,
                maxWidth: '980px',
              },
              children:
                'A feature-by-feature comparison of the tools that run coding agents for you — Conductor, Vibe Kanban, Claude Code Desktop, T3 Code and more.',
            },
          },
        ],
      },
    };

    const svg = await satori(tree as Parameters<typeof satori>[0], {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Big Shoulders Display', data: displayFont, weight: 900, style: 'normal' },
        { name: 'Hanken Grotesk', data: bodyFont, weight: 500, style: 'normal' },
      ],
    });

    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: {
        fontFiles: [displayFontPath, bodyFontPath],
        loadSystemFonts: false,
        defaultFontFamily: 'Big Shoulders Display',
      },
    }).render().asPng();

    return new Response(png as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } finally {
    rmSync(fontDir, { recursive: true, force: true });
  }
};
