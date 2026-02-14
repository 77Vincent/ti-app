import type { Question } from "@/lib/validation/question";
import type { QuestionParam as GenerateQuestionRequest } from "@/lib/testSession/validation";
import { requestOpenAIQuestionContent } from "./client";
import { parseAIQuestionPayload } from "./payload";

function createQuestionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

export async function generateQuestionWithAI(
  input: GenerateQuestionRequest,
): Promise<[Question, Question]> {
  const content = await requestOpenAIQuestionContent(input);
  const [firstQuestion, secondQuestion] = parseAIQuestionPayload(content);

  return [
    {
      id: createQuestionId(),
      ...firstQuestion,
    },
    {
      id: createQuestionId(),
      ...secondQuestion,
    },
  ];
}
