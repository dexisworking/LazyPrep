import * as Sentry from "@sentry/nextjs";

// Edge runtime (middleware). DSN-gated — inert without SENTRY_DSN.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
});
