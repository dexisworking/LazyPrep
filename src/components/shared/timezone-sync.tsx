"use client";

import { useEffect } from "react";
import { updateTimezone } from "@/lib/actions/profile";

/**
 * Fire-and-forget: on mount, detect the browser's IANA timezone and persist it
 * to the profile if it differs from what's stored. Renders nothing. Mounted in
 * the dashboard layout so it runs on every authenticated visit.
 */
export function TimezoneSync({ current }: { current: string | null }) {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== current) {
      void updateTimezone(tz);
    }
  }, [current]);

  return null;
}
