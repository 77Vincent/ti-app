import type { DifficultyEnum, GoalEnum } from "@/lib/meta";
import { API_PATHS } from "@/lib/config/paths";
import { parseHttpErrorMessage } from "@/lib/http/error";
import type { Question } from "../types";
import { QuestionRunnerApiError } from "./error";

export type FetchQuestionInput = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
};

type FetchQuestionResponse = {
  question?: Question;
  error?: string;
};

export function isAnonymousQuestionLimitError(error: unknown): boolean {
  return error instanceof QuestionRunnerApiError && error.status === 403;
}

export async function fetchQuestion(
  input: FetchQuestionInput,
): Promise<Question> {
  const response = await fetch(API_PATHS.QUESTIONS_GENERATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new QuestionRunnerApiError(
      await parseHttpErrorMessage(response, "Failed to load question."),
      response.status,
    );
  }

  const payload = (await response.json()) as FetchQuestionResponse;

  if (!payload.question) {
    throw new QuestionRunnerApiError(
      payload.error ?? "Failed to load question.",
      response.status,
    );
  }

  return payload.question;
}
