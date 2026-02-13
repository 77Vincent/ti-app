ALTER TABLE "QuestionPool"
ADD COLUMN "randomKey" DOUBLE PRECISION NOT NULL DEFAULT random();

DROP INDEX IF EXISTS "QuestionPool_subjectId_subcategoryId_difficulty_idx";

CREATE INDEX "QuestionPool_subjectId_subcategoryId_difficulty_randomKey_idx"
ON "QuestionPool"("subjectId", "subcategoryId", "difficulty", "randomKey");
