// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Must be NEXT_PUBLIC_* to be inlined into the client bundle. Self-hosted
  // deployments report to their own project; unset means Sentry stays inert.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Sample 10% of performance traces — enough signal without burning quota at
  // scale. Errors are always captured at 100%, independent of this.
  tracesSampleRate: 0.1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
