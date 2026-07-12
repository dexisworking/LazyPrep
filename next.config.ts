import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry wrapper. Source-map upload only runs when SENTRY_AUTH_TOKEN/org/project
// are set (CI/prod); locally it's a no-op. Error capture itself is DSN-gated in
// the sentry.*.config.ts files, so this is safe to ship inert.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
