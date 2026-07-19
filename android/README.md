# LazyPrep Android (TWA)

Trusted Web Activity wrapper around `https://lazyprep.iamdex.codes`, generated with
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) 1.24.1.

The app loads the live site, so **web deploys reach users instantly** — no AAB
re-upload needed. Rebuild only when the splash screen, icons, package metadata,
target API level, or Bubblewrap config change.

## Regenerating the project

`bubblewrap init` is fully interactive with no non-interactive flags. To regenerate
without prompts, edit `twa-manifest.json` and run:

```bash
cd android
bubblewrap update --skipVersionUpgrade
npm run android:check   # from the repo root — see below
```

## Two traps `bubblewrap update` re-introduces

`bubblewrap update` regenerates `app/build.gradle` from Bubblewrap's template,
silently reverting both of these. Neither fails the build — they surface as a
rejection at Play Console upload time.

1. **`targetSdkVersion` resets to 35.** It is hardcoded in Bubblewrap's
   `template_project/app/build.gradle` with no `twa-manifest.json` field. Play
   requires **API 36 for new apps and updates after 2026-08-31**. Re-apply `36`.
2. **`versionName` becomes empty** if `twa-manifest.json` uses `appVersionName`.
   Bubblewrap reads **`appVersion`** (`TwaManifest.js`: `this.appVersionName =
   data.appVersion`). Use `appVersion`.

`npm run android:check` (root `package.json`) asserts both. Run it after every
`bubblewrap update` and before building the AAB.

## Building

The release keystore is **not** in this repo and must never be committed — it is
permanent and irreplaceable. Losing it means you can never update the app; leaking
it lets someone sign malware under your identity. Create it once and store the
password in a password manager:

```bash
cd android
keytool -genkeypair -v -keystore android.keystore -alias android \
  -keyalg RSA -keysize 2048 -validity 10000

bubblewrap build
```

Outputs `app-release-signed.apk` (device testing) and `app-release-bundle.aab`
(Play upload). Both are gitignored, as are `android.keystore`, `local.properties`,
and the Gradle build dirs.

Requires roughly 3–5 GB free disk for the Gradle distribution, dependency cache,
and build outputs.

## Digital Asset Links

`public/.well-known/assetlinks.json` currently ships **placeholder fingerprints**
(`__UPLOAD_KEY_SHA256__`, `__PLAY_APP_SIGNING_KEY_SHA256__`). Until both are real,
the TWA falls back to a Custom Tab and shows a browser URL bar.

1. Upload key — after creating the keystore:
   `keytool -list -v -keystore android.keystore`
2. Play App Signing key — after the first AAB upload, from
   Play Console → Setup → App integrity → App signing.

Deploy the updated file, then verify:

```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://lazyprep.iamdex.codes&relation=delegate_permission/common.handle_all_urls
```

Android caches asset-link verification, so reinstall the app after changing it.
