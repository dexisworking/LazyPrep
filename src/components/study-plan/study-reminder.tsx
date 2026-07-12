"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";

const STORAGE_KEY = "lazyprep-last-reminder"; // yyyy-mm-dd of last shown notification

/**
 * Opt-in daily study reminder (zero-infra, MVP).
 *
 * Uses the browser Notification API. When permission is granted and today's
 * goal isn't met, it fires ONE local notification per day (guarded via
 * localStorage) the next time the app is opened. True server-scheduled push
 * (delivered while the app is closed) is a documented Phase 2 — it needs VAPID
 * keys, a PushSubscription store, and a scheduled sender.
 */
export function StudyReminder({ goalMet }: { goalMet: boolean }) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setSupported(true);
    setPermission(Notification.permission);
  }, []);

  // When granted and behind on today's goal, nudge once per day.
  useEffect(() => {
    if (!supported || permission !== "granted" || goalMet) return;
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(STORAGE_KEY) === today) return;
    try {
      new Notification("Keep your streak alive 🔥", {
        body: "You haven't studied yet today. A few minutes keeps the momentum going.",
        icon: "/icons/icon-192.png",
      });
      localStorage.setItem(STORAGE_KEY, today);
    } catch {
      // Some browsers require notifications via the service worker; ignore failures.
    }
  }, [supported, permission, goalMet]);

  if (!supported) return null;

  const enable = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (permission === "granted") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <BellRing className="h-3.5 w-3.5 text-np-success" />
        Daily reminders on
      </span>
    );
  }

  if (permission === "denied") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <BellOff className="h-3.5 w-3.5" />
        Reminders blocked in browser settings
      </span>
    );
  }

  return (
    <button
      onClick={enable}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
    >
      <Bell className="h-3.5 w-3.5 text-primary" />
      Enable daily reminders
    </button>
  );
}
