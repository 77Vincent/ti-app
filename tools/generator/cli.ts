#!/usr/bin/env node

import { Command, InvalidArgumentError } from "commander";
import { createQuestionsWithAI } from "./generate";
import type { GenerateQuestionRequest } from "../types";
import { DIFFICULTY_LADDER_BY_SUBCATEGORY } from "../../shared/difficultyLadder";
import { disconnectRepoPrisma, persistQuestionsToRaw } from "../repo";
import { loadToolsEnv } from "../utils/env";

function parseSubcategory(
  value: string,
): GenerateQuestionRequest["subcategory"] {
  const normalizedValue = value.trim().toLowerCase();
  if (!(normalizedValue in DIFFICULTY_LADDER_BY_SUBCATEGORY)) {
    throw new InvalidArgumentError(
      `subcategory must be one of: ${Object.keys(DIFFICULTY_LADDER_BY_SUBCATEGORY).join(", ")}.`,
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
  loadToolsEnv(import.meta.url);

  const program = new Command();

  program
    .name("question-generate")
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

  const subcategory =
    options.subcategory as keyof typeof DIFFICULTY_LADDER_BY_SUBCATEGORY;
  const allowedDifficulties =
    DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategory].ladder as readonly string[];
  if (!allowedDifficulties.includes(options.difficulty)) {
    throw new Error(
      `difficulty "${options.difficulty}" is not allowed for subcategory "${options.subcategory}". Allowed values: ${allowedDifficulties.join(", ")}.`,
    );
  }

  const questions = await createQuestionsWithAI({
    subcategory: options.subcategory,
    difficulty: options.difficulty,
  });
  await persistQuestionsToRaw({
    subcategory: options.subcategory,
    questions,
  });

  process.stdout.write(
    `Successfully persisted ${questions.length} ${options.difficulty} ${options.subcategory} question(s) to QuestionRaw.\n`,
  );
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
