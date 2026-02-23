import type { SubjectEnum, SubcategoryEnum } from "@/lib/meta";
import { API_PATHS } from "@/lib/config/paths";
import { parseHttpErrorMessage } from "@/lib/http/error";
import type { Question } from "../types";
import { QuestionRunnerApiError } from "./error";

export type FetchQuestionInput = {
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: string;
};

type FetchQuestionResponse = {
  question?: Question;
  error?: string;
};

export async function fetchQuestion(
  input: FetchQuestionInput,
): Promise<Question> {
  const response = await fetch(API_PATHS.QUESTIONS_FETCH, {
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
