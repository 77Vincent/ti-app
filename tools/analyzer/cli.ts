#!/usr/bin/env node

import { analyzeNextQuestionCandidateWithAI } from "./analyze";
import { loadToolsEnv } from "../utils/env";

async function main(): Promise<void> {
  loadToolsEnv(import.meta.url);

  let processedCount = 0;
  let passedCount = 0;
  let rejectedCount = 0;

  while (true) {
    const result = await analyzeNextQuestionCandidateWithAI();
    if (result.status === "empty") {
      process.stdout.write(
        `No QuestionCandidate rows left to analyze. Processed ${processedCount} question(s), passed ${passedCount}, rejected ${rejectedCount}.\n`,
      );
      return;
    }

    processedCount += 1;
    if (result.status === "passed") {
      passedCount += 1;
      process.stdout.write(
        `Analyzed ${result.questionId}: PASSED (difficulty: ${result.difficulty}). Moved to QuestionPool.\n`,
      );
      continue;
    }

    rejectedCount += 1;
    process.stdout.write(
      `Analyzed ${result.questionId}: REJECTED (difficulty: ${result.difficulty}).\n`,
    );
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
