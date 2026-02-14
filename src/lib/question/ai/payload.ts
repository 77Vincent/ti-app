import { QUESTION_TYPES } from "@/lib/meta";
import type { QuestionType } from "@/lib/meta";
import {
  hasValidCorrectOptionCount,
  type ParsedQuestionOption,
  parseCorrectOptionIds,
  parseQuestionOptions,
} from "@/lib/question/validation";
import {
  QUESTION_OPTION_IDS,
  type QuestionOption,
  type QuestionOptionId,
} from "@/lib/question/model";
import { QUESTION_OPTION_LIMITS } from "@/lib/config/questionPolicy";
import { isNonEmptyString } from "@/lib/string";

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

function parseCompactQuestionType(value: unknown): QuestionType | null {
  if (value === "mc") {
    return QUESTION_TYPES.MULTIPLE_CHOICE;
  }

  if (value === "ma") {
    return QUESTION_TYPES.MULTIPLE_ANSWER;
  }

  return null;
}

function parseCompactOptions(value: unknown): ParsedQuestionOption[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const options = value.map((item, index) => {
    if (
      !Array.isArray(item) ||
      item.length !== 2 ||
      !isNonEmptyString(item[0]) ||
      !isNonEmptyString(item[1])
    ) {
      return null;
    }

    return {
      id: QUESTION_OPTION_IDS[index],
      text: item[0].trim(),
      explanation: item[1].trim(),
    };
  });

  if (options.some((option) => option === null)) {
    return null;
  }

  return parseQuestionOptions(options, {
    ...QUESTION_OPTION_LIMITS,
    requireSequentialFromA: true,
  });
}

function parseCompactCorrectOptionIds(
  value: unknown,
  options: ParsedQuestionOption[],
): QuestionOptionId[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const ids: QuestionOptionId[] = [];

  for (const item of value) {
    if (!Number.isInteger(item)) {
      return null;
    }

    const index = item;
    if (index < 0 || index >= options.length) {
      return null;
    }

    const optionId = options[index]?.id;
    if (!optionId) {
      return null;
    }

    ids.push(optionId);
  }

  return parseCorrectOptionIds(ids, options);
}

function parseQuestionPayload(value: unknown): ParsedAIQuestionPayload {
  if (!value || typeof value !== "object") {
    throw new Error("AI response shape is invalid.");
  }

  const { t, p, o, a } = value as Record<string, unknown>;
  const questionType = parseCompactQuestionType(t);

  if (questionType === null || !isNonEmptyString(p)) {
    throw new Error("AI response shape is invalid.");
  }

  const parsedOptions = parseCompactOptions(o);
  if (!parsedOptions) {
    throw new Error("AI options are invalid.");
  }

  const parsedCorrectOptionIds = parseCompactCorrectOptionIds(
    a,
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
    prompt: p.trim(),
    options: parsedOptions,
    correctOptionIds: parsedCorrectOptionIds,
  };
}

export function parseAIQuestionPayload(
  content: string,
): [ParsedAIQuestionPayload, ParsedAIQuestionPayload] {
  const payload = parseJsonObject(content);

  if (!payload || typeof payload !== "object") {
    throw new Error("AI response shape is invalid.");
  }

  const questions = (payload as { q?: unknown }).q;

  if (!Array.isArray(questions) || questions.length !== 2) {
    throw new Error("AI response shape is invalid.");
  }

  const [firstQuestion, secondQuestion] = questions;

  return [
    parseQuestionPayload(firstQuestion),
    parseQuestionPayload(secondQuestion),
  ];
}
