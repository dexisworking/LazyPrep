-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareCode" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "lastLoginXpDate" TIMESTAMP(3),
ADD COLUMN     "streakFreezes" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "LessonRating" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonRating_lessonId_idx" ON "LessonRating"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonRating_profileId_lessonId_key" ON "LessonRating"("profileId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_shareCode_key" ON "Course"("shareCode");

-- AddForeignKey
ALTER TABLE "LessonRating" ADD CONSTRAINT "LessonRating_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonRating" ADD CONSTRAINT "LessonRating_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
