"use client";

import { Target } from "lucide-react";

import { GeneratorPanel } from "@/components/shared/generator-panel";
import { startCheckpoint } from "@/lib/actions/checkpoint";

/** Generates the checkpoint mocktest questions on view. */
export function CheckpointGenerator({ moduleId }: { moduleId: string }) {
  return (
    <GeneratorPanel
      run={() => startCheckpoint(moduleId)}
      icon={Target}
      tone="red"
      labels={{
        loading: "Writing your checkpoint mocktest…",
        loadingHint: "Covering everything you studied this phase.",
        errorTitle: "Couldn't build the checkpoint",
        noKeyTitle: "Add your AI key to build this checkpoint",
      }}
    />
  );
}
