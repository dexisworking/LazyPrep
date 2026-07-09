"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { encryptSecret } from "@/lib/crypto";
import { validateConfig, AiError } from "@/lib/ai/client";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export type SaveAiKeyInput = {
  apiKey: string;
  baseUrl?: string;
  model: string;
  provider?: string;
};

/**
 * Validate a key/base-url/model combo with a tiny live call, then store the
 * key AES-256-GCM-encrypted. The plaintext is never persisted or returned.
 */
export async function saveAiKey(input: SaveAiKeyInput) {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };

  const apiKey = input.apiKey.trim();
  const baseUrl = input.baseUrl?.trim() || DEFAULT_BASE_URL;
  const model = input.model.trim();
  const provider = input.provider?.trim() || "openrouter";

  if (!apiKey) return { ok: false as const, error: "API key is required." };
  if (!model) return { ok: false as const, error: "Model id is required." };

  try {
    await validateConfig({ apiKey, baseUrl, model });
  } catch (e) {
    const msg = e instanceof AiError ? e.message : "Could not validate the key.";
    return { ok: false as const, error: msg };
  }

  const enc = encryptSecret(apiKey);
  const last4 = apiKey.slice(-4);

  await prisma.aiKey.upsert({
    where: { profileId: profile.id },
    update: { provider, baseUrl, model, ...enc, last4 },
    create: { profileId: profile.id, provider, baseUrl, model, ...enc, last4 },
  });

  revalidatePath("/settings");
  revalidatePath("/courses/new");
  return { ok: true as const, last4 };
}

export async function deleteAiKey() {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false as const, error: "Not authenticated." };
  await prisma.aiKey.deleteMany({ where: { profileId: profile.id } });
  revalidatePath("/settings");
  revalidatePath("/courses/new");
  return { ok: true as const };
}
