import { createHash } from "node:crypto";
import type { GenerateQuestionRequest, Question } from "../types";
import {
  QUESTION_ID_HASH_ALGORITHM,
  QUESTION_ID_HASH_ENCODING,
} from "../utils/config";
import {
  requestDeepSeekGeneratorContent,
  parseAIQuestionPayload,
} from "./index";

function createQuestionId(prompt: string): string {
  return createHash(QUESTION_ID_HASH_ALGORITHM)
    .update(prompt)
    .digest(QUESTION_ID_HASH_ENCODING);
}

export async function createQuestionsWithAI(
  input: GenerateQuestionRequest,
): Promise<Question[]> {
  const content = await requestDeepSeekGeneratorContent(input);
  const parsedQuestions = parseAIQuestionPayload(content);
  return parsedQuestions.map((question) => ({
    id: createQuestionId(question.prompt),
    difficulty: input.difficulty,
    ...question,
  }));
}
