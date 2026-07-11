"use client";

import { useEffect } from "react";
import { applyAppIcon, getStoredIcon } from "@/lib/app-icon";

/**
 * Applies the user's saved app-icon choice on load so the served
 * <link rel="apple-touch-icon"> + cookie stay in sync across visits (before
 * they add to the home screen). Renders nothing. Mirrors TimezoneSync.
 */
export function AppIconSync() {
  useEffect(() => {
    applyAppIcon(getStoredIcon());
  }, []);
  return null;
}
