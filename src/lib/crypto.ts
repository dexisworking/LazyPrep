import "server-only";
import crypto from "node:crypto";

/**
 * AES-256-GCM encryption for secrets at rest (user AI API keys).
 * The plaintext key only exists in memory server-side; only the ciphertext,
 * IV, and auth tag are persisted. Requires ENCRYPTION_KEY (32-byte base64).
 */

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const b64 = process.env.ENCRYPTION_KEY;
  if (!b64) throw new Error("ENCRYPTION_KEY is not set");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return key;
}

export type EncryptedSecret = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

export function encryptSecret(plaintext: string): EncryptedSecret {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptSecret(data: EncryptedSecret): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(data.iv, "base64"));
  decipher.setAuthTag(Buffer.from(data.authTag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(data.ciphertext, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
