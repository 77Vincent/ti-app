#!/usr/bin/env node

import { Command, InvalidArgumentError } from "commander";
import { generateQuestionWithAI } from "./index";
import type { GenerateQuestionRequest } from "./types";

function parseDifficulty(value: string): GenerateQuestionRequest["difficulty"] {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    throw new InvalidArgumentError("difficulty must be a non-empty string.");
  }

  return normalizedValue;
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("question-ai")
    .description("Generate resolver-validated English questions via local tool")
    .requiredOption(
      "-d, --difficulty <difficulty>",
      "Target difficulty, e.g. <A1, A1, A2, B1, B2, C1, C2",
      parseDifficulty,
    )
    .showHelpAfterError();

  await program.parseAsync(process.argv);

  const options = program.opts<{
    difficulty: GenerateQuestionRequest["difficulty"];
  }>();

  const questions = await generateQuestionWithAI({
    difficulty: options.difficulty,
  });

  const serializedOutput = JSON.stringify(questions, null, 2);

  process.stdout.write(`${serializedOutput}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
