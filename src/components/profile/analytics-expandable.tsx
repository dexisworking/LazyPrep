"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BarChart2, PieChart, Activity } from "lucide-react";

export function AnalyticsExpandable({
  accuracy,
  totalAttempts,
  correctAttempts,
  studyDays,
}: {
  accuracy: number;
  totalAttempts: number;
  correctAttempts: number;
  studyDays: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 transition-all">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart2 className="h-4 w-4 text-accent" />
          Advanced Analytics & Breakdown
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Collapse" : "Expand"}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-6 space-y-6 pt-4 border-t border-border/40">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary/40 p-4 border border-border/30">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <PieChart className="h-4 w-4 text-np-success" /> Accuracy Split
              </div>
              <p className="mt-2 text-xl font-bold text-foreground">
                {correctAttempts} <span className="text-xs font-normal text-muted-foreground">/ {totalAttempts} correct</span>
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-np-success"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-secondary/40 p-4 border border-border/30">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Activity className="h-4 w-4 text-primary" /> Consistency Pace
              </div>
              <p className="mt-2 text-xl font-bold text-foreground">
                {studyDays} <span className="text-xs font-normal text-muted-foreground">active study sessions</span>
              </p>
            </div>

            <div className="rounded-lg bg-secondary/40 p-4 border border-border/30">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <BarChart2 className="h-4 w-4 text-amber-400" /> Retention Health
              </div>
              <p className="mt-2 text-xl font-bold text-foreground">
                Optimal <span className="text-xs font-normal text-muted-foreground">(SM-2 active)</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
