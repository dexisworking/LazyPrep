import Link from "next/link";
import { Lock, CheckCircle2, Circle, Clock, Trophy, Target, Award } from "lucide-react";
import { PhaseGenerator } from "@/components/adaptive/phase-generator";
import type { PhaseView } from "@/lib/data/adaptive";

const LEVEL_BADGE: Record<string, string> = {
  foundation: "border-primary/30 bg-primary/10 text-primary",
  intermediate: "border-np-orange/30 bg-np-orange/10 text-np-orange",
  advanced: "border-np-red/30 bg-np-red/10 text-np-red",
};

export function AdaptiveCourse({
  courseSlug,
  phases,
}: {
  courseSlug: string;
  phases: PhaseView[];
}) {
  const passedCount = phases.filter((p) => p.checkpoint?.passed).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Trophy className="h-4 w-4 text-np-orange" />
        Mastery path · {passedCount} of {phases.length} phases mastered
      </div>

      {phases.map((phase, i) => {
        const levelCls = LEVEL_BADGE[phase.phaseLevel ?? ""] ?? "border-border/50 bg-secondary text-muted-foreground";
        const pct = phase.lessonsTotal > 0 ? Math.round((phase.lessonsCompleted / phase.lessonsTotal) * 100) : 0;

        return (
          <section
            key={phase.id}
            className={
              "rounded-2xl border p-5 md:p-6 " +
              (phase.locked ? "border-border/40 bg-card/40 opacity-70" : "border-border/50 bg-card")
            }
          >
            {/* Phase header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-secondary text-sm font-bold text-muted-foreground">
                  {i + 1}
                </div>
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    {phase.title}
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${levelCls}`}>
                      {phase.phaseLevel}
                    </span>
                  </h2>
                  {!phase.locked && phase.contentGenerated && (
                    <p className="text-xs text-muted-foreground">
                      {phase.lessonsCompleted}/{phase.lessonsTotal} lessons
                    </p>
                  )}
                </div>
              </div>

              {phase.checkpoint?.passed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-np-success/30 bg-np-success/10 px-3 py-1 text-xs font-medium text-np-success">
                  <Award className="h-3.5 w-3.5" />
                  Mastered · {phase.checkpoint.bestScore}%
                </span>
              ) : phase.locked ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  Locked
                </span>
              ) : null}
            </div>

            {/* Body */}
            {phase.locked ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Pass the previous phase&apos;s checkpoint to unlock this phase.
              </p>
            ) : !phase.contentGenerated ? (
              <div className="mt-4">
                <PhaseGenerator moduleId={phase.id} phaseTitle={phase.title} />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* progress bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>

                {/* lessons */}
                <div className="space-y-3">
                  {phase.chapters.map((ch) => (
                    <div key={ch.id}>
                      <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {ch.title}
                      </h3>
                      <ul className="overflow-hidden rounded-xl border border-border/50">
                        {ch.lessons.map((l) => (
                          <li key={l.id} className="border-b border-border/40 last:border-0">
                            <Link
                              href={`/courses/${courseSlug}/lessons/${l.slug}`}
                              className="flex items-center gap-3 bg-background/40 px-4 py-2.5 transition-colors hover:bg-secondary/60"
                            >
                              {l.completed ? (
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-np-success" />
                              ) : (
                                <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground/40" />
                              )}
                              <span className={l.completed ? "flex-1 text-sm text-muted-foreground" : "flex-1 text-sm text-foreground"}>
                                {l.title}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {l.estimatedMinutes}m
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* checkpoint */}
                <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                  {phase.checkpoint?.passed ? (
                    <p className="flex items-center gap-2 text-sm font-medium text-np-success">
                      <Award className="h-4 w-4" />
                      Checkpoint passed — {phase.checkpoint.bestScore}%. Next phase unlocked.
                    </p>
                  ) : phase.allComplete && phase.checkpoint ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Target className="h-4 w-4 text-np-red" />
                          Checkpoint mocktest
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Score {phase.checkpoint.threshold}%+ to master this phase and unlock the next.
                          {phase.checkpoint.attempts > 0 && ` Best: ${phase.checkpoint.bestScore}%.`}
                        </p>
                      </div>
                      <Link
                        href={`/courses/${courseSlug}/checkpoint/${phase.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                      >
                        {phase.checkpoint.attempts > 0 ? "Retake checkpoint" : "Take checkpoint"}
                      </Link>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      Complete all {phase.lessonsTotal} lessons to unlock the checkpoint.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
