"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, Loader2, CheckCircle2 } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { sendVerificationEmail } from "@/lib/auth-client";

export function VerifyNotice({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const resend = async () => {
    setStatus("sending");
    try {
      const res = await sendVerificationEmail({ email, callbackURL: "/dashboard" });
      setStatus(res.error ? "error" : "sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-center gap-2">
        <LogoMark className="h-8 w-8" />
        <Wordmark className="text-xl" />
      </div>

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="h-7 w-7 text-primary" />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to <span className="text-foreground">{email}</span>. Click it
          to activate your account.
        </p>
      </div>

      <div className="space-y-3">
        {status === "sent" ? (
          <p className="flex items-center justify-center gap-1.5 text-sm text-np-success">
            <CheckCircle2 className="h-4 w-4" />
            Verification email resent.
          </p>
        ) : (
          <button
            onClick={resend}
            disabled={status === "sending"}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
            Resend verification email
          </button>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive">Couldn&apos;t resend. Try again in a moment.</p>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
