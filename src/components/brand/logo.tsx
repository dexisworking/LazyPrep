import { cn } from "@/lib/utils";

/**
 * NetPrep lightning-bolt mark with the brand blue→orange gradient.
 * Duplicate gradient ids across instances are harmless (identical defs).
 */
export function LogoMark({
  className,
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="np-bolt-gradient" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2b8fff" />
          <stop offset="0.5" stopColor="#5aa2ff" />
          <stop offset="1" stopColor="#ff7a1a" />
        </linearGradient>
      </defs>
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        stroke="url(#np-bolt-gradient)"
        strokeWidth={filled ? 1 : 1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={filled ? "url(#np-bolt-gradient)" : "none"}
      />
    </svg>
  );
}

/** The "NetPrep" wordmark: "Net" in foreground, "Prep" in the brand gradient. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      Net
      <span className="bg-gradient-to-r from-primary to-np-orange bg-clip-text text-transparent">
        Prep
      </span>
    </span>
  );
}

/** Mark + wordmark lockup for headers. */
export function Logo({
  className,
  markClassName = "h-6 w-6",
  wordClassName = "text-lg",
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <Wordmark className={wordClassName} />
    </span>
  );
}
