"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

/**
 * Renders the `?error=` code Better Auth appends when an OAuth callback fails.
 *
 * These failures used to be invisible: the provider redirect landed on the
 * landing page carrying `?error=account_not_linked`, nothing read it, and the
 * user just saw the marketing site again with no idea their sign-in had been
 * rejected. The Google button now sends failures back to the auth screen, and
 * this turns the code into something actionable.
 */
const MESSAGES: Record<string, string> = {
  account_not_linked:
    "That email is already registered with a different sign-in method. Sign in with your email and password instead, then link Google from Settings.",
  email_not_verified: "Please verify your email address before signing in.",
  signup_disabled: "New sign-ups with this provider are currently disabled.",
  unable_to_create_user: "We couldn't create your account. Please try again.",
  state_mismatch: "That sign-in link expired. Please try again.",
  invalid_state: "That sign-in link expired. Please try again.",
  please_restart_the_process: "Something interrupted the sign-in. Please try again.",
};

export function AuthErrorNotice() {
  const error = useSearchParams().get("error");
  if (!error) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-control border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        {MESSAGES[error] ?? "Sign-in failed. Please try again."}
      </span>
    </div>
  );
}
