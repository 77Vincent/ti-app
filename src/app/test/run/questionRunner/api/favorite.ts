import type { DifficultyEnum, GoalEnum, SubjectEnum } from "@/lib/meta";
import { API_PATHS } from "@/lib/config/paths";
import { parseHttpErrorMessage } from "@/lib/http/error";
import type { Question } from "../types";
import { QuestionRunnerApiError } from "./error";

export type FavoriteQuestionInput = {
  subjectId: SubjectEnum;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
  question: Question;
};

export async function addFavoriteQuestion(input: FavoriteQuestionInput): Promise<void> {
  const response = await fetch(API_PATHS.QUESTIONS_FAVORITE, {
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
  const response = await fetch(API_PATHS.QUESTIONS_FAVORITE, {
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
