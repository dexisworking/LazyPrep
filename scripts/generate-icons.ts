/**
 * Generates the full PWA / platform icon set for LazyPrep from a single source
 * of truth (the bolt geometry + tile styles defined below).
 * Run: pnpm icons:generate   (alias for: tsx scripts/generate-icons.ts)
 *
 * Per variant (gradient | light | dark | mono) it writes:
 *   public/icons/<v>-192.png / <v>-512.png       — squircle tile, transparent corners (manifest "any")
 *   public/icons/<v>-maskable-512.png            — FULL-BLEED solid bg + bolt in the Android safe zone
 *   public/icons/<v>-apple-180.png               — 180px OPAQUE square + bolt (iOS masks corners)
 *
 * Plus the primary (gradient) files the manifest/links already reference:
 *   public/icons/icon-192.png / icon-512.png
 *   public/icons/maskable-192.png / maskable-512.png
 *   public/apple-touch-icon.png
 *   public/icons/monochrome-512.png              — silhouette for Android 13+ themed icons
 *   src/app/icon.png                             — 48px raster favicon fallback
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "public");

// ── Brand geometry & palette (kept in lockstep with src/components/brand/logo.tsx) ──
const BOLT = "M13.5 2.5 L4.5 13.5 L10.5 13.5 L10 21.5 L19.5 10.5 L13.5 10.5 Z";
const BLUE = "#2E9CE8";
const BLUE_MID = "#3FA3EE";
const ORANGE = "#F2822E";

type BoltStyle = "gradient" | "white" | "dark";
type Variant = { key: string; bg: string; bolt: BoltStyle; navyTile: boolean; rim: boolean };

// bg = flat color used for maskable/apple full-bleed backgrounds.
const VARIANTS: Variant[] = [
  { key: "gradient", bg: "#0A0F1A", bolt: "gradient", navyTile: true, rim: true },
  { key: "light", bg: "#0A0F1A", bolt: "white", navyTile: true, rim: true },
  { key: "dark", bg: "#FFFFFF", bolt: "dark", navyTile: false, rim: false },
  { key: "mono", bg: "#1E8FE6", bolt: "white", navyTile: false, rim: false },
];

/** Bolt-only SVG (centered in a 24 viewBox), colored for the variant. */
function boltSvg(bolt: BoltStyle, filled = false): Buffer {
  const stroke =
    bolt === "white" ? "#ffffff" : bolt === "dark" ? "#0a0a0f" : "url(#g)";
  const defs =
    bolt === "gradient"
      ? `<defs><linearGradient id="g" x1="0.2" y1="0.05" x2="0.8" y2="0.95">` +
        `<stop stop-color="${BLUE}"/><stop offset="0.45" stop-color="${BLUE_MID}"/><stop offset="1" stop-color="${ORANGE}"/></linearGradient></defs>`
      : "";
  const paint = filled
    ? `fill="${stroke}" stroke="${stroke}" stroke-width="1.2"`
    : `fill="none" stroke="${stroke}" stroke-width="2.1"`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${defs}` +
      `<path d="${BOLT}" ${paint} stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  );
}

/** Full squircle tile SVG (512) for the "any" launcher icon + settings previews. */
function tileSvg(v: Variant): Buffer {
  const bg = v.navyTile
    ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">` +
      `<stop stop-color="#0C1220"/><stop offset="1" stop-color="#070A12"/></linearGradient></defs>` +
      `<rect x="6" y="6" width="500" height="500" rx="115" fill="url(#bg)"/>`
    : `<rect x="6" y="6" width="500" height="500" rx="115" fill="${v.bg}"/>`;
  const rim = v.rim
    ? `<defs><linearGradient id="rim" x1="40" y1="40" x2="472" y2="472" gradientUnits="userSpaceOnUse">` +
      `<stop stop-color="${BLUE}" stop-opacity="0.7"/><stop offset="1" stop-color="${ORANGE}" stop-opacity="0.7"/></linearGradient></defs>` +
      `<rect x="7.5" y="7.5" width="497" height="497" rx="113.5" fill="none" stroke="url(#rim)" stroke-width="3"/>`
    : "";
  const stroke =
    v.bolt === "white" ? "#ffffff" : v.bolt === "dark" ? "#0a0a0f" : "url(#bolt)";
  const boltDefs =
    v.bolt === "gradient"
      ? `<defs><linearGradient id="bolt" x1="0.2" y1="0.05" x2="0.8" y2="0.95">` +
        `<stop stop-color="${BLUE}"/><stop offset="0.45" stop-color="${BLUE_MID}"/><stop offset="1" stop-color="${ORANGE}"/></linearGradient></defs>`
      : "";
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">` +
      bg +
      rim +
      boltDefs +
      `<g transform="translate(136 136) scale(10)"><path d="${BOLT}" fill="none" stroke="${stroke}" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/></g>` +
      `</svg>`,
  );
}

async function renderTile(svg: Buffer, size: number, dest: string) {
  await sharp(svg, { density: 400 }).resize(size, size).png().toFile(dest);
  console.log(`✓ ${dest}`);
}

/** Bolt centered at `ratio` of the canvas on a solid (opaque) background. */
async function composite(bolt: Buffer, size: number, ratio: number, bg: string, dest: string) {
  const inner = Math.round(size * ratio);
  const icon = await sharp(bolt, { density: 400 }).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: icon, gravity: "center" }])
    .png()
    .toFile(dest);
  console.log(`✓ ${dest}`);
}

async function main() {
  const iconsDir = join(OUT, "icons");
  mkdirSync(iconsDir, { recursive: true });

  for (const v of VARIANTS) {
    const tile = tileSvg(v);
    const bolt = boltSvg(v.bolt);
    await renderTile(tile, 192, join(iconsDir, `${v.key}-192.png`));
    await renderTile(tile, 512, join(iconsDir, `${v.key}-512.png`));
    // Maskable: full-bleed bg, bolt inside the ~60% Android/One-UI safe zone.
    await composite(bolt, 512, 0.6, v.bg, join(iconsDir, `${v.key}-maskable-512.png`));
    // Apple: opaque 180 square, bolt a touch larger (iOS applies its own mask).
    await composite(bolt, 180, 0.7, v.bg, join(iconsDir, `${v.key}-apple-180.png`));
  }

  // Primary (gradient) — filenames the manifest + <link>s already reference.
  const g = VARIANTS[0];
  const gTile = tileSvg(g);
  const gBolt = boltSvg(g.bolt);
  await renderTile(gTile, 192, join(iconsDir, "icon-192.png"));
  await renderTile(gTile, 512, join(iconsDir, "icon-512.png"));
  await composite(gBolt, 192, 0.6, g.bg, join(iconsDir, "maskable-192.png"));
  await composite(gBolt, 512, 0.6, g.bg, join(iconsDir, "maskable-512.png"));
  await composite(gBolt, 180, 0.7, g.bg, join(OUT, "apple-touch-icon.png"));

  // Android 13+ themed (monochrome) layer: solid silhouette on transparent
  // (Android tints it), bolt at ~60% within a 512 canvas.
  const monoSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">` +
      `<g transform="translate(102 102) scale(12.8)"><path d="${BOLT}" fill="#ffffff" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/></g></svg>`,
  );
  await sharp(monoSvg, { density: 400 }).resize(512, 512).png().toFile(join(iconsDir, "monochrome-512.png"));
  console.log(`✓ ${join(iconsDir, "monochrome-512.png")}`);

  // Favicon raster fallback (Next auto-links src/app/icon.png alongside icon.svg).
  await renderTile(gTile, 48, join(ROOT, "src/app/icon.png"));

  console.log("All icons generated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
