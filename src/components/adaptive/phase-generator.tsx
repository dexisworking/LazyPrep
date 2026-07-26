"use client";

import { Sparkles } from "lucide-react";

import { GeneratorPanel } from "@/components/shared/generator-panel";
import { generatePhase } from "@/lib/actions/generate";

/**
 * Auto-generates a newly-unlocked phase's lessons on view (adaptive: tailored to
 * what the learner covered and their checkpoint weak spots).
 */
export function PhaseGenerator({
  moduleId,
  phaseTitle,
}: {
  moduleId: string;
  phaseTitle: string;
}) {
  return (
    <GeneratorPanel
      run={() => generatePhase(moduleId)}
      icon={Sparkles}
      tone="primary"
      size="sm"
      labels={{
        loading: `Building your ${phaseTitle} phase…`,
        loadingHint:
          "Tailored to what you've learned and where you struggled. Takes ~15–30 seconds.",
        errorTitle: "Couldn't build this phase",
        noKeyTitle: "Add your AI key to build this phase",
      }}
    />
  );
}
