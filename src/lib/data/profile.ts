import { prisma } from "@/lib/prisma";
import { dayDate, DEFAULT_TZ } from "@/lib/day";

/** Aggregate lifetime stats for a profile. */
export async function getProfileStats(profileId: string) {
  const lessonsCompleted = await prisma.progress.count({
    where: { profileId, completed: true },
  });
  const totalAttempts = await prisma.questionAttempt.count({ where: { profileId } });
  const correctAttempts = await prisma.questionAttempt.count({
    where: { profileId, correct: true },
  });
  const agg = await prisma.studySession.aggregate({
    where: { profileId },
    _sum: { flashcardsReviewed: true, xpEarned: true },
  });
  const studyDays = await prisma.studySession.count({ where: { profileId } });

  return {
    lessonsCompleted,
    totalAttempts,
    correctAttempts,
    accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
    flashcardsReviewed: agg._sum.flashcardsReviewed ?? 0,
    studyDays,
  };
}

export type HeatmapDay = {
  date: Date;
  xpEarned: number;
  questionsAnswered: number;
  lessonsCompleted: number;
  flashcardsReviewed: number;
};

/** Daily study sessions within the given lookback window, for the heatmap. */
export async function getHeatmapData(
  profileId: string,
  tz: string = DEFAULT_TZ,
  days = 182,
): Promise<HeatmapDay[]> {
  const start = dayDate(new Date(Date.now() - days * 86_400_000), tz);
  return prisma.studySession.findMany({
    where: { profileId, date: { gte: start } },
    orderBy: { date: "asc" },
    select: {
      date: true,
      xpEarned: true,
      questionsAnswered: true,
      lessonsCompleted: true,
      flashcardsReviewed: true,
    },
  });
}
