#!/usr/bin/env node

import { Command, InvalidArgumentError } from "commander";
import { config as loadDotenv } from "dotenv";
import { fileURLToPath } from "node:url";
import { createQuestionCandidatesWithAI } from "./createCandidates";
import type { GenerateQuestionRequest } from "./types";
import { DIFFICULTY_LEVELS_BY_SUBCATEGORY } from "./config/constants";
import { persistQuestionsToPool } from "./pool";

const TOOL_ENV_PATH = fileURLToPath(new URL("./.env", import.meta.url));

function parseSubcategory(
  value: string,
): GenerateQuestionRequest["subcategory"] {
  const normalizedValue = value.trim().toLowerCase();
  if (!(normalizedValue in DIFFICULTY_LEVELS_BY_SUBCATEGORY)) {
    throw new InvalidArgumentError(
      `subcategory must be one of: ${Object.keys(DIFFICULTY_LEVELS_BY_SUBCATEGORY).join(", ")}.`,
    );
  }

  return normalizedValue as GenerateQuestionRequest["subcategory"];
}

function parseDifficulty(value: string): GenerateQuestionRequest["difficulty"] {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    throw new InvalidArgumentError("difficulty must be a non-empty string.");
  }

  return normalizedValue as GenerateQuestionRequest["difficulty"];
}

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

  const program = new Command();

  program
    .name("question-ai")
    .description("Generate subcategory questions via local tool")
    .requiredOption(
      "-s, --subcategory <subcategory>",
      "Target subcategory, e.g. english",
      parseSubcategory,
    )
    .requiredOption(
      "-d, --difficulty <difficulty>",
      "Target difficulty level for the given subcategory",
      parseDifficulty,
    )
    .showHelpAfterError();

  await program.parseAsync(process.argv);

  const options = program.opts<{
    subcategory: GenerateQuestionRequest["subcategory"];
    difficulty: GenerateQuestionRequest["difficulty"];
  }>();

  const allowedDifficulties = DIFFICULTY_LEVELS_BY_SUBCATEGORY[
    options.subcategory
  ] as readonly string[];
  if (!allowedDifficulties.includes(options.difficulty)) {
    throw new Error(
      `difficulty "${options.difficulty}" is not allowed for subcategory "${options.subcategory}". Allowed values: ${allowedDifficulties.join(", ")}.`,
    );
  }

  const questions = await createQuestionCandidatesWithAI({
    subcategory: options.subcategory,
    difficulty: options.difficulty,
  });
  await persistQuestionsToPool({
    subcategory: options.subcategory,
    questions,
  });

  process.stdout.write(
    `Successfully persisted ${questions.length} ${options.difficulty} ${options.subcategory} question(s) to QuestionPool.\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
