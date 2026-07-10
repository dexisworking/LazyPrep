"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (production only). Renders nothing.
 * Mounted once in the root layout.
 */
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure is non-fatal — the app just isn't installable.
    });
  }, []);

  return null;
}
