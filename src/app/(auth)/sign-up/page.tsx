import { SignUpForm } from "./sign-up-form";

// Render per-request so the Google / email-verification flags reflect runtime
// env (a static prerender would bake in the build-time values).
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const emailVerificationEnabled = Boolean(process.env.RESEND_API_KEY);

  return (
    <SignUpForm
      googleEnabled={googleEnabled}
      emailVerificationEnabled={emailVerificationEnabled}
    />
  );
}
