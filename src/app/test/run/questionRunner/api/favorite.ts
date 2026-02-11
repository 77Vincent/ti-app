import type { DifficultyEnum, GoalEnum } from "@/lib/meta";
import { parseHttpErrorMessage } from "@/lib/http/error";
import type { Question } from "../types";
import { QuestionRunnerApiError } from "./error";

export type FavoriteQuestionInput = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
  question: Question;
};

const FAVORITE_QUESTION_API_PATH = "/api/questions/favorite";

export async function addFavoriteQuestion(input: FavoriteQuestionInput): Promise<void> {
  const response = await fetch(FAVORITE_QUESTION_API_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
      difficulty: input.difficulty,
      goal: input.goal,
      questionId: input.question.id,
      questionType: input.question.questionType,
      prompt: input.question.prompt,
      options: input.question.options,
      correctOptionIds: input.question.correctOptionIds,
    }),
  });

  if (!response.ok) {
    throw new QuestionRunnerApiError(
      await parseHttpErrorMessage(response, "Failed to favorite question."),
      response.status,
    );
  }
}

export async function removeFavoriteQuestion(questionId: string): Promise<void> {
  const response = await fetch(FAVORITE_QUESTION_API_PATH, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId }),
  });

  if (!response.ok) {
    throw new QuestionRunnerApiError(
      await parseHttpErrorMessage(response, "Failed to unfavorite question."),
      response.status,
    );
  }
}
