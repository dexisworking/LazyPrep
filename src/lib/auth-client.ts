import { createAuthClient } from "better-auth/react";

// When NEXT_PUBLIC_APP_URL is unset, leave baseURL undefined so Better Auth
// uses the current origin. Never fall back to localhost — that would break the
// login button in production if the env var is missing.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || undefined,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  sendVerificationEmail,
  requestPasswordReset,
  resetPassword,
} = authClient;
