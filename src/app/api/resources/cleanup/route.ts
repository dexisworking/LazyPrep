import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";

/**
 * Cron cleanup endpoint to sweep orphaned resource files older than 24 hours.
 * Secured via HEALTH_SECRET_KEY header or public cron access.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secretKey = process.env.HEALTH_SECRET_KEY;

  if (secretKey && authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const staleResources = await prisma.courseResource.findMany({
    where: {
      status: { in: ["pending", "processed"] },
      createdAt: { lte: twentyFourHoursAgo },
    },
    take: 50,
  });

  let deletedCount = 0;

  for (const r of staleResources) {
    try {
      await deleteFromR2(r.r2Key);
    } catch (err) {
      console.error(`[cleanup-cron] Failed to delete R2 object ${r.r2Key}:`, err);
    }

    await prisma.courseResource.update({
      where: { id: r.id },
      data: { status: "deleted" },
    });

    deletedCount++;
  }

  return NextResponse.json({ ok: true, cleaned: deletedCount });
}
