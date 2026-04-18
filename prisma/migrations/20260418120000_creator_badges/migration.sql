-- CreateTable
CREATE TABLE "creator_badges" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amountCents" INTEGER NOT NULL,
    "emoji" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "creator_badges_creatorProfileId_idx" ON "creator_badges"("creatorProfileId");

-- AddForeignKey
ALTER TABLE "creator_badges" ADD CONSTRAINT "creator_badges_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "tips" ADD COLUMN "creatorBadgeId" TEXT;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_creatorBadgeId_fkey" FOREIGN KEY ("creatorBadgeId") REFERENCES "creator_badges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
