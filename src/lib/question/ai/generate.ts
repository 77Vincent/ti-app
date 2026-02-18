import type { Question } from "@/lib/question/model";
import type { QuestionParam as GenerateQuestionRequest } from "@/lib/testSession/validation";
import { requestDeepSeekQuestionContent } from "./client";
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
  const content = await requestDeepSeekQuestionContent(input);
  const [firstQuestion, secondQuestion] = parseAIQuestionPayload(content);

  const questions: [Question, Question] = [
    {
      id: createQuestionId(),
      ...firstQuestion,
    },
    {
      id: createQuestionId(),
      ...secondQuestion,
    },
  ];

  console.info("AI question generation completed.", {
    count: questions.length,
    difficulty: input.difficulty,
    subcategoryId: input.subcategoryId,
    subjectId: input.subjectId,
  });

  return questions;
}
