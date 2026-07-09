import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SignInForm } from "./sign-in-form";

// Render per-request so the Google flag reflects runtime env (a static
// prerender would bake in whatever the flag was at build time).
export const dynamic = "force-dynamic";

export default function SignInPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignInForm googleEnabled={googleEnabled} />
    </Suspense>
  );
}
