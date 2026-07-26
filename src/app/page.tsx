import Link from "next/link";
import { Flame, ArrowRight, Smartphone, Globe, Play } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { SiteFooter } from "@/components/shared/site-footer";
import { InstallHint } from "@/components/shared/install-hint";
import { SlideUp } from "@/components/motion/motion";
import { CourseDemoWidget } from "@/components/landing/course-demo-widget";
import { FeatureBento } from "@/components/landing/feature-bento";
import { ElegantShapes } from "@/components/ui/elegant-shapes";
import { CardStack, type StackCard } from "@/components/ui/card-stack";

/** The three product shots, fanned out in the download section. */
const MOCKUP_CARDS: StackCard[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    subtitle: "Your daily HUD",
    description: "Streak, XP, level and today's quests — the first thing you see each morning.",
    image: "/mockups/hero.webp",
    alt: "LazyPrep dashboard showing course progress, streak and daily XP",
    specs: [
      { label: "Streak", value: "42d" },
      { label: "Level", value: "17" },
      { label: "XP today", value: "84" },
      { label: "Quests", value: "3" },
    ],
  },
  {
    id: "practice",
    title: "Practice",
    subtitle: "MCQs that stick",
    description: "Every miss lands in your Wrong-Answer Notebook until you've truly got it.",
    image: "/mockups/practice.webp",
    alt: "LazyPrep practice questions on Android",
    specs: [
      { label: "Accuracy", value: "78%" },
      { label: "Answered", value: "1.2k" },
      { label: "Notebook", value: "42" },
      { label: "Mocks", value: "6" },
    ],
  },
  {
    id: "flashcards",
    title: "Flashcards",
    subtitle: "Spaced repetition",
    description: "SM-2 scheduling resurfaces each card right before you'd forget it.",
    image: "/mockups/flashcards.webp",
    alt: "LazyPrep spaced-repetition flashcards on Android",
    specs: [
      { label: "Due today", value: "24" },
      { label: "Mature", value: "310" },
      { label: "Retention", value: "91%" },
      { label: "Decks", value: "5" },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border-subtle bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <Wordmark className="text-lg" />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-control px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[background-color,border-color,color,box-shadow,opacity,transform] hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/*
        Hero — asymmetric split, not a centred stack.
        The background is a fine technical grid faded out with a radial mask,
        rather than the pair of large blurred colour blobs this used to have.
      */}
      <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:pt-32 lg:pb-24">
        {/*
          Two background layers, in order: drifting colour slabs, then the
          technical grid over them. Both are masked/low-alpha so the hero copy
          keeps its contrast — the shapes never exceed ~12%.
        */}
        <ElegantShapes className="[mask-image:radial-gradient(ellipse_85%_75%_at_50%_20%,black,transparent)]" />
        <div
          aria-hidden
          className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Copy — left aligned on every breakpoint */}
          <SlideUp className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
              <Flame className="h-3.5 w-3.5" />
              <span>The operating system for serious exam preparation</span>
            </div>

            {/*
              Hierarchy comes from weight and colour, not a three-stop gradient
              fill and a 60px type size.
            */}
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tighter text-balance sm:text-5xl lg:text-[3.5rem]">
              Prepare smarter.
              <br />
              <span className="text-muted-foreground">Pass with confidence.</span>
            </h1>

            <p className="max-w-[54ch] text-base leading-relaxed text-muted-foreground">
              One platform for <span className="text-foreground">any</span> exam — a certification,
              a university course, or a competitive test. Study curated content, or generate a
              complete course for any subject with your own AI key. Lessons, MCQs,
              spaced-repetition flashcards, analytics and streaks, in one place.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 rounded-control bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-(--dur-fast) hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_12%)] active:scale-[0.98]"
              >
                Start preparing — free
                <ArrowRight className="h-4 w-4 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-control border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-card hover:text-foreground"
              >
                I have an account
              </Link>
            </div>

            <InstallHint />

            {/* Subjects strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                "Certifications",
                "College courses",
                "GATE · GRE · UPSC",
                "Cloud & DevOps",
                "Languages",
                "Anything",
              ].map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border-subtle bg-card/40 px-3 py-1 text-xs text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </SlideUp>

          {/*
            A working demo, not a screenshot. This used to be a static phone
            mockup hidden below lg — a picture of the dashboard doesn't
            demonstrate the one thing the headline promises, and there's no
            reason to withhold an interactive widget from phone visitors.
          */}
          <SlideUp delay={0.08} className="relative w-full justify-self-end lg:max-w-[440px]">
            <div
              aria-hidden
              className="absolute -inset-x-6 -inset-y-5 rounded-[3rem] bg-primary/[0.04]"
            />
            <CourseDemoWidget className="relative" />
          </SlideUp>
        </div>
      </section>

      {/* Features — asymmetric bento, not six equal cards in three columns. */}
      <section className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
        <SlideUp inView className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tighter text-balance">
            Everything you need to <span className="text-primary">ace the exam</span>
          </h2>
          <p className="mt-3 max-w-[60ch] text-muted-foreground">
            No more scattered notes, random video playlists, or wondering what to study next.
          </p>
        </SlideUp>

        {/*
          A 6-track grid with varying spans gives a zig-zag rhythm (3/3, 4/2,
          2/4) instead of a uniform row. Collapses to one column under sm.
        */}
        <FeatureBento />
      </section>

      {/* Mobile App / Download — desktop only (hidden below lg) */}
      <section className="hidden border-t border-border-subtle bg-card/20 lg:block">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="grid grid-cols-[0.9fr_1.1fr] items-center gap-12">
            {/* Copy + download options */}
            <SlideUp inView className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                <Smartphone className="h-3.5 w-3.5" />
                <span>Study on the go</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Take LazyPrep <span className="text-primary">anywhere</span>
              </h2>
              <p className="max-w-md text-muted-foreground">
                Your courses, streaks and flashcards, in your pocket. The native Android app is on
                its way — and you can start right now, straight from your browser.
              </p>

              <div className="space-y-4 pt-2">
                {/* Google Play — placeholder, not yet live */}
                <div
                  aria-disabled="true"
                  role="button"
                  aria-label="Android app coming soon to Google Play"
                  className="relative inline-flex cursor-not-allowed select-none items-center gap-3 rounded-card border border-border bg-card/60 px-5 py-3 opacity-70"
                >
                  <Play className="h-6 w-6 fill-foreground text-foreground" />
                  <span className="text-left leading-tight">
                    <span className="block text-3xs uppercase tracking-wide text-muted-foreground">
                      Coming soon to
                    </span>
                    <span className="block text-sm font-semibold text-foreground">Google Play</span>
                  </span>
                  <span className="absolute -right-2 -top-2 rounded-full bg-np-streak px-2 py-0.5 text-3xs font-semibold text-background shadow-lg">
                    Coming Soon
                  </span>
                </div>

                {/* PWA suggestion — available today */}
                <div className="rounded-card border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="space-y-2.5">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">Available right now as a web app.</span>{" "}
                        Install LazyPrep to your home screen — it works like a native app, no store
                        required.
                      </p>
                      <div className="flex items-center gap-3">
                        <Link
                          href="/sign-up"
                          className="inline-flex items-center gap-1.5 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[background-color,border-color,color,box-shadow,opacity,transform] hover:opacity-90"
                        >
                          Open the web app
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          Then “Add to Home Screen” from your browser menu
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SlideUp>

            {/*
              Device mockups as a fanning deck. The old version was three
              absolutely-positioned images at fixed rotations — this carries the
              same three screens but lets a visitor pull them apart and read the
              stat strip on each.
            */}
            <SlideUp inView className="relative">
              <CardStack cards={MOCKUP_CARDS} />
            </SlideUp>
          </div>
        </div>
      </section>

      {/* Closing CTA — copy and action sit on opposite sides, not stacked centre. */}
      <section className="border-t border-border-subtle bg-card/30">
        <SlideUp
          inView
          className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 md:flex-row md:items-end md:justify-between lg:py-24"
        >
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tighter text-balance">
              Ready to ace your <span className="text-primary">next exam</span>?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free. No card, no trial timer — bring your own AI key when you want to generate
              your own courses.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-control bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-(--dur-fast) hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_12%)] active:scale-[0.98]"
          >
            Create free account
            <ArrowRight className="h-4 w-4 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5" />
          </Link>
        </SlideUp>
      </section>

      {/* Footer — DexForge-style cinematic footer */}
      <SiteFooter />
    </div>
  );
}
