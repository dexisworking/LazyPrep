import "server-only";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

// ─── R2 Client ───
// Cloudflare R2 exposes an S3-compatible API. We use the standard AWS SDK with
// the R2 endpoint. All env vars are validated at module load — if any are
// missing the server fails fast instead of silently passing null keys.

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

let r2Instance: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Instance) {
    const accountId = requiredEnv("R2_ACCOUNT_ID");
    const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
    const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");

    r2Instance = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return r2Instance;
}

function getBucketName(): string {
  return requiredEnv("R2_BUCKET_NAME");
}

// ─── Operations ───

/** Upload a file to R2. */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/** Download a file from R2 as a Buffer. */
export async function getFromR2(key: string): Promise<Buffer> {
  const res = await getR2Client().send(
    new GetObjectCommand({ Bucket: getBucketName(), Key: key }),
  );
  if (!res.Body) throw new Error(`R2 object empty: ${key}`);
  // Body is a ReadableStream in Node — collect into Buffer.
  const chunks: Uint8Array[] = [];
  for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** Delete a file from R2. No-ops if the key doesn't exist. */
export async function deleteFromR2(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }),
  );
}

/** Check whether a key exists in R2. */
export async function existsInR2(key: string): Promise<boolean> {
  try {
    await getR2Client().send(new HeadObjectCommand({ Bucket: getBucketName(), Key: key }));
    return true;
  } catch {
    return false;
  }
}
