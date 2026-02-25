CREATE TABLE "QuestionRaw" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctOptionIndexes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionRaw_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionCandidate" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctOptionIndexes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionCandidate_pkey" PRIMARY KEY ("id")
);
