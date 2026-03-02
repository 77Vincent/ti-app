import { createHash } from "node:crypto";
import { QuestionSample, type Prisma } from "@prisma/client";
import { SUBCATEGORIES } from "../../src/lib/meta/subcategories";
import type {
  GenerateQuestionRequest,
  GenerateQuestionSample,
  QuestionDifficulty,
  QuestionOption,
  QuestionSubcategory,
} from "../types";
import {
  QUESTION_ID_HASH_ALGORITHM,
  QUESTION_ID_HASH_ENCODING,
} from "../utils/config";
import { prisma } from "./prisma";

const GENERATOR_SAMPLE_COUNT = 5;

type QuestionSampleRow = Pick<QuestionSample, "prompt" | "options">;
type PersistQuestionSample = {
  difficulty: QuestionDifficulty;
  prompt: string;
  options: QuestionOption[];
};
type PersistQuestionSamplesInput = {
  subcategory: QuestionSubcategory;
  samples: PersistQuestionSample[];
};

function getSubjectId(subcategory: QuestionSubcategory): string {
  const matchedSubcategory = SUBCATEGORIES.find((item) => item.id === subcategory);
  if (!matchedSubcategory) {
    throw new Error(`Unknown subcategory: ${subcategory}`);
  }

  return matchedSubcategory.subjectId;
}

function createQuestionSampleId(
  subcategory: QuestionSubcategory,
  sample: PersistQuestionSample,
): string {
  return createHash(QUESTION_ID_HASH_ALGORITHM)
    .update(`${subcategory}:${sample.difficulty}:${sample.prompt}`)
    .digest(QUESTION_ID_HASH_ENCODING);
}

export async function persistQuestionSamples(
  input: PersistQuestionSamplesInput,
): Promise<number> {
  if (input.samples.length === 0) {
    return 0;
  }

  const subjectId = getSubjectId(input.subcategory);
  const result = await prisma.questionSample.createMany({
    data: input.samples.map((sample) => ({
      id: createQuestionSampleId(input.subcategory, sample),
      subjectId,
      subcategoryId: input.subcategory,
      prompt: sample.prompt,
      difficulty: sample.difficulty,
      options: sample.options as unknown as Prisma.InputJsonValue,
    })),
    skipDuplicates: true,
  });

  return result.count;
}

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
