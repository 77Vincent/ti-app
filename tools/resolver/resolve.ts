import type { QuestionOption } from "../types";
import { DIFFICULTY_LADDER_BY_SUBCATEGORY } from "../../shared/difficultyLadder";
import { resolveQuestionWithAI } from "./index";
import {
  deleteQuestionRawById,
  persistQuestionToCandidate,
  takeNextQuestionRaw,
} from "../repo";

export type ResolveNextRawQuestionResult =
  | { status: "empty" }
  | {
      status: "passed" | "rejected";
      questionId: string;
      expectedDifficulty: string;
      resolvedDifficulty: string;
      resolvedCorrectOptionIndex: number;
      isDifficultyMatch: boolean;
      isCorrectOptionIndexMatch: boolean;
    };

function getDifficultyProfile(subcategory: string) {
  const profile =
    DIFFICULTY_LADDER_BY_SUBCATEGORY[
      subcategory as keyof typeof DIFFICULTY_LADDER_BY_SUBCATEGORY
    ];
  if (!profile) {
    throw new Error(`Unknown subcategory: ${subcategory}`);
  }

  return profile;
}

export async function resolveNextQuestionFromRawWithAI(): Promise<ResolveNextRawQuestionResult> {
  const rawQuestion = await takeNextQuestionRaw();
  if (!rawQuestion) {
    return { status: "empty" };
  }

  const profile = getDifficultyProfile(rawQuestion.subcategoryId);
  const resolution = await resolveQuestionWithAI(
    {
      prompt: rawQuestion.prompt,
      options: rawQuestion.options as unknown as QuestionOption[],
    },
    profile.framework,
    profile.ladder,
    profile.description,
  );

  const expectedDifficulty = rawQuestion.difficulty;
  const resolvedDifficulty = resolution.difficulty;
  const resolvedCorrectOptionIndex = resolution.correctOptionIndex;

  const isDifficultyMatch = resolvedDifficulty === expectedDifficulty;
  const isCorrectOptionIndexMatch = resolvedCorrectOptionIndex === 0;
  const isPassed = isDifficultyMatch && isCorrectOptionIndexMatch;

  if (isPassed) {
    await persistQuestionToCandidate(rawQuestion);
  }

  await deleteQuestionRawById(rawQuestion.id);

  return {
    status: isPassed ? "passed" : "rejected",
    questionId: rawQuestion.id,
    expectedDifficulty,
    resolvedDifficulty,
    resolvedCorrectOptionIndex,
    isDifficultyMatch,
    isCorrectOptionIndexMatch,
  };
}
