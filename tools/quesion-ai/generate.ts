import { createHash } from "node:crypto";
import type { GenerateQuestionRequest, Question } from "./types";
import {
  QUESTION_ID_HASH_ALGORITHM,
  QUESTION_ID_HASH_ENCODING,
  REQUIRED_VALIDATED_QUESTION_COUNT,
} from "./config/constants";
import {
  requestDeepSeekGeneratorContent,
  parseAIQuestionPayload,
  type ParsedAIQuestionPayload,
} from "./generator";
import {
  requestDeepSeekResolverContent,
  parseAIResolverAnswer,
} from "./resolver";

function createQuestionId(prompt: string): string {
  return createHash(QUESTION_ID_HASH_ALGORITHM)
    .update(prompt)
    .digest(QUESTION_ID_HASH_ENCODING);
}

async function resolveQuestionCandidate(
  candidate: ParsedAIQuestionPayload,
): Promise<{ candidate: ParsedAIQuestionPayload; matched: boolean }> {
  const resolverContent = await requestDeepSeekResolverContent({
    options: candidate.options,
    prompt: candidate.prompt,
  });
  const resolverAnswer = parseAIResolverAnswer(
    resolverContent,
    candidate.options.length,
  );

  return {
    candidate,
    matched: resolverAnswer === candidate.correctOptionIndexes[0],
  };
}

export async function generateQuestionWithAI(
  input: GenerateQuestionRequest,
): Promise<[Question, Question]> {
  const content = await requestDeepSeekGeneratorContent(input);
  const generatedCandidates = parseAIQuestionPayload(content);
  const validationResults = await Promise.all(
    generatedCandidates.map(resolveQuestionCandidate),
  );
  const validatedCandidates = validationResults
    .filter((result) => result.matched)
    .map((result) => result.candidate);

  if (validatedCandidates.length < REQUIRED_VALIDATED_QUESTION_COUNT) {
    throw new Error(
      `Resolver validation failed. Expected ${REQUIRED_VALIDATED_QUESTION_COUNT} accepted candidates, received ${validatedCandidates.length}.`,
    );
  }

  const [firstQuestion, secondQuestion] = validatedCandidates as [
    ParsedAIQuestionPayload,
    ParsedAIQuestionPayload,
  ];

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

  console.info("AI question generation completed with resolver validation.", {
    count: questions.length,
    difficulty: input.difficulty,
    generatedCount: generatedCandidates.length,
    matchedCount: validatedCandidates.length,
  });

  return questions;
}
