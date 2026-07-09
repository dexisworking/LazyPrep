import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// node-postgres (TCP) driver — waits for a suspended Neon compute to wake
// instead of fast-failing, and is the right fit for the Vercel Node runtime.
//
// IMPORTANT: do NOT wrap this client with `$extends`, nor wrap the driver
// adapter/pool in a Proxy — Better Auth's prismaAdapter reads the model map off
// the client and silently registers ZERO routes (every /api/auth/* → 404) when
// it isn't a plain PrismaClient. Neon free-tier cold starts are handled by a
// keep-warm ping to /api/health, not by a client-level retry.
const createPrismaClient = () => {
  // Strip `sslmode`/`channel_binding` from the URL and supply TLS via config.
  // pg 8.22 warns when it parses `sslmode=require`; this keeps the identical
  // "encrypt, don't verify CA" behavior without the noise.
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");

  const adapter = new PrismaPg({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
