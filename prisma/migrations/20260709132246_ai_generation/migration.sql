-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "aiContext" JSONB,
ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" TEXT;

-- CreateTable
CREATE TABLE "AiKey" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openrouter',
    "baseUrl" TEXT NOT NULL DEFAULT 'https://openrouter.ai/api/v1',
    "model" TEXT NOT NULL DEFAULT 'openai/gpt-4o-mini',
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiKey_profileId_key" ON "AiKey"("profileId");

-- CreateIndex
CREATE INDEX "Course_ownerId_idx" ON "Course"("ownerId");

-- AddForeignKey
ALTER TABLE "AiKey" ADD CONSTRAINT "AiKey_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
