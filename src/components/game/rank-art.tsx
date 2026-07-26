import { cn } from "@/lib/utils";

/**
 * Rank art — one distinct vector per rung of the ladder in `lib/xp.ts`.
 *
 * These are illustrations, not icons: filled, multi-tone, and readable at
 * 96px+. The silhouette changes at every tier (spark → tome → laurel → shield →
 * crest → crown → radiant crown) so a player can tell their rank apart at a
 * glance without reading the label.
 *
 * The thresholds below mirror `getRank()` in `lib/xp.ts`. That function is the
 * source of truth for the *name*; this is only the art mapping.
 */
export const RANK_TIERS = [
  { min: 0, name: "Novice", metal: "var(--muted-foreground)", deep: "var(--border-strong)", gem: "var(--surface-2)" },
  { min: 5, name: "Apprentice", metal: "var(--game-win)", deep: "var(--game-win-deep)", gem: "var(--game-xp)" },
  { min: 10, name: "Scholar", metal: "var(--game-gem)", deep: "var(--game-gem-deep)", gem: "var(--game-xp)" },
  { min: 20, name: "Adept", metal: "var(--game-epic)", deep: "var(--game-epic-deep)", gem: "var(--game-xp)" },
  { min: 30, name: "Expert", metal: "var(--game-flame)", deep: "var(--game-flame-deep)", gem: "var(--game-xp)" },
  { min: 40, name: "Master", metal: "var(--game-xp)", deep: "var(--game-xp-deep)", gem: "var(--game-on-solid)" },
  { min: 50, name: "Grandmaster", metal: "var(--game-xp)", deep: "var(--game-flame-deep)", gem: "var(--game-epic)" },
] as const;

export function getRankTier(level: number): number {
  let tier = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (level >= RANK_TIERS[i].min) tier = i;
  }
  return tier;
}

type ArtProps = { size?: number; className?: string; animated?: boolean };

/** Tier 0 — a single spark. Everyone starts here. */
function NoviceArt({ c }: { c: (typeof RANK_TIERS)[number] }) {
  return (
    <>
      <circle cx="32" cy="34" r="16" fill={c.deep} />
      <circle cx="32" cy="32" r="14" fill={c.metal} />
      <path d="M33.6 20 24 34h7l-.7 10L41 30h-7.8l.4-10Z" fill={c.gem} />
    </>
  );
}

/** Tier 1 — a closed tome. */
function ApprenticeArt({ c }: { c: (typeof RANK_TIERS)[number] }) {
  return (
    <>
      <rect x="15" y="14" width="34" height="38" rx="4" fill={c.deep} />
      <rect x="18" y="17" width="31" height="32" rx="3" fill={c.metal} />
      <rect x="15" y="14" width="7" height="38" rx="3" fill={c.deep} />
      <path d="m33.5 24 2.3 4.7 5.2.8-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.6 5.2-.8L33.5 24Z" fill={c.gem} />
    </>
  );
}

/** Tier 2 — open book framed by laurel. */
function ScholarArt({ c }: { c: (typeof RANK_TIERS)[number] }) {
  return (
    <>
      <path d="M12 22c6 8 6 18 0 26M52 22c-6 8-6 18 0 26" stroke={c.deep} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M32 24c-4-3-10-4-15-3v22c5-1 11 0 15 3 4-3 10-4 15-3V21c-5-1-11 0-15 3Z" fill={c.deep} />
      <path d="M32 26c-3.5-2.5-8.5-3.4-13-2.6v18c4.5-.8 9.5.1 13 2.6 3.5-2.5 8.5-3.4 13-2.6v-18c-4.5-.8-9.5.1-13 2.6Z" fill={c.metal} />
      <path d="M32 26v20" stroke={c.deep} strokeWidth="2" />
      <circle cx="32" cy="18" r="4" fill={c.gem} />
    </>
  );
}

/** Tier 3 — shield with a star. */
function AdeptArt({ c }: { c: (typeof RANK_TIERS)[number] }) {
  return (
    <>
      <path d="M32 8 54 15.6v19.2c0 13.6-9.3 23.5-22 28.2-12.7-4.7-22-14.6-22-28.2V15.6L32 8Z" fill={c.deep} />
      <path d="M32 13 49 18.9v15.9c0 11-7.4 19.2-17 23.2-9.6-4-17-12.2-17-23.2V18.9L32 13Z" fill={c.metal} />
      <path d="m32 23 3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1L32 41.6l-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2L32 23Z" fill={c.gem} />
    </>
  );
}

/** Tier 4 — winged crest. */
function ExpertArt({ c }: { c: (typeof RANK_TIERS)[number] }) {
  return (
    <>
      <path d="M10 24c-5 1-8 4-9 7 5 0 9 1 12 3l3-8-6-2ZM54 24c5 1 8 4 9 7-5 0-9 1-12 3l-3-8 6-2Z" fill={c.deep} />
      <path d="M32 8 52 15v18c0 12.8-8.6 22.2-20 26.6C20.6 55.2 12 45.8 12 33V15L32 8Z" fill={c.deep} />
      <path d="M32 13 47.5 18.6v14.6c0 10.3-6.7 18-15.5 21.7-8.8-3.7-15.5-11.4-15.5-21.7V18.6L32 13Z" fill={c.metal} />
      <path d="m32 22 3.9 8 8.8 1.3-6.4 6.2 1.5 8.7L32 42.1l-7.8 4.1 1.5-8.7-6.4-6.2 8.8-1.3L32 22Z" fill={c.gem} />
    </>
  );
}

/** Tier 5 — crown. */
function MasterArt({ c }: { c: (typeof RANK_TIERS)[number] }) {
  return (
    <>
      <path d="M8 22l9 9 11-15 11 15 9-9 4 28H4l4-28Z" fill={c.deep} />
      <path d="M11 25.5l6.5 6.5L28 18l10.5 14 6.5-6.5 3 21.5H8l3-21.5Z" fill={c.metal} transform="translate(4,1)" />
      <rect x="12" y="52" width="40" height="6" rx="3" fill={c.deep} />
      <circle cx="32" cy="34" r="4" fill={c.gem} />
      <circle cx="20" cy="38" r="2.6" fill={c.gem} />
      <circle cx="44" cy="38" r="2.6" fill={c.gem} />
    </>
  );
}

/** Tier 6 — radiant crown. */
function GrandmasterArt({ c }: { c: (typeof RANK_TIERS)[number] }) {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <rect
          key={i}
          x="31"
          y="1"
          width="2"
          height="8"
          rx="1"
          fill={c.gem}
          opacity={0.6}
          transform={`rotate(${i * 45} 32 32)`}
        />
      ))}
      <path d="M8 24l9 9 11-15 11 15 9-9 4 28H4l4-28Z" fill={c.deep} />
      <path d="M11 27.5l6.5 6.5L28 20l10.5 14 6.5-6.5 3 21.5H8l3-21.5Z" fill={c.metal} transform="translate(4,1)" />
      <rect x="12" y="54" width="40" height="6" rx="3" fill={c.deep} />
      <path d="m32 30 2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9L32 30Z" fill={c.gem} />
    </>
  );
}

const ART = [NoviceArt, ApprenticeArt, ScholarArt, AdeptArt, ExpertArt, MasterArt, GrandmasterArt];

export function RankArt({
  level,
  size = 96,
  className,
  animated = true,
}: ArtProps & { level: number }) {
  const tier = getRankTier(level);
  const c = RANK_TIERS[tier];
  const Art = ART[tier];

  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {tier >= 3 && (
        <span
          aria-hidden
          className={cn("absolute inset-0 rounded-full blur-xl", animated && "animate-halo")}
          style={{ background: c.metal, opacity: 0.3 }}
        />
      )}
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        aria-hidden
        className={cn("relative", animated && "animate-float")}
      >
        <Art c={c} />
      </svg>
    </span>
  );
}
