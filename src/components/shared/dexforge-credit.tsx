/**
 * "Crafted at DexForge" credit — the signature DexForge glass pill.
 * `compact` renders the small in-app variant (sidebar / drawer footers);
 * the default is the full-size footer pill.
 */
export function DexForgeCredit({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="https://dexforge.iamdex.codes"
      target="_blank"
      rel="noopener noreferrer"
      className={
        compact
          ? "footer-glass-pill flex items-center justify-center gap-1.5 rounded-full px-4 py-2"
          : "footer-glass-pill flex items-center gap-2 rounded-full px-6 py-3"
      }
      aria-label="Crafted at DexForge"
    >
      <span
        className={
          compact
            ? "text-3xs font-bold uppercase tracking-widest text-muted-foreground"
            : "text-3xs font-bold uppercase tracking-widest text-muted-foreground md:text-xs"
        }
      >
        Crafted at DexForge
      </span>
      <span className={compact ? "text-2xs font-bold text-np-red" : "ml-1 font-bold text-np-red"}>
        {"</>"}
      </span>
    </a>
  );
}
