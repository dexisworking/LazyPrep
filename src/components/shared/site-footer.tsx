"use client";

/**
 * NetPrep site footer — adapted from the DexForge homepage CinematicFooter.
 * Same visual language (diagonal marquee, giant outline text, glass pills,
 * 4-column links, "Crafted at DexForge" credit) rebuilt with CSS keyframes +
 * framer-motion scroll reveals instead of GSAP/WebGL. Zero heavy deps.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowUp,
  Award,
  BookOpen,
  Brain,
  BrainCircuit,
  Cloud,
  Flame,
  GitBranch,
  GraduationCap,
  Landmark,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { DexForgeCredit } from "@/components/shared/dexforge-credit";

const marqueeTokens = [
  { name: "CCNA", Icon: GitBranch },
  { name: "Security+", Icon: ShieldCheck },
  { name: "AWS", Icon: Cloud },
  { name: "GATE · GRE · UPSC", Icon: Landmark },
  { name: "College Courses", Icon: GraduationCap },
  { name: "AI Courses", Icon: Sparkles },
  { name: "MCQ Practice", Icon: Target },
  { name: "Flashcards", Icon: Layers },
  { name: "Spaced Repetition", Icon: Brain },
  { name: "Mock Tests", Icon: Award },
  { name: "Mastery Paths", Icon: BrainCircuit },
  { name: "Streaks & XP", Icon: Flame },
];

function MarqueeItem() {
  return (
    <div className="flex items-center space-x-12 px-6">
      {marqueeTokens.map(({ name, Icon }) => (
        <span key={name} className="flex items-center gap-2 whitespace-nowrap">
          <span>{name}</span>
          <Icon className="h-4 w-4 text-primary/60" aria-hidden />
        </span>
      ))}
    </div>
  );
}

const productLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Practice", href: "/practice" },
  { label: "Flashcards", href: "/flashcards" },
  { label: "Create with AI", href: "/courses/new" },
];

const accountLinks = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Sign up", href: "/sign-up" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Settings", href: "/settings" },
];

const socials = [
  { label: "GitHub", href: "https://github.com/dexisworking", Icon: GitBranch },
  { label: "X (Twitter)", href: "https://x.com/SekharDibyanshu", Icon: X },
];

export function SiteFooter() {
  const reduced = useReducedMotion();

  const reveal = (delay = 0) => ({
    initial: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

  return (
    <div className="relative mt-10 w-full overflow-hidden border-t border-border/50">
      <footer className="relative flex w-full flex-col justify-between bg-background text-foreground">
        {/* Ambient glow + grid background (replaces the DexForge WebGL shader) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[130px]" />
          <div className="absolute bottom-0 right-0 h-[350px] w-[500px] translate-x-1/4 rounded-full bg-accent/8 blur-[120px]" />
        </div>
        <div className="bg-grid pointer-events-none absolute inset-0 z-0 opacity-20" />

        {/* Giant background text */}
        <div
          className="footer-giant-bg-text pointer-events-none absolute bottom-0 left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          aria-hidden
        >
          NETPREP
        </div>

        {/* 1. Diagonal marquee */}
        <div className="relative z-20 -rotate-1 mb-8 mt-12 w-full scale-105 overflow-hidden border-y border-border/50 bg-background/60 py-4 shadow-2xl backdrop-blur-md">
          <div className="flex w-max animate-footer-scroll-marquee text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground md:text-sm">
            <MarqueeItem />
            <MarqueeItem />
          </div>
        </div>

        {/* 2. Center headline + CTA */}
        <div className="relative z-10 mx-auto mb-20 mt-16 flex w-full max-w-5xl flex-1 flex-col items-center justify-center border-b border-border/50 px-6 pb-20">
          <motion.h2
            {...reveal()}
            className="mb-12 text-center text-5xl font-black uppercase tracking-tighter text-foreground sm:text-7xl md:text-8xl"
          >
            Master <br />
            <span className="bg-gradient-to-r from-primary via-accent to-np-orange bg-clip-text text-transparent">
              Anything.
            </span>
          </motion.h2>

          <motion.div {...reveal(0.15)} className="flex w-full flex-col items-center gap-6">
            <Link
              href="/sign-up"
              className="group inline-flex items-center justify-center rounded-full bg-foreground px-10 py-5 text-lg font-bold text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
            >
              Start Preparing — Free
              <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* 3. 4-column links */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...reveal(0.1)}
            className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8"
          >
            {/* Brand */}
            <div>
              <div className="mb-6 flex items-center gap-2">
                <LogoMark className="h-8 w-8" />
                <Wordmark className="text-xl" />
              </div>
              <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
                The Preparation Operating System. Curated and AI-generated courses, practice,
                spaced repetition and analytics — for any exam you&apos;re chasing.
              </p>
              <div className="flex gap-3">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-glass-pill flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="mb-6 text-xs font-medium uppercase tracking-wider text-foreground/80">
                Product
              </h3>
              <ul className="space-y-3.5">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="mb-6 text-xs font-medium uppercase tracking-wider text-foreground/80">
                Account
              </h3>
              <ul className="space-y-3.5">
                {accountLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & contact */}
            <div>
              <h3 className="mb-6 text-xs font-medium uppercase tracking-wider text-foreground/80">
                Legal &amp; Contact
              </h3>
              <ul className="space-y-3.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition-colors hover:text-foreground">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hello@iamdex.codes"
                    className="transition-colors hover:text-primary"
                  >
                    hello@iamdex.codes
                  </a>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1.5 text-xs text-primary">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    Built with care, shipped fast
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Bottom bar / credits */}
          <div className="flex flex-col items-center justify-between gap-6 border-t border-border/50 pb-8 pt-8 md:flex-row">
            <div className="order-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:order-1 md:text-xs">
              © {new Date().getFullYear()} NetPrep. All rights reserved.
            </div>

            <div className="order-1 md:order-2">
              <DexForgeCredit />
            </div>

            <button
              onClick={scrollToTop}
              className="footer-glass-pill group order-3 flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Back to top"
            >
              <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
