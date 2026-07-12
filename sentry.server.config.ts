import * as Sentry from "@sentry/nextjs";

// DSN-gated: with no SENTRY_DSN set, `enabled: false` makes the SDK fully inert
// (no network, no overhead). Add SENTRY_DSN in the environment to turn it on.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
});
