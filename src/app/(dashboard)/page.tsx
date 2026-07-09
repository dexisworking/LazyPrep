"use client";

import { useSession } from "@/lib/auth-client";
import { Zap, Play, CheckCircle2, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Explorer";

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-8 relative overflow-hidden">
        {/* Gradient effect */}
        <div className="absolute right-0 top-0 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
        
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            Active Certification: CCNA
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            You're currently in the **Beginner** rank (Level 1). Complete lessons, solve practice questions, and review flashcards to unlock your next rank!
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Continue Learning */}
        <Card className="md:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Play className="h-4 w-4 text-primary fill-primary/10" />
              Continue Learning
            </CardTitle>
            <CardDescription>Resume exactly where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-background/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-semibold text-foreground">Network Fundamentals</h4>
                <p className="text-xs text-muted-foreground mt-1">Module 1 • Chapter 1 • Lesson 1: Introduction to Networks</p>
              </div>
              <Link
                href="/courses/ccna/network-fundamentals/introduction-to-networks"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 self-start sm:self-auto"
              >
                Resume Lesson
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Mission */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-np-success" />
              Today's Mission
            </CardTitle>
            <CardDescription>Daily challenges for bonus XP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { task: "Read 1 lesson", completed: false },
              { task: "Solve 5 MCQs", completed: false },
              { task: "Review 10 flashcards", completed: false },
            ].map((mission, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className="h-4 w-4 rounded border border-muted-foreground/30 flex-shrink-0" />
                <span className="text-muted-foreground">{mission.task}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Study Time", value: "0 mins", icon: Play, color: "text-primary bg-primary/10" },
          { label: "Streak Count", value: "3 days", icon: Flame, color: "text-np-streak bg-np-streak/10" },
          { label: "XP Earned", value: "120 XP", icon: Trophy, color: "text-np-orange bg-np-orange/10" },
          { label: "Accuracy", value: "0%", icon: Target, color: "text-np-red bg-np-red/10" },
        ].map((stat, idx) => (
          <Card key={idx} className="border-border/50 bg-card/50">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{stat.value}</h3>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
