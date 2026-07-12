-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'bug',
    "message" TEXT NOT NULL,
    "url" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_profileId_idx" ON "Feedback"("profileId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
