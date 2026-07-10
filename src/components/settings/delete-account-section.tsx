"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "@/lib/actions/profile";
import { signOut } from "@/lib/auth-client";

export function DeleteAccountSection({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  const handleDelete = async () => {
    if (!matches || loading) return;
    setLoading(true);
    setError("");
    const result = await deleteAccount(typed);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    // Clear the auth cookie, then hard-redirect to the public landing page.
    try {
      await signOut();
    } catch {
      // The user row is already gone; ignore and redirect regardless.
    }
    window.location.href = "/";
  };

  return (
    <section className="space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Danger Zone</h2>
          <p className="text-xs text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-destructive/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          This removes your profile, progress, practice history, flashcard schedules, and any
          courses you generated. This cannot be undone.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <button className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 active:scale-[0.98]" />
            }
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This is permanent and cannot be undone. To confirm, type your email{" "}
                <span className="font-medium text-foreground">{email}</span> below.
              </DialogDescription>
            </DialogHeader>

            <Input
              type="email"
              autoComplete="off"
              placeholder="Type your email to confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="h-10"
              aria-invalid={typed.length > 0 && !matches}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <DialogClose
                render={
                  <button className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary" />
                }
              >
                Cancel
              </DialogClose>
              <button
                onClick={handleDelete}
                disabled={!matches || loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete forever
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
