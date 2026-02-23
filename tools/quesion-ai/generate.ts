import { createHash } from "node:crypto";
import type { GenerateQuestionRequest, Question } from "./types";
import {
  QUESTION_ID_HASH_ALGORITHM,
  QUESTION_ID_HASH_ENCODING,
} from "./config/constants";
import {
  requestDeepSeekGeneratorContent,
  parseAIQuestionPayload,
} from "./generator";

function createQuestionId(prompt: string): string {
  return createHash(QUESTION_ID_HASH_ALGORITHM)
    .update(prompt)
    .digest(QUESTION_ID_HASH_ENCODING);
}

export async function generateQuestionWithAI(
  input: GenerateQuestionRequest,
): Promise<[Question, Question]> {
  const content = await requestDeepSeekGeneratorContent(input);
  const [firstQuestion, secondQuestion] = parseAIQuestionPayload(content);

  const questions: [Question, Question] = [
    {
      id: createQuestionId(firstQuestion.prompt),
      difficulty: input.difficulty,
      ...firstQuestion,
    },
    {
      id: createQuestionId(secondQuestion.prompt),
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
