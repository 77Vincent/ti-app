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
import { resolveQuestionWithAI } from "./resolver";

function createQuestionId(prompt: string): string {
  return createHash(QUESTION_ID_HASH_ALGORITHM)
    .update(prompt)
    .digest(QUESTION_ID_HASH_ENCODING);
}

export async function createQuestionCandidatesWithAI(
  input: GenerateQuestionRequest,
): Promise<Question[]> {
  const content = await requestDeepSeekGeneratorContent(input);
  const [firstQuestion, secondQuestion] = parseAIQuestionPayload(content);

  const questions: Question[] = [
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

  const resolutionResults = await Promise.all(
    questions.map(async (question) => {
      const resolved = await resolveQuestionWithAI({
        prompt: question.prompt,
        options: question.options,
      });

      const creatorCorrectOptionIndex = question.correctOptionIndexes[0];
      const isMatched = resolved.correctOptionIndex === creatorCorrectOptionIndex;

      return { question, isMatched };
    }),
  );

  return resolutionResults
    .filter((result) => result.isMatched)
    .map((result) => result.question);
}
