import type { DifficultyEnum, GoalEnum } from "@/lib/meta";
import type { Question } from "./types";

export type GenerateQuestionInput = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
};

type GenerateQuestionResponse = {
  question?: Question;
  error?: string;
};

export class GenerateQuestionRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GenerateQuestionRequestError";
    this.status = status;
  }
}

export function isAnonymousQuestionLimitError(error: unknown): boolean {
  return (
    error instanceof GenerateQuestionRequestError &&
    error.status === 403
  );
}

export async function fetchGeneratedQuestion(
  input: GenerateQuestionInput,
): Promise<Question> {
  const response = await fetch("/api/questions/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as GenerateQuestionResponse;

  if (!response.ok || !payload.question) {
    throw new GenerateQuestionRequestError(
      payload.error ?? "Failed to load question.",
      response.status,
    );
  }

  return payload.question;
}
