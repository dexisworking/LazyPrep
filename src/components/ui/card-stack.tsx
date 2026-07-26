"use client";

/**
 * Fanning card stack for product shots.
 *
 * Adapted from the kokonutui "Card Stack" pattern. Changes for LazyPrep: the
 * cards are data-driven via props (the reference hard-coded its own payments
 * copy), the media slot is portrait because our mockups are phone screens, and
 * the whole thing expands on hover as well as click so a desktop visitor
 * discovers the fan without having to guess it's interactive.
 *
 * The reference wrapped the entire stack in one `<button>`; that leaves a
 * ~440px-tall control with no accessible name beyond an aria-label, so the
 * toggle here is a real button in the corner and the stack itself is inert
 * decoration.
 */

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Layers } from "lucide-react";

import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type StackCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  alt: string;
  specs: { label: string; value: string }[];
};

const CARD_WIDTH = 296;
const CARD_OVERLAP = 218;

function Card({
  card,
  index,
  total,
  expanded,
  reduced,
}: {
  card: StackCard;
  index: number;
  total: number;
  expanded: boolean;
  reduced: boolean;
}) {
  // Collapsed: a tight, slightly rotated deck. Expanded: an even fan, centred.
  const collapsed = {
    x: index * 10 - (total - 1) * 5,
    y: index * 3,
    rotate: reduced ? 0 : index * 1.6,
  };

  const fanWidth = CARD_WIDTH + (total - 1) * (CARD_WIDTH - CARD_OVERLAP);
  const open = {
    x: index * (CARD_WIDTH - CARD_OVERLAP) - fanWidth / 2 + CARD_WIDTH / 2,
    y: 0,
    rotate: reduced ? 0 : index * 4 - (total - 1) * 2,
  };

  return (
    <motion.div
      initial={collapsed}
      animate={{ ...(expanded ? open : collapsed), zIndex: total - index }}
      transition={
        reduced
          ? { duration: 0 }
          : { ...SPRING.smooth, delay: expanded ? index * 0.04 : 0 }
      }
      style={{ width: CARD_WIDTH, left: "50%", marginLeft: -CARD_WIDTH / 2 }}
      className={cn(
        "absolute top-0 transform-gpu overflow-hidden rounded-[1.5rem] p-4",
        "border border-border-subtle bg-card/70 backdrop-blur-xl",
        "shadow-overlay",
      )}
    >
      <dl className="mb-3 grid grid-cols-4 gap-1.5">
        {card.specs.map((spec) => (
          <div key={spec.label} className="min-w-0">
            <dd className="truncate text-2xs font-semibold text-foreground">{spec.value}</dd>
            <dt className="truncate text-3xs text-muted-foreground">{spec.label}</dt>
          </div>
        ))}
      </dl>

      <div className="relative aspect-[9/13] w-full overflow-hidden rounded-control border border-border-subtle bg-secondary">
        <Image
          src={card.image}
          alt={card.alt}
          fill
          sizes="296px"
          className="object-cover object-top"
        />
      </div>

      <div className="mt-3">
        <p className="text-lg font-bold leading-tight tracking-tight text-foreground">
          {card.title}
        </p>
        <p className="text-lg font-semibold leading-tight tracking-tight text-muted-foreground">
          {card.subtitle}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {card.description}
        </p>
      </div>
    </motion.div>
  );
}

export function CardStack({
  cards,
  className,
}: {
  cards: StackCard[];
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn("relative mx-auto w-full", className)}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="relative h-[560px]">
        {cards.map((card, i) => (
          <Card
            key={card.id}
            card={card}
            index={i}
            total={cards.length}
            expanded={expanded}
            reduced={reduced}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="absolute -bottom-2 left-1/2 z-[100] inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border-subtle bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors duration-(--dur-fast) hover:text-foreground"
      >
        <Layers className="h-3.5 w-3.5" />
        {expanded ? "Collapse" : "Fan out the deck"}
      </button>
    </div>
  );
}

export default CardStack;
