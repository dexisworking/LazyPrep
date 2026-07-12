/**
 * Stamp the service-worker cache VERSION with the deploy's commit SHA so that
 * every deploy rolls the old caches (the SW only reinstalls when sw.js bytes
 * change, and only purges caches whose key !== VERSION).
 *
 * Runs as a `prebuild` step. Only stamps inside Vercel builds — locally it's a
 * no-op so the tracked public/sw.js stays clean in git.
 */
import { readFileSync, writeFileSync } from "node:fs";

if (!process.env.VERCEL) {
  process.exit(0);
}

const sha = (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 8) || Date.now().toString(36);
const path = "public/sw.js";
const src = readFileSync(path, "utf8");
const next = src.replace(/const VERSION = "[^"]*";/, `const VERSION = "lazyprep-${sha}";`);

if (next !== src) {
  writeFileSync(path, next);
  console.log(`[stamp-sw] service-worker VERSION -> lazyprep-${sha}`);
}
