import type { GenerateQuestionRequest, Question } from "./types";
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
      difficulty: input.difficulty,
      ...firstQuestion,
    },
    {
      id: createQuestionId(),
      difficulty: input.difficulty,
      ...secondQuestion,
    },
  ];

  console.info("AI question generation completed.", {
    count: questions.length,
    difficulty: input.difficulty,
  });

  return questions;
}
