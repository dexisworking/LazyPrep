"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { GoogleButton } from "@/components/auth/google-button";
import { VerifyNotice } from "@/components/auth/verify-notice";
import { AuthErrorNotice } from "@/components/auth/auth-error-notice";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";

export function SignUpForm({
  googleEnabled,
  emailVerificationEnabled,
}: {
  googleEnabled: boolean;
  emailVerificationEnabled: boolean;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Belt and braces: the input is `required`, but the guard means a bypassed
    // or scripted submit still can't create an account without consent.
    if (!agreed) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.email({ email, password, name });
      if (result.error) {
        setError(result.error.message ?? "Sign up failed. Please try again.");
      } else if (emailVerificationEnabled) {
        setVerifyEmail(email);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (verifyEmail) {
    return <VerifyNotice email={verifyEmail} />;
  }

  return (
    <div className="space-y-6">
      {/* Logo & Heading */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <LogoMark className="h-9 w-9" />
          <Wordmark className="text-2xl" />
        </div>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start your preparation journey today</p>
      </div>

      {/*
        Consent gate, above both sign-up paths. Google sign-in creates an
        account just like the email form does, so it can't sit below a checkbox
        that only guards the form.
      */}
      <label
        htmlFor="terms"
        className="flex cursor-pointer items-start gap-2.5 rounded-control border border-border-subtle bg-card/50 p-3"
      >
        <input
          id="terms"
          name="terms"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <span className="text-xs leading-relaxed text-muted-foreground">
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="font-medium text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {/* Failure bounced back from an OAuth callback. */}
      <AuthErrorNotice />

      {googleEnabled && (
        <>
          <GoogleButton
            callbackUrl="/dashboard"
            label="Continue with Google"
            onError={setError}
            disabled={!agreed}
            errorCallbackUrl="/sign-up"
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
            </div>
          </div>
        </>
      )}

      {/* Email Form */}
      <form onSubmit={handleEmailSignUp} className="space-y-4">
        {error && (
          <div className="rounded-control border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex h-10 w-full rounded-control border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-10 w-full rounded-control border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="flex h-10 w-full rounded-control border border-input bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              // Padded to a 40px hit area — the bare 16px icon was well under
              // the touch-target minimum.
              className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-control text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Only once there's something to judge — an empty checklist on a
              pristine form reads as four errors. */}
          {password.length > 0 && <PasswordStrengthMeter password={password} className="pt-1" />}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="flex h-10 w-full rounded-control border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !agreed}
          className="flex w-full items-center justify-center gap-2 rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[background-color,border-color,color,box-shadow,opacity,transform] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
