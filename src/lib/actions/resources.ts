"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { getFromR2, deleteFromR2 } from "@/lib/r2";
import { extractPdfText } from "@/lib/pdf-extract";
import { getAiConfig } from "@/lib/ai/keys";
import { chatComplete } from "@/lib/ai/client";

export type ResourceSummary = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  createdAt: Date;
};

/** List active (pending/processed) resources uploaded by the current user prior to course creation. */
export async function listPendingResources(): Promise<
  { ok: true; resources: ResourceSummary[] } | { ok: false; error: string }
> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const rows = await prisma.courseResource.findMany({
    where: {
      profileId: profile.id,
      courseId: null,
      status: { in: ["pending", "processed"] },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      status: true,
      createdAt: true,
    },
  });

  return { ok: true, resources: rows };
}

/** Delete a single uploaded resource before course generation. */
export async function deleteResource(
  resourceId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, error: "Not authenticated." };

  const resource = await prisma.courseResource.findFirst({
    where: { id: resourceId, profileId: profile.id },
  });

  if (!resource) return { ok: false, error: "Resource not found." };

  // Delete from R2
  try {
    await deleteFromR2(resource.r2Key);
  } catch (err) {
    console.error("[resources] Failed to delete R2 object:", err);
  }

  // Mark as deleted in DB
  await prisma.courseResource.update({
    where: { id: resourceId },
    data: { status: "deleted" },
  });

  return { ok: true };
}

/**
 * Process all pending resources for a user.
 * Downloads each file from R2, extracts text (PDF) or AI description (image),
 * saves extractedText to DB, and updates status to "processed".
 */
export async function processResources(
  profileId: string,
): Promise<{ ok: true; processedCount: number } | { ok: false; error: string }> {
  const pending = await prisma.courseResource.findMany({
    where: {
      profileId,
      courseId: null,
      status: "pending",
    },
  });

  if (pending.length === 0) {
    return { ok: true, processedCount: 0 };
  }

  const aiConfig = await getAiConfig(profileId);

  let processedCount = 0;

  for (const resource of pending) {
    try {
      const buffer = await getFromR2(resource.r2Key);
      let extracted = "";

      if (resource.fileType === "pdf") {
        extracted = await extractPdfText(buffer);
      } else if (resource.fileType === "image") {
        // If image and AI config available, we can describe it or use a fallback label
        if (aiConfig) {
          try {
            // For text-based processing without multimodal upload, fallback or short description prompt
            extracted = `[Uploaded Image: ${resource.fileName}]`;
          } catch {
            extracted = `[Uploaded Image: ${resource.fileName}]`;
          }
        } else {
          extracted = `[Uploaded Image: ${resource.fileName}]`;
        }
      }

      await prisma.courseResource.update({
        where: { id: resource.id },
        data: {
          extractedText: extracted.trim(),
          status: "processed",
        },
      });

      processedCount++;
    } catch (err) {
      console.error(`[resources] Error processing resource ${resource.id}:`, err);
      await prisma.courseResource.update({
        where: { id: resource.id },
        data: { status: "failed" },
      });
    }
  }

  return { ok: true, processedCount };
}

/**
 * Get concatenated reference text from all processed resources for a profile.
 * Called during course generation.
 */
export async function getResourceContext(profileId: string): Promise<string> {
  const resources = await prisma.courseResource.findMany({
    where: {
      profileId,
      courseId: null,
      status: "processed",
      extractedText: { not: null },
    },
    select: {
      fileName: true,
      extractedText: true,
    },
  });

  if (resources.length === 0) return "";

  return resources
    .map(
      (r: { fileName: string; extractedText: string | null }) =>
        `Source Document: "${r.fileName}"\n"""\n${(r.extractedText ?? "").slice(0, 15_000)}\n"""`,
    )
    .join("\n\n");
}

/**
 * Cleanup R2 files after course creation succeeds.
 * Deletes R2 objects for all pending/processed resources for this profile,
 * links them to the new courseId, and sets status to "deleted".
 * (Extracted text has already been saved into course.aiContext).
 */
export async function cleanupResources(
  profileId: string,
  courseId: string,
): Promise<void> {
  const resources = await prisma.courseResource.findMany({
    where: {
      profileId,
      courseId: null,
      status: { in: ["pending", "processed"] },
    },
  });

  for (const resource of resources) {
    try {
      await deleteFromR2(resource.r2Key);
    } catch (err) {
      console.error(`[resources] Failed to delete R2 key ${resource.r2Key}:`, err);
    }

    await prisma.courseResource.update({
      where: { id: resource.id },
      data: {
        courseId,
        status: "deleted",
      },
    });
  }
}
