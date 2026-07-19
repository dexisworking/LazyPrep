/**
 * Guards the two Bubblewrap traps that fail silently and only surface at
 * Play Console upload time. Run before building the AAB, and after any
 * `bubblewrap update` (which regenerates android/app/build.gradle from
 * Bubblewrap's template and reverts both).
 *
 *   1. targetSdkVersion — Bubblewrap hardcodes 35 in its template and exposes
 *      no twa-manifest.json field for it. Play requires API 36 for new apps
 *      and updates after 2026-08-31.
 *   2. versionName — Bubblewrap reads `appVersion` from twa-manifest.json, NOT
 *      `appVersionName`. The wrong key is ignored and yields versionName "".
 */
import { readFileSync } from "node:fs";

const MIN_TARGET_SDK = 36;
const GRADLE = "android/app/build.gradle";

const gradle = readFileSync(new URL(`../${GRADLE}`, import.meta.url), "utf8");
const failures = [];

const targetSdk = gradle.match(/^\s*targetSdkVersion\s+(\d+)/m)?.[1];
if (!targetSdk) {
  failures.push(`Could not find targetSdkVersion in ${GRADLE}.`);
} else if (Number(targetSdk) < MIN_TARGET_SDK) {
  failures.push(
    `targetSdkVersion is ${targetSdk}, expected >= ${MIN_TARGET_SDK}. ` +
      `Bubblewrap reverted it — re-apply the bump in ${GRADLE}.`,
  );
}

const versionName = gradle.match(/^\s*versionName\s+"([^"]*)"/m)?.[1];
if (versionName === undefined) {
  failures.push(`Could not find versionName in ${GRADLE}.`);
} else if (versionName.trim() === "") {
  failures.push(
    `versionName is empty. Set "appVersion" (not "appVersionName") in ` +
      `android/twa-manifest.json, then re-run \`bubblewrap update\`.`,
  );
}

if (failures.length > 0) {
  console.error("TWA config check failed:\n");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`TWA config OK (targetSdkVersion ${targetSdk}, versionName "${versionName}").`);
