#!/usr/bin/env node

import { resolveNextQuestionFromRawWithAI } from "./resolve";
import { loadToolsEnv } from "../utils/env";

async function main(): Promise<void> {
  loadToolsEnv(import.meta.url);

  let processedCount = 0;

  while (true) {
    const result = await resolveNextQuestionFromRawWithAI();
    if (result.status === "empty") {
      process.stdout.write(
        `No QuestionRaw rows left to resolve. Processed ${processedCount} question(s).\n`,
      );
      return;
    }

    processedCount += 1;

    if (result.status === "passed") {
      process.stdout.write(
        `Resolved ${result.questionId}: PASSED (difficulty: ${result.resolvedDifficulty}, answer index: ${result.resolvedCorrectOptionIndex}). Moved to QuestionCandidate.\n`,
      );
      continue;
    }

    process.stdout.write(
      `Resolved ${result.questionId}: REJECTED (expected difficulty: ${result.expectedDifficulty}, resolved difficulty: ${result.resolvedDifficulty}, resolved answer index: ${result.resolvedCorrectOptionIndex}).\n`,
    );
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
