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
      isDifficultyAccepted: boolean;
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

function isDifficultyAccepted(
  expectedDifficulty: string,
  resolvedDifficulty: string,
  difficultyLadder: readonly string[],
): boolean {
  const expectedIndex = difficultyLadder.indexOf(expectedDifficulty);
  const resolvedIndex = difficultyLadder.indexOf(resolvedDifficulty);
  if (expectedIndex < 0 || resolvedIndex < 0) {
    return false;
  }

  return resolvedIndex >= expectedIndex;
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

  const difficultyAccepted = isDifficultyAccepted(
    expectedDifficulty,
    resolvedDifficulty,
    profile.ladder,
  );
  const isCorrectOptionIndexMatch = resolvedCorrectOptionIndex === 0;
  const isPassed = difficultyAccepted && isCorrectOptionIndexMatch;

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
    isDifficultyAccepted: difficultyAccepted,
    isCorrectOptionIndexMatch,
  };
}
