-- CreateTable
CREATE TABLE "QuestionSample" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionSample_subjectId_subcategoryId_difficulty_id_idx" ON "QuestionSample"("subjectId", "subcategoryId", "difficulty", "id");
