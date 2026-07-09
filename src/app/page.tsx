import Link from "next/link";
import { Zap, BookOpen, Brain, Target, BarChart3, Flame, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Net<span className="text-primary">Prep</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        {/* Gradient Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-3xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Flame className="h-3.5 w-3.5" />
            <span>The Operating System for Serious Exam Preparation</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Prepare Smarter.
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-np-red bg-clip-text text-transparent">
              Pass with Confidence.
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Your complete preparation command center. Notes, MCQs, flashcards,
            labs, analytics, and gamified learning — all in one platform designed
            to eliminate decision fatigue.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:gap-3"
            >
              Start Preparing — Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/sign-in"
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="text-primary">ace the exam</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            No more scattered notes, random YouTube playlists, or wondering what to study next.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Rich Study Notes",
              description:
                "Beautifully formatted lessons with diagrams, code blocks, and embedded references. Never lose your place.",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              icon: Target,
              title: "MCQ Practice Engine",
              description:
                "Thousands of questions filtered by topic, difficulty, and your weak areas. Wrong answers tracked automatically.",
              color: "text-accent",
              bg: "bg-accent/10",
            },
            {
              icon: Brain,
              title: "Smart Flashcards",
              description:
                "Swipeable cards that prioritize topics you struggle with. Study the right things at the right time.",
              color: "text-np-red",
              bg: "bg-np-red/10",
            },
            {
              icon: BarChart3,
              title: "Real-Time Analytics",
              description:
                "Track study time, accuracy, completion, and progress. Know exactly where you stand before exam day.",
              color: "text-np-success",
              bg: "bg-np-success/10",
            },
            {
              icon: Flame,
              title: "Gamified Experience",
              description:
                "XP, levels, streaks, ranks, and daily quests. Stay motivated with rewards that make studying addictive.",
              color: "text-np-streak",
              bg: "bg-np-streak/10",
            },
            {
              icon: Zap,
              title: "Mission Control Dashboard",
              description:
                "Open the app and instantly know: what to study, what to revise, and how ready you are.",
              color: "text-primary",
              bg: "bg-primary/10",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}
              >
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to start your{" "}
            <span className="text-primary">CCNA</span> journey?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join NetPrep today — completely free. No credit card required.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">NetPrep</span>
          </div>
          <p className="text-xs text-muted-foreground">
            The Preparation Operating System
          </p>
        </div>
      </footer>
    </div>
  );
}
