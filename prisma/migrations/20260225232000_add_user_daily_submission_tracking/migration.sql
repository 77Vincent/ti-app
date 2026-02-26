-- AlterTable
ALTER TABLE "User"
ADD COLUMN "dailySubmittedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dailySubmittedCountDate" TIMESTAMP(3);
