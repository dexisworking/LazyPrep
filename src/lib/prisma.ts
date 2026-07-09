import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Use node-postgres (TCP) rather than the Neon WebSocket serverless driver.
// TCP connections wait for a suspended Neon compute to wake instead of
// fast-failing, which eliminates the intermittent connection errors we saw
// on cold starts. This is also the right fit for the Vercel Node runtime.

/**
 * Only retry errors that mean the query never reached the database (connection
 * establishment failures). This is safe — the query didn't run, so retrying
 * can't double-execute a write. Neon free-tier computes suspend after ~5 min
 * and the first request can fail while the compute wakes.
 */
function isConnectionError(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err);
  return /DatabaseNotReachable|Can't reach database server|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|Connection terminated unexpectedly|the database system is starting up/i.test(
    msg,
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const createPrismaClient = () => {
  // Strip `sslmode`/`channel_binding` from the URL and supply TLS via config.
  // pg 8.22 emits a deprecation warning when it parses `sslmode=require`; this
  // keeps the identical "encrypt, don't verify CA" behavior without the noise.
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");

  const adapter = new PrismaPg({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
  });

  return new PrismaClient({ adapter }).$extends({
    query: {
      async $allOperations({ args, query }) {
        const maxAttempts = 4;
        let lastError: unknown;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            lastError = err;
            if (attempt === maxAttempts || !isConnectionError(err)) throw err;
            // Backoff gives a cold Neon compute time to wake: 0.3s, 0.9s, 1.8s.
            await sleep(300 * attempt * attempt);
          }
        }
        throw lastError;
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
