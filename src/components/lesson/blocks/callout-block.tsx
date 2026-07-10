import { Info, Lightbulb, AlertTriangle, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalloutBlockData = {
  type?: "info" | "tip" | "warning" | "exam";
  title?: string;
  body: string;
};

const VARIANTS = {
  info: {
    icon: Info,
    label: "Good to know",
    cls: "border-primary/30 bg-primary/[0.06]",
    iconCls: "text-primary",
  },
  tip: {
    icon: Lightbulb,
    label: "Pro tip",
    cls: "border-np-success/30 bg-np-success/[0.06]",
    iconCls: "text-np-success",
  },
  warning: {
    icon: AlertTriangle,
    label: "Watch out",
    cls: "border-destructive/30 bg-destructive/[0.06]",
    iconCls: "text-destructive",
  },
  exam: {
    icon: GraduationCap,
    label: "Exam tip",
    cls: "border-np-orange/30 bg-np-orange/[0.06]",
    iconCls: "text-np-orange",
  },
} as const;

/** Highlighted aside — info / tip / warning / exam-tip. Server-renderable. */
export function CalloutBlock({ data }: { data: CalloutBlockData }) {
  const variant = VARIANTS[data.type ?? "info"] ?? VARIANTS.info;
  const Icon = variant.icon;
  return (
    <div className={cn("np-block my-6 flex gap-3 rounded-xl border p-4", variant.cls)}>
      <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", variant.iconCls)} />
      <div className="min-w-0 space-y-1">
        <p className={cn("text-[11px] font-semibold uppercase tracking-wider", variant.iconCls)}>
          {data.title ?? variant.label}
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">{data.body}</p>
      </div>
    </div>
  );
}
