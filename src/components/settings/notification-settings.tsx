"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function NotificationSettings() {
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakWarning, setStreakWarning] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePushToggle = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      setPushEnabled(!pushEnabled);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPushEnabled(true);
      }
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="space-y-4 rounded-card border border-border-subtle bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-control border border-border-subtle bg-secondary/50">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Notifications & Reminders</h2>
          <p className="text-xs text-muted-foreground">Manage review alerts and daily streak warnings.</p>
        </div>
      </div>
      <Separator />

      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Daily Review Digest</p>
            <p className="text-xs text-muted-foreground">Receive reminders when flashcards or questions are due.</p>
          </div>
          <input
            type="checkbox"
            checked={dailyReminder}
            onChange={(e) => { setDailyReminder(e.target.checked); handleSave(); }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Streak-at-Risk Alert</p>
            <p className="text-xs text-muted-foreground">Get notified if your streak is about to reset.</p>
          </div>
          <input
            type="checkbox"
            checked={streakWarning}
            onChange={(e) => { setStreakWarning(e.target.checked); handleSave(); }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div>
            <p className="font-medium text-foreground">Browser Push Notifications</p>
            <p className="text-xs text-muted-foreground">Enable web push alerts on this device.</p>
          </div>
          <button
            type="button"
            onClick={handlePushToggle}
            className="rounded-control border border-border-subtle bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            {pushEnabled ? "Enabled" : "Enable Push"}
          </button>
        </div>

        {saved && (
          <p className="flex items-center gap-1 text-xs font-medium text-np-success pt-1">
            <Check className="h-3.5 w-3.5" /> Preferences saved
          </p>
        )}
      </div>
    </section>
  );
}
