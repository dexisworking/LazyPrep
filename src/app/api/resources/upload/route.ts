import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PENDING_COUNT = 5;

const ALLOWED_TYPES: Record<string, "pdf" | "image"> = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/webp": "image",
};

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Enforce max count
  const pendingCount = await prisma.courseResource.count({
    where: {
      profileId: profile.id,
      courseId: null,
      status: { in: ["pending", "processed"] },
    },
  });

  if (pendingCount >= MAX_PENDING_COUNT) {
    return NextResponse.json(
      { error: `You can upload up to ${MAX_PENDING_COUNT} reference files per course.` },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 10MB size limit." },
      { status: 400 },
    );
  }

  const fileType = ALLOWED_TYPES[file.type.toLowerCase()];
  if (!fileType) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a PDF or image (PNG, JPG, WEBP)." },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() || (fileType === "pdf" ? "pdf" : "png");
  const randomId = Math.random().toString(36).slice(2, 10);
  const r2Key = `temp-resources/${profile.id}/${Date.now()}-${randomId}.${ext}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await uploadToR2(r2Key, buffer, file.type);

    const resource = await prisma.courseResource.create({
      data: {
        profileId: profile.id,
        fileName: file.name.slice(0, 150),
        fileType,
        fileSize: file.size,
        r2Key,
        status: "pending",
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, resource });
  } catch (err) {
    console.error("[upload-api] R2 upload failed:", err);
    return NextResponse.json({ error: "Failed to upload file to storage." }, { status: 500 });
  }
}
