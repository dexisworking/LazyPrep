/**
 * Generates the PWA icon set from src/app/icon.svg.
 * Run: pnpm tsx scripts/generate-icons.ts
 *
 * Outputs:
 * - public/icons/icon-192.png / icon-512.png      (standard, transparent-safe)
 * - public/icons/maskable-192.png / maskable-512.png (icon at ~70% inside the
 *   Android maskable safe zone, on the brand background)
 * - public/apple-touch-icon.png                    (180px, opaque — iOS requirement)
 */
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const SVG = readFileSync(join(ROOT, "src/app/icon.svg"));
const OUT = join(ROOT, "public");
const BG = "#0a0a0f";

async function standard(size: number, dest: string) {
  await sharp(SVG, { density: 300 }).resize(size, size).png().toFile(dest);
  console.log(`✓ ${dest} (${size}px)`);
}

/** Icon scaled to `ratio` of the canvas, centered on the brand background. */
async function padded(size: number, ratio: number, dest: string) {
  const inner = Math.round(size * ratio);
  const icon = await sharp(SVG, { density: 300 }).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: icon, gravity: "center" }])
    .png()
    .toFile(dest);
  console.log(`✓ ${dest} (${size}px, ${Math.round(ratio * 100)}% safe zone)`);
}

async function main() {
  mkdirSync(join(OUT, "icons"), { recursive: true });

  await standard(192, join(OUT, "icons/icon-192.png"));
  await standard(512, join(OUT, "icons/icon-512.png"));
  await padded(192, 0.7, join(OUT, "icons/maskable-192.png"));
  await padded(512, 0.7, join(OUT, "icons/maskable-512.png"));
  // iOS wants an opaque icon; the source already has an opaque rounded rect,
  // but pad slightly so the rounded corners don't clip oddly on the home screen.
  await padded(180, 0.92, join(OUT, "apple-touch-icon.png"));

  console.log("All icons generated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
