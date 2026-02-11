import { QUESTION_TYPES } from "@/lib/meta";
import type { QuestionType } from "@/lib/meta";
import {
  hasValidCorrectOptionCount,
  isQuestionType,
  type QuestionOptionId,
  parseCorrectOptionIds,
  parseQuestionOptions,
} from "@/lib/validation/question";
import { isNonEmptyString } from "@/lib/string";

type QuestionOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

export type ParsedAIQuestionPayload = {
  questionType: QuestionType;
  prompt: string;
  options: QuestionOption[];
  correctOptionIds: QuestionOptionId[];
};

function parseJsonObject(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error("AI response was not valid JSON.");
    }

    try {
      return JSON.parse(content.slice(firstBrace, lastBrace + 1));
    } catch {
      throw new Error("AI response was not valid JSON.");
    }
  }
}

function parseQuestionPayload(value: unknown): ParsedAIQuestionPayload {
  if (!value || typeof value !== "object") {
    throw new Error("AI response shape is invalid.");
  }

  const { questionType, prompt, options, correctOptionIds } =
    value as Record<string, unknown>;

  if (!isQuestionType(questionType) || !isNonEmptyString(prompt)) {
    throw new Error("AI response shape is invalid.");
  }

  const parsedOptions = parseQuestionOptions(options, {
    minOptions: 4,
    maxOptions: 6,
    requireSequentialFromA: true,
  });
  if (!parsedOptions) {
    throw new Error("AI options are invalid.");
  }

  const parsedCorrectOptionIds = parseCorrectOptionIds(
    correctOptionIds,
    parsedOptions,
  );
  if (!parsedCorrectOptionIds) {
    throw new Error("AI correct options are invalid.");
  }

  if (
    questionType === QUESTION_TYPES.MULTIPLE_CHOICE &&
    !hasValidCorrectOptionCount(questionType, parsedCorrectOptionIds)
  ) {
    throw new Error("AI multiple_choice must have exactly one correct option.");
  }

  if (
    questionType === QUESTION_TYPES.MULTIPLE_ANSWER &&
    !hasValidCorrectOptionCount(questionType, parsedCorrectOptionIds)
  ) {
    throw new Error("AI multiple_answer must have at least two correct options.");
  }

  return {
    questionType,
    prompt: prompt.trim(),
    options: parsedOptions,
    correctOptionIds: parsedCorrectOptionIds,
  };
}

export function parseAIQuestionPayload(content: string): ParsedAIQuestionPayload {
  return parseQuestionPayload(parseJsonObject(content));
}
