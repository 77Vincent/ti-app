import type { QuestionType } from "@/lib/meta";
import type { QuestionOptionId } from "@/lib/validation/question";
import type { TestRunParams as GenerateQuestionRequest } from "@/lib/validation/testSession";
import { requestOpenAIQuestionContent } from "./client";
import { parseAIQuestionPayload } from "./payload";

export type Question = {
  id: string;
  prompt: string;
  questionType: QuestionType;
  options: Array<{
    id: QuestionOptionId;
    text: string;
    explanation: string;
  }>;
  correctOptionIds: QuestionOptionId[];
};

function createQuestionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

export async function generateQuestionWithAI(
  input: GenerateQuestionRequest,
): Promise<Question> {
  const content = await requestOpenAIQuestionContent(input);
  const parsedQuestion = parseAIQuestionPayload(content);

  return {
    id: createQuestionId(),
    ...parsedQuestion,
  };
}
