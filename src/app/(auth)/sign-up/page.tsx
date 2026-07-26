import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SignUpForm } from "./sign-up-form";

// Render per-request so the Google / email-verification flags reflect runtime
// env (a static prerender would bake in the build-time values).
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const emailVerificationEnabled = Boolean(process.env.RESEND_API_KEY);

  // The form reads `?error=` from an OAuth bounce via `useSearchParams`, which
  // needs a boundary — mirrors the sign-in page.
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignUpForm
        googleEnabled={googleEnabled}
        emailVerificationEnabled={emailVerificationEnabled}
      />
    </Suspense>
  );
}
