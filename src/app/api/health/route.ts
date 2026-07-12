import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight health check + keep-warm endpoint. Ping this every ~4 minutes
// (external cron, e.g. cron-job.org) to stop Neon's free-tier compute from
// suspending, which eliminates cold-start latency/errors. Public (not behind
// auth middleware).
export const dynamic = "force-dynamic";

// Neon free tier is ~512 MB; surface DB size so growth is observable (set a
// Neon usage alert too). Cast to float8 in SQL to avoid BigInt JSON issues.
const DB_LIMIT_MB = 512;

export async function GET() {
  try {
    const [{ size_mb }] = await prisma.$queryRaw<{ size_mb: number }[]>`
      SELECT (pg_database_size(current_database()) / 1024.0 / 1024.0)::float8 AS size_mb`;
    const dbSizeMb = Math.round(size_mb * 10) / 10;
    return NextResponse.json({
      ok: true,
      db: "up",
      dbSizeMb,
      dbLimitMb: DB_LIMIT_MB,
      dbUsedPct: Math.round((dbSizeMb / DB_LIMIT_MB) * 1000) / 10,
    });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
