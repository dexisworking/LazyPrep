import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight health check + keep-warm endpoint. Ping this every ~4 minutes
// (external cron, e.g. cron-job.org) to stop Neon's free-tier compute from
// suspending, which eliminates cold-start latency/errors. Public (not behind
// auth middleware).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
