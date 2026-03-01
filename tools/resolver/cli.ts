#!/usr/bin/env node

import { Command, InvalidArgumentError } from "commander";
import { disconnectRepoPrisma } from "../repo";
import {
  resolveNextQuestionFromPoolWithAI,
  resolveNextQuestionFromRawWithAI,
} from "./resolve";
import { loadToolsEnv } from "../utils/env";

type ResolveSource = "raw" | "pool";

function parseSource(value: string): ResolveSource {
  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue !== "raw" && normalizedValue !== "pool") {
    throw new InvalidArgumentError("source must be one of: raw, pool.");
  }

  return normalizedValue;
}

async function main(): Promise<void> {
  loadToolsEnv(import.meta.url);

  const program = new Command();
  program
    .name("question-resolve")
    .description("Resolve and validate generated questions")
    .option(
      "-s, --source <source>",
      "Source table to resolve: raw or pool",
      parseSource,
      "raw",
    )
    .showHelpAfterError();

  await program.parseAsync(process.argv);

  const options = program.opts<{ source: ResolveSource }>();

  let processedCount = 0;

  while (true) {
    const result = options.source === "raw"
      ? await resolveNextQuestionFromRawWithAI()
      : await resolveNextQuestionFromPoolWithAI();
    if (result.status === "empty") {
      process.stdout.write(
        `No Question${options.source === "raw" ? "Raw" : "Pool"} rows left to resolve. Processed ${processedCount} question(s).\n`,
      );
      return;
    }

    processedCount += 1;

    if (result.status === "passed") {
      process.stdout.write(
        options.source === "raw"
          ? `Resolved ${result.questionId}: PASSED (answer indexes: [${result.resolvedCorrectOptionIndexes.join(", ")}]). Moved to QuestionPool.\n`
          : `Resolved ${result.questionId}: PASSED (answer indexes: [${result.resolvedCorrectOptionIndexes.join(", ")}]). Kept in QuestionPool.\n`,
      );
      continue;
    }

    process.stdout.write(
      options.source === "raw"
        ? `Resolved ${result.questionId}: REJECTED (resolved answer indexes: [${result.resolvedCorrectOptionIndexes.join(", ")}], multiple correct options: ${result.hasMultipleCorrectOptions}, technical issue: ${result.hasTechnicalIssue}, second-pass approved: ${result.isSecondPassApproved}).\n`
        : `Resolved ${result.questionId}: REJECTED (resolved answer indexes: [${result.resolvedCorrectOptionIndexes.join(", ")}], multiple correct options: ${result.hasMultipleCorrectOptions}, technical issue: ${result.hasTechnicalIssue}, second-pass approved: ${result.isSecondPassApproved}). Deleted from QuestionPool.\n`,
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
