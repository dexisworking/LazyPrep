"use client";

import { useState, useTransition } from "react";
import {
  KeyRound,
  Loader2,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { saveAiKey, deleteAiKey } from "@/lib/actions/ai-keys";
import type { AiKeyStatus } from "@/lib/ai/keys";

const MODEL_SUGGESTIONS = [
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-sonnet",
  "google/gemini-flash-1.5",
  "minimax/minimax-01",
  "meta-llama/llama-3.3-70b-instruct",
];

export function AiKeyForm({ status }: { status: AiKeyStatus }) {
  const [editing, setEditing] = useState(!status.configured);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [baseUrl, setBaseUrl] = useState(
    status.configured ? status.baseUrl : "https://openrouter.ai/api/v1",
  );
  const [model, setModel] = useState(
    status.configured ? status.model : "openai/gpt-4o-mini",
  );
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setError("");
    setSavedMsg("");
    startTransition(async () => {
      const res = await saveAiKey({ apiKey, baseUrl, model });
      if (res.ok) {
        setSavedMsg("Key validated and saved securely.");
        setApiKey("");
        setEditing(false);
      } else {
        setError(res.error);
      }
    });
  };

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      await deleteAiKey();
      setSavedMsg("");
      setEditing(true);
      setApiKey("");
    });
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">AI API Key</h2>
          <p className="text-sm text-muted-foreground">
            Bring your own key to generate courses, lessons and more. Works with any
            OpenAI-compatible endpoint (OpenRouter, and its many models).
          </p>
        </div>
      </div>

      {/* Connected state */}
      {status.configured && !editing && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-np-success/30 bg-np-success/5 p-4">
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm font-medium text-np-success">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </p>
              <p className="text-xs text-muted-foreground">
                Model: <span className="text-foreground">{status.model}</span> · Key: ••••{status.last4}
              </p>
              <p className="truncate text-xs text-muted-foreground">{status.baseUrl}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-…"
                autoComplete="off"
                className="h-10 w-full rounded-lg border border-input bg-background pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://openrouter.ai/api/v1"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="openai/gpt-4o-mini"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {MODEL_SUGGESTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className="rounded-full border border-border/60 bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isPending || !apiKey}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Validate & Save
            </button>
            {status.configured && (
              <button
                onClick={() => {
                  setEditing(false);
                  setError("");
                }}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {savedMsg && !editing && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-np-success">
          <CheckCircle2 className="h-4 w-4" />
          {savedMsg}
        </p>
      )}

      <div className="mt-5 flex items-start gap-2 border-t border-border/40 pt-4 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-np-success" />
        <span>
          Your key is encrypted (AES-256-GCM) before it&apos;s stored, decrypted only on our
          server when making a request, and never shown again after you save it. All AI calls
          run server-side — your key is never exposed to the browser.
        </span>
      </div>
    </div>
  );
}
