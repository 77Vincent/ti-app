#!/usr/bin/env node

import { Command } from "commander";
import { disconnectRepoPrisma } from "../repo";
import {
  resolveNextQuestionFromRawWithAI,
} from "./resolve";
import { loadToolsEnv } from "../utils/env";

async function main(): Promise<void> {
  loadToolsEnv(import.meta.url);

  const program = new Command();
  program
    .name("question-resolve")
    .description("Resolve and validate generated questions")
    .showHelpAfterError();

  await program.parseAsync(process.argv);

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
        `Resolved ${result.questionId}: PASSED (answer indexes: [${result.resolvedCorrectOptionIndexes.join(", ")}]). Moved to QuestionPool.\n`,
      );
      continue;
    }

    process.stdout.write(
      `Resolved ${result.questionId}: REJECTED (resolved answer indexes: [${result.resolvedCorrectOptionIndexes.join(", ")}], multiple correct options: ${result.hasMultipleCorrectOptions}, technical issue: ${result.hasTechnicalIssue}, second-pass approved: ${result.isSecondPassApproved}).\n`,
    );
  }
}

async function run(): Promise<void> {
  try {
    await main();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  } finally {
    await disconnectRepoPrisma();
  }
}

void run();
