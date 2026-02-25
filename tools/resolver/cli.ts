#!/usr/bin/env node

import { config as loadDotenv } from "dotenv";
import { fileURLToPath } from "node:url";
import { resolveNextQuestionFromRawWithAI } from "./resolve";

const TOOL_ENV_PATH = fileURLToPath(new URL("../.env", import.meta.url));

async function main(): Promise<void> {
  const dotenvResult = loadDotenv({
    override: false,
    path: TOOL_ENV_PATH,
  });
  if (
    dotenvResult.error &&
    (dotenvResult.error as NodeJS.ErrnoException).code !== "ENOENT"
  ) {
    throw dotenvResult.error;
  }

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
