import { BarChart3, BookOpen, Brain, Flame, Sparkles, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Stagger, StaggerItem } from "@/components/motion/motion";
import { cn } from "@/lib/utils";
import {
  AccuracyIllustration,
  ForgettingCurveIllustration,
  GenerationIllustration,
  HeatmapIllustration,
  LessonIllustration,
  StreakChartIllustration,
} from "@/components/landing/feature-illustrations";

/**
 * The feature grid, rebuilt as an illustrated bento.
 *
 * The previous version was six identical icon-title-paragraph cards; the only
 * thing distinguishing "spaced repetition" from "progress & heatmap" was the
 * glyph. Each card now *shows* its feature — a forgetting curve, a real study
 * heatmap, an accuracy ring — with the copy as caption rather than substitute.
 *
 * `span` keeps the 3/3, 4/2, 2/4 rhythm so no row reads as a uniform strip.
 */

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bg: string;
  span: string;
  /** Illustration renders in a recessed panel under the copy. */
  visual: React.ReactNode;
  /** Some visuals need more breathing room than others. */
  visualClass?: string;
};

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "AI course generation",
    description:
      "Bring your own AI key and generate a full course — modules, lessons and more — for any subject you need to learn.",
    color: "text-primary",
    bg: "bg-primary/10",
    span: "lg:col-span-3",
    visual: <GenerationIllustration />,
  },
  {
    icon: Brain,
    title: "Spaced repetition",
    description:
      "SM-2 flashcards resurface each card exactly when you're about to forget it — so it sticks with far less effort.",
    color: "text-np-success",
    bg: "bg-np-success/10",
    span: "lg:col-span-3",
    visual: <ForgettingCurveIllustration />,
    visualClass: "flex items-center",
  },
  {
    icon: BarChart3,
    title: "Progress & heatmap",
    description:
      "Accuracy, streaks and a study heatmap. Always know how ready you are for the real thing.",
    color: "text-primary",
    bg: "bg-primary/10",
    span: "lg:col-span-4",
    visual: <HeatmapIllustration />,
  },
  {
    icon: Target,
    title: "MCQ practice",
    description: "Every miss lands in your Wrong-Answer Notebook until you master it.",
    color: "text-np-red",
    bg: "bg-np-red/10",
    span: "lg:col-span-2",
    visual: <AccuracyIllustration />,
    visualClass: "flex items-center justify-center",
  },
  {
    icon: BookOpen,
    title: "Rich lessons",
    description: "Tables, code and diagrams. Resume exactly where you left off.",
    color: "text-accent",
    bg: "bg-accent/10",
    span: "lg:col-span-2",
    visual: <LessonIllustration />,
  },
  {
    icon: Flame,
    title: "Streaks that stick",
    description:
      "XP, levels and daily streaks turn consistent studying into a habit you actually keep.",
    color: "text-streak-hot",
    bg: "bg-streak-hot/10",
    span: "lg:col-span-4",
    visual: <StreakChartIllustration />,
    visualClass: "flex items-end",
  },
];

export function FeatureBento() {
  return (
    <Stagger inView className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {FEATURES.map((feature) => (
        <StaggerItem key={feature.title} className={feature.span}>
          <article className="group flex h-full flex-col rounded-card border border-border-subtle bg-card/50 p-6 transition-[background-color,border-color,box-shadow] duration-(--dur-fast) hover:border-primary/30 hover:bg-card hover:shadow-raised">
            <div
              className={cn(
                "mb-4 flex h-10 w-10 items-center justify-center rounded-control",
                feature.bg,
              )}
            >
              <feature.icon className={cn("h-5 w-5", feature.color)} />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>

            {/* Recessed panel keeps the illustration visually subordinate to
                the copy — it's evidence, not the headline. */}
            <div
              className={cn(
                "mt-5 min-h-[9rem] flex-1 overflow-hidden rounded-control border border-border-subtle bg-background/40 p-3",
                feature.visualClass,
              )}
            >
              {feature.visual}
            </div>
          </article>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
