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

  // Third-party noise. `window.onerror` attributes any uncaught error on the
  // page to us, including ones thrown by scripts we don't ship or control.
  ignoreErrors: [
    // Instagram/Facebook iOS in-app browsers inject a native bridge
    // (sendDataToNative → sendPageHideMessage) that reads
    // window.webkit.messageHandlers. On some iOS builds that object is absent
    // and their injected script throws on page hide. Nothing in this app
    // touches window.webkit — see LAZYPREP-2.
    /window\.webkit\.messageHandlers/,
  ],

  denyUrls: [
    // Browser extensions that inject scripts into the page.
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    /^safari-web-extension:\/\//,
  ],

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
