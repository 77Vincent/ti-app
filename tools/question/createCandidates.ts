import { createHash } from "node:crypto";
import type { GenerateQuestionRequest, Question } from "./types";
import {
  QUESTION_ID_HASH_ALGORITHM,
  QUESTION_ID_HASH_ENCODING,
} from "./config/constants";
import { DIFFICULTY_LADDER_BY_SUBCATEGORY } from "../../shared/difficultyLadder";
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
  console.log(content)
  const parsedQuestions = parseAIQuestionPayload(content);
  const questions: Question[] = parsedQuestions.map((question) => ({
    id: createQuestionId(question.prompt),
    difficulty: input.difficulty,
    ...question,
  }));
  const difficultyProfile = DIFFICULTY_LADDER_BY_SUBCATEGORY[input.subcategory];
  const difficultyFramework = difficultyProfile.framework;
  const difficultyLadder = difficultyProfile.ladder;

  const resolutionResults = await Promise.all(
    questions.map(async (question) => {
      const resolved = await resolveQuestionWithAI(
        {
          prompt: question.prompt,
          options: question.options,
        },
        difficultyFramework,
        difficultyLadder,
      );
      console.log("Resolved question:", resolved);

      const creatorCorrectOptionIndex = question.correctOptionIndexes[0];
      const isMatched =
        resolved.correctOptionIndex === creatorCorrectOptionIndex &&
        resolved.difficulty === question.difficulty;

      return { question, isMatched };
    }),
  );

  return resolutionResults
    .filter((result) => result.isMatched)
    .map((result) => result.question);
}
