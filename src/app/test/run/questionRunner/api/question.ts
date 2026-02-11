import type { DifficultyEnum, GoalEnum } from "@/lib/meta";
import { parseHttpErrorMessage } from "@/lib/http/error";
import type { Question } from "../types";
import { QuestionRunnerApiError } from "./error";

export type GenerateQuestionInput = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
};

const GENERATE_QUESTION_API_PATH = "/api/questions/generate";

type GenerateQuestionResponse = {
  question?: Question;
  error?: string;
};

export function isAnonymousQuestionLimitError(error: unknown): boolean {
  return error instanceof QuestionRunnerApiError && error.status === 403;
}

export async function fetchGeneratedQuestion(
  input: GenerateQuestionInput,
): Promise<Question> {
  const response = await fetch(GENERATE_QUESTION_API_PATH, {
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

  const payload = (await response.json()) as GenerateQuestionResponse;

  if (!payload.question) {
    throw new QuestionRunnerApiError(
      payload.error ?? "Failed to load question.",
      response.status,
    );
  }

  return payload.question;
}
