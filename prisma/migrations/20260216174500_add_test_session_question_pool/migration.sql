-- CreateTable
CREATE TABLE "TestSessionQuestionPool" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestSessionQuestionPool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestSessionQuestionPool_sessionId_questionId_key" ON "TestSessionQuestionPool"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "TestSessionQuestionPool_sessionId_createdAt_idx" ON "TestSessionQuestionPool"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "TestSessionQuestionPool_questionId_idx" ON "TestSessionQuestionPool"("questionId");

-- AddForeignKey
ALTER TABLE "TestSessionQuestionPool" ADD CONSTRAINT "TestSessionQuestionPool_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionPool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
