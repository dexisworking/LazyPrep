import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 configuration.
// The runtime PrismaClient uses the Neon driver adapter (see src/lib/prisma.ts).
// The CLI (migrate / db push / introspect / seed) uses the direct, non-pooled
// connection below.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use the direct (non-pooled) Neon URL for migrations.
    url: process.env.DIRECT_URL,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
