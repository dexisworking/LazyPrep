import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Use node-postgres (TCP) rather than the Neon WebSocket serverless driver.
// TCP connections wait for a suspended Neon compute to wake instead of
// fast-failing, which eliminates the intermittent connection errors we saw
// on cold starts. This is also the right fit for the Vercel Node runtime.
const createPrismaClient = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
