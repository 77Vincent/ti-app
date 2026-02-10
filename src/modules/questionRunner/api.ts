import type { DifficultyLevel } from "@/lib/meta";
import type { Question } from "./types";

export type GenerateQuestionInput = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
};

type GenerateQuestionResponse = {
  question?: Question;
  error?: string;
};

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
    throw new Error(payload.error ?? "Failed to load question.");
  }

  return payload.question;
}
