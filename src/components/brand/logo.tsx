import { cn } from "@/lib/utils";

/** Brand gradient stops (blue → orange), matched to the NetPrep reference art. */
export const BRAND_BLUE = "#2E9CE8";
export const BRAND_BLUE_MID = "#3FA3EE";
export const BRAND_ORANGE = "#F2822E";

/**
 * The NetPrep lightning-bolt mark — a hollow, rounded-outline bolt with the
 * brand blue→orange gradient running top-left → bottom-right.
 *
 * `variant` recolors the stroke/fill for different tile backgrounds:
 *  - "gradient" (default): blue→orange gradient (on dark tiles)
 *  - "white":  solid white  (on the dark / mono-blue tiles)
 *  - "dark":   solid near-black (on the white tile)
 * `filled` fills the bolt solid instead of drawing it hollow (used for small
 * favicons where a thin outline would turn muddy).
 */
export function LogoMark({
  className,
  variant = "gradient",
  filled = false,
  title,
}: {
  className?: string;
  variant?: "gradient" | "white" | "dark";
  filled?: boolean;
  title?: string;
}) {
  const gradId = "np-bolt-gradient";
  const color =
    variant === "white" ? "#ffffff" : variant === "dark" ? "#0a0a0f" : `url(#${gradId})`;

  return (
    <svg viewBox="0 0 24 24" fill="none" role={title ? "img" : undefined} aria-hidden={!title} className={className}>
      {title ? <title>{title}</title> : null}
      {variant === "gradient" && (
        <defs>
          <linearGradient id={gradId} x1="0.2" y1="0.05" x2="0.8" y2="0.95">
            <stop stopColor={BRAND_BLUE} />
            <stop offset="0.45" stopColor={BRAND_BLUE_MID} />
            <stop offset="1" stopColor={BRAND_ORANGE} />
          </linearGradient>
        </defs>
      )}
      <path
        d="M13.5 2.5 L4.5 13.5 L10.5 13.5 L10 21.5 L19.5 10.5 L13.5 10.5 Z"
        stroke={color}
        strokeWidth={filled ? 1.2 : 2.1}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={filled ? color : "none"}
      />
    </svg>
  );
}

/** The "NetPrep" wordmark: "Net" solid + "Prep" in the brand gradient (Poppins). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-[family-name:var(--font-wordmark)] font-bold tracking-tight",
        className,
      )}
    >
      Net
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }}
      >
        Prep
      </span>
    </span>
  );
}

/** Tagline lockup: "Prepare Smarter. Pass with Confidence." with brand accents. */
export function Tagline({ className }: { className?: string }) {
  return (
    <span className={cn("text-muted-foreground", className)}>
      Prepare Smarter. <span style={{ color: BRAND_BLUE }}>Pass</span> with{" "}
      <span style={{ color: BRAND_ORANGE }}>Confidence.</span>
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
