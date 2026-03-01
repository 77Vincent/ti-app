import { QuestionSample } from "@prisma/client";
import type { GenerateQuestionRequest, GenerateQuestionSample } from "../types";
import { prisma } from "./prisma";

const GENERATOR_SAMPLE_COUNT = 3;

type QuestionSampleRow = Pick<QuestionSample, "prompt" | "options">;

function toGenerateQuestionSample(row: QuestionSampleRow): GenerateQuestionSample {
  return {
    prompt: row.prompt,
    options: row.options as GenerateQuestionSample["options"],
  };
}

function pickRandomOffsets(total: number, count: number): number[] {
  const offsets = new Set<number>();
  while (offsets.size < count) {
    offsets.add(Math.floor(Math.random() * total));
  }

  return [...offsets];
}

export async function readRandomQuestionSamples(
  input: GenerateQuestionRequest,
): Promise<GenerateQuestionSample[]> {
  const where = {
    subcategoryId: input.subcategory,
    difficulty: input.difficulty,
  };

  const total = await prisma.questionSample.count({ where });
  if (total === 0) {
    return [];
  }

  const count = Math.min(GENERATOR_SAMPLE_COUNT, total);
  const offsets = pickRandomOffsets(total, count);
  const rows = await Promise.all(
    offsets.map((skip) => prisma.questionSample.findFirst({
      where,
      orderBy: { id: "asc" },
      skip,
      select: {
        prompt: true,
        options: true,
      },
    })),
  );

  return rows.filter((row) => row !== null).map(toGenerateQuestionSample);
}
