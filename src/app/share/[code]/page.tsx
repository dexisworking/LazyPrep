import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookOpen, Trophy, Sparkles, Share2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SharedCoursePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const course = await prisma.course.findFirst({
    where: { shareCode: code, isShared: true },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          chapters: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                select: { id: true, title: true, estimatedMinutes: true },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.chapters.reduce((cAcc, c) => cAcc + c.lessons.length, 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Lazy<span className="text-primary">Prep</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Share2 className="h-3.5 w-3.5" /> Read-Only Shared View
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 p-6 py-10">
        <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary uppercase">
              {course.category}
            </span>
            {course.adaptive && (
              <span className="inline-flex items-center gap-1 rounded-full border border-np-success/20 bg-np-success/10 px-2.5 py-0.5 text-xs font-medium text-np-success">
                <Sparkles className="h-3 w-3" /> Adaptive Mastery Path
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          {course.description && (
            <p className="text-muted-foreground">{course.description}</p>
          )}
          <div className="text-xs text-muted-foreground font-medium pt-2 border-t border-border/40">
            {course.modules.length} Modules · {totalLessons} Lessons total
          </div>
        </div>

        {/* Modules breakdown */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Course Syllabus</h2>
          {course.modules.map((m, mIdx) => (
            <div key={m.id} className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {mIdx + 1}
                  </span>
                  {m.title}
                </h3>
              </div>
              <div className="space-y-3 pl-2">
                {m.chapters.map((c) => (
                  <div key={c.id} className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {c.title}
                    </h4>
                    <ul className="space-y-1">
                      {c.lessons.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-foreground">{l.title}</span>
                          <span className="text-xs text-muted-foreground">{l.estimatedMinutes} min</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
