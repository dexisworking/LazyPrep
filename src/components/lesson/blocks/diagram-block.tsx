"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type DiagramBlockData =
  | {
      type: "layers";
      title?: string;
      layers: { label: string; detail?: string; badge?: string }[];
    }
  | {
      type: "flow";
      title?: string;
      direction?: "horizontal" | "vertical";
      steps: { label: string; detail?: string }[];
    }
  | {
      type: "compare";
      title?: string;
      left: { title: string; items: string[] };
      right: { title: string; items: string[] };
    };

/** Accent palette cycled across layers/steps (static classes so Tailwind keeps them). */
const ACCENTS = [
  { bar: "bg-[var(--chart-1)]", text: "text-[var(--chart-1)]", soft: "bg-[var(--chart-1)]/10", border: "border-[var(--chart-1)]/30" },
  { bar: "bg-[var(--chart-2)]", text: "text-[var(--chart-2)]", soft: "bg-[var(--chart-2)]/10", border: "border-[var(--chart-2)]/30" },
  { bar: "bg-[var(--chart-4)]", text: "text-[var(--chart-4)]", soft: "bg-[var(--chart-4)]/10", border: "border-[var(--chart-4)]/30" },
  { bar: "bg-[var(--chart-5)]", text: "text-[var(--chart-5)]", soft: "bg-[var(--chart-5)]/10", border: "border-[var(--chart-5)]/30" },
  { bar: "bg-[var(--chart-3)]", text: "text-[var(--chart-3)]", soft: "bg-[var(--chart-3)]/10", border: "border-[var(--chart-3)]/30" },
] as const;

function Frame({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="np-block my-6 overflow-hidden rounded-xl border border-border/60 bg-card">
      {title && (
        <div className="border-b border-border/50 bg-secondary/50 px-4 py-2.5 text-sm font-semibold text-foreground">
          {title}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

/** Declarative infographic renderer: layer stacks, step flows, comparisons. */
export function DiagramBlock({ data }: { data: DiagramBlockData }) {
  const reduced = useReducedMotion();

  const reveal = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-30px" },
          transition: { duration: 0.25, delay: i * 0.05, ease: "easeOut" as const },
        };

  if (data.type === "layers") {
    return (
      <Frame title={data.title}>
        <div className="space-y-1.5">
          {data.layers.map((layer, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <motion.div
                key={i}
                {...reveal(i)}
                className={cn(
                  "group flex items-stretch gap-0 overflow-hidden rounded-lg border transition-colors",
                  accent.border,
                  "hover:shadow-sm",
                )}
              >
                <div className={cn("w-1.5 flex-shrink-0", accent.bar)} />
                <div className={cn("flex flex-1 flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-2.5", accent.soft)}>
                  {layer.badge && (
                    <span
                      className={cn(
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border bg-background text-xs font-bold",
                        accent.border,
                        accent.text,
                      )}
                    >
                      {layer.badge}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-foreground">{layer.label}</span>
                  {layer.detail && (
                    <span className="text-xs text-muted-foreground sm:ml-auto sm:text-right">{layer.detail}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Frame>
    );
  }

  if (data.type === "flow") {
    const vertical = data.direction === "vertical";
    return (
      <Frame title={data.title}>
        <div
          className={cn(
            "flex gap-2",
            vertical ? "flex-col" : "flex-col sm:flex-row sm:flex-wrap sm:items-stretch",
          )}
        >
          {data.steps.map((step, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const last = i === data.steps.length - 1;
            return (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  vertical ? "flex-col" : "flex-col sm:flex-1 sm:flex-row sm:items-center",
                )}
              >
                <motion.div
                  {...reveal(i)}
                  className={cn(
                    "flex-1 rounded-lg border px-3.5 py-3",
                    accent.border,
                    accent.soft,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-background",
                        accent.bar,
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{step.label}</span>
                  </div>
                  {step.detail && (
                    <p className="mt-1 pl-7 text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
                  )}
                </motion.div>
                {!last && (
                  <span className="flex items-center justify-center text-muted-foreground/60">
                    <ArrowDown className={cn("h-4 w-4", !vertical && "sm:hidden")} />
                    {!vertical && <ArrowRight className="hidden h-4 w-4 sm:block" />}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Frame>
    );
  }

  if (data.type === "compare") {
    return (
      <Frame title={data.title}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { side: data.left, accent: ACCENTS[0] },
            { side: data.right, accent: ACCENTS[1] },
          ].map(({ side, accent }, i) => (
            <motion.div
              key={i}
              {...reveal(i)}
              className={cn("rounded-lg border p-4", accent.border, accent.soft)}
            >
              <p className={cn("mb-2.5 text-sm font-bold", accent.text)}>{side.title}</p>
              <ul className="space-y-1.5">
                {side.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                    <span className={cn("mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full", accent.bar)} />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Frame>
    );
  }

  return null;
}
