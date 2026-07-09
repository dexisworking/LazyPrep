import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import { getAiKeyStatus } from "@/lib/ai/keys";
import { AiKeyForm } from "@/components/settings/ai-key-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");

  const status = await getAiKeyStatus(profile.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your AI provider so you can generate your own courses.
        </p>
      </div>

      <AiKeyForm status={status} />
    </div>
  );
}
