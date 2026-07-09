import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Use node-postgres (TCP) rather than the Neon WebSocket serverless driver.
// TCP connections wait for a suspended Neon compute to wake instead of
// fast-failing, which makes cold-start connection errors rare. This is also
// the right fit for the Vercel Node runtime.
//
// NOTE: do NOT wrap this client with `$extends` — Better Auth's prismaAdapter
// reads the model map off the client and silently registers zero routes when
// given an extended (proxied) client.
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
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
