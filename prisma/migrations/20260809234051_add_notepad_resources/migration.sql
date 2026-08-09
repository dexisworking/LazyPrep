-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "streakFreezes" SET DEFAULT 2;

-- CreateTable
CREATE TABLE "Notepad" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notepad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotepadEntry" (
    "id" TEXT NOT NULL,
    "notepadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'manual',
    "moduleId" TEXT,
    "moduleTitle" TEXT,
    "lessonId" TEXT,
    "lessonTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotepadEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseResource" (
    "id" TEXT NOT NULL,
    "courseId" TEXT,
    "profileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "r2Key" TEXT NOT NULL,
    "extractedText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notepad_profileId_idx" ON "Notepad"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Notepad_profileId_courseId_key" ON "Notepad"("profileId", "courseId");

-- CreateIndex
CREATE INDEX "NotepadEntry_notepadId_moduleId_idx" ON "NotepadEntry"("notepadId", "moduleId");

-- CreateIndex
CREATE INDEX "NotepadEntry_notepadId_createdAt_idx" ON "NotepadEntry"("notepadId", "createdAt");

-- CreateIndex
CREATE INDEX "CourseResource_profileId_createdAt_idx" ON "CourseResource"("profileId", "createdAt");

-- CreateIndex
CREATE INDEX "CourseResource_courseId_idx" ON "CourseResource"("courseId");

-- CreateIndex
CREATE INDEX "CourseResource_status_createdAt_idx" ON "CourseResource"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Notepad" ADD CONSTRAINT "Notepad_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notepad" ADD CONSTRAINT "Notepad_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotepadEntry" ADD CONSTRAINT "NotepadEntry_notepadId_fkey" FOREIGN KEY ("notepadId") REFERENCES "Notepad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
