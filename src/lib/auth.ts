import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendResetPasswordEmail, emailEnabled } from "@/lib/email";

// Fail fast in production if transactional email isn't configured: without it,
// `requireEmailVerification` silently turns OFF and signup would accept
// unverified/fake emails. The default onboarding@resend.dev sender only delivers
// to our own Resend account, so treat it as "not configured" too.
if (process.env.NODE_ENV === "production") {
  const from = process.env.EMAIL_FROM ?? "";
  if (!process.env.RESEND_API_KEY || !from || from.includes("resend.dev")) {
    throw new Error(
      "Production requires RESEND_API_KEY and a verified EMAIL_FROM (not @resend.dev) so email verification is enforced.",
    );
  }
}

/** Google OAuth is enabled only when both credentials are configured. */
export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

/** Email verification is enforced only when Resend (email) is configured. */
export const emailVerificationEnabled = emailEnabled;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Lock callback/redirect origins to our own domains (dev + prod).
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL, process.env.BETTER_AUTH_URL].filter(
    (o): o is string => Boolean(o),
  ),

  // Abuse control for /api/auth/* — DB-backed so limits are shared across the
  // isolated serverless instances Vercel spins up (in-memory would not be).
  // NOTE: requires the `rateLimit` table (prisma migrate) to exist before deploy.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/send-verification-email": { window: 300, max: 3 },
      "/request-password-reset": { window: 300, max: 3 },
      "/reset-password": { window: 300, max: 5 },
    },
  },

  emailAndPassword: {
    enabled: true,
    // Require verification only when we can actually send the email.
    requireEmailVerification: emailVerificationEnabled,
    // Password reset via emailed link. No-ops locally when email is unconfigured
    // (mirrors sendVerificationEmail); enforced-configured in production above.
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, user.name, url);
    },
  },

  emailVerification: {
    sendOnSignUp: emailVerificationEnabled,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, user.name, url);
    },
  },

  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Create a gamification Profile for every new user (email + social).
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.profile.create({
            data: {
              userId: user.id,
              displayName: user.name,
            },
          });
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
