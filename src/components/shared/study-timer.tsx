"use client";

import { useEffect, useRef } from "react";
import { logStudyTime } from "@/lib/actions/study-time";

/**
 * Tracks active focus time on the page and periodically syncs accumulated minutes.
 */
export function StudyTimer() {
  const activeSeconds = useRef(0);
  const isFocused = useRef(true);

  useEffect(() => {
    const onFocus = () => { isFocused.current = true; };
    const onBlur = () => { isFocused.current = false; };

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    // Tick every second if focused
    const interval = setInterval(() => {
      if (isFocused.current && !document.hidden) {
        activeSeconds.current += 1;
      }
    }, 1000);

    // Sync accumulated study minutes every 2 minutes
    const syncInterval = setInterval(async () => {
      if (activeSeconds.current >= 60) {
        const mins = Math.floor(activeSeconds.current / 60);
        activeSeconds.current -= mins * 60;
        await logStudyTime(mins);
      }
    }, 120_000);

    // Sync on unmount / navigation
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      clearInterval(interval);
      clearInterval(syncInterval);

      if (activeSeconds.current >= 60) {
        const mins = Math.floor(activeSeconds.current / 60);
        logStudyTime(mins);
      }
    };
  }, []);

  return null;
}
