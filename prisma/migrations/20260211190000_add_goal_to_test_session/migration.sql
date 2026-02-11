-- AlterTable
ALTER TABLE "TestSession"
ADD COLUMN "goal" TEXT NOT NULL DEFAULT 'study';

-- Keep a deterministic default during migration only.
-- You can remove the default in a future migration if desired.
