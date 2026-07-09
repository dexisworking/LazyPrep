import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { googleEnabled } from "@/lib/auth";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
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
