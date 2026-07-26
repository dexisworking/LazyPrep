import { KeyRound } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export type AiKeyGateProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Shown when a feature needs the learner's own AI key and none is configured.
 *
 * Replaces ten hand-written copies that varied across four icon sizes, three
 * container treatments and two lengths of body copy.
 */
export function AiKeyGate({
  title = "Add your AI API key to continue",
  description = "LazyPrep generates this with your own AI key. It's stored encrypted and never shown again.",
  ctaLabel = "Go to Settings",
  size = "md",
  className,
}: AiKeyGateProps) {
  return (
    <EmptyState
      variant="solid"
      size={size}
      icon={KeyRound}
      title={title}
      description={description}
      action={{ label: ctaLabel, href: "/settings" }}
      className={className}
    />
  );
}
