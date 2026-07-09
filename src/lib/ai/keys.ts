import "server-only";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import type { AiConfig } from "@/lib/ai/client";

/** Decrypts and returns the usable AI config for a profile (server-only). */
export async function getAiConfig(profileId: string): Promise<AiConfig | null> {
  const row = await prisma.aiKey.findUnique({ where: { profileId } });
  if (!row) return null;
  const apiKey = decryptSecret({
    ciphertext: row.ciphertext,
    iv: row.iv,
    authTag: row.authTag,
  });
  return { apiKey, baseUrl: row.baseUrl, model: row.model };
}

export type AiKeyStatus =
  | { configured: false }
  | { configured: true; provider: string; baseUrl: string; model: string; last4: string };

/** Non-sensitive status for the UI — never includes the key itself. */
export async function getAiKeyStatus(profileId: string): Promise<AiKeyStatus> {
  const row = await prisma.aiKey.findUnique({ where: { profileId } });
  if (!row) return { configured: false };
  return {
    configured: true,
    provider: row.provider,
    baseUrl: row.baseUrl,
    model: row.model,
    last4: row.last4,
  };
}
