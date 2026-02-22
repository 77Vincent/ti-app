import {
  QUESTION_OPTION_LIMITS,
  type QuestionOption,
  QUESTION_TYPE_MULTIPLE_CHOICE,
} from "./types";
import { isNonEmptyString } from "./string";

export type ParsedAIQuestionPayload = {
  questionType: typeof QUESTION_TYPE_MULTIPLE_CHOICE;
  prompt: string;
  options: QuestionOption[];
  correctOptionIndexes: number[];
};

function parseJsonValue(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const firstBracket = content.indexOf("[");
    const lastBracket = content.lastIndexOf("]");

    if (
      firstBracket === -1 ||
      lastBracket === -1 ||
      firstBracket >= lastBracket
    ) {
      throw new Error("AI response was not valid JSON.");
    }

    try {
      return JSON.parse(content.slice(firstBracket, lastBracket + 1));
    } catch {
      throw new Error("AI response was not valid JSON.");
    }
  }
}

function parseCompactOptions(value: unknown): QuestionOption[] | null {
  if (
    !Array.isArray(value) ||
    value.length < QUESTION_OPTION_LIMITS.minOptions ||
    value.length > QUESTION_OPTION_LIMITS.maxOptions
  ) {
    return null;
  }

  const options = value.map((item) => {
    if (
      !Array.isArray(item) ||
      item.length !== 2 ||
      !isNonEmptyString(item[0]) ||
      !isNonEmptyString(item[1])
    ) {
      return null;
    }

    return {
      text: item[0].trim(),
      explanation: item[1].trim(),
    };
  });

  if (options.some((option) => option === null)) {
    return null;
  }

  return options;
}

function parseCompactCorrectOptionIndexes(
  value: unknown,
  optionCount: number,
): number[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const indexes: number[] = [];

  for (const item of value) {
    if (!Number.isInteger(item)) {
      return null;
    }

    const index = item;
    if (index < 0 || index >= optionCount) {
      return null;
    }

    indexes.push(index);
  }

  if (new Set(indexes).size !== indexes.length) {
    return null;
  }

  return indexes;
}

function parseQuestionPayload(value: unknown): ParsedAIQuestionPayload {
  if (!value || typeof value !== "object") {
    throw new Error("AI response shape is invalid.");
  }

  const { p, o, a } = value as Record<string, unknown>;
  if (!isNonEmptyString(p)) {
    throw new Error("AI response shape is invalid.");
  }

  const parsedOptions = parseCompactOptions(o);
  if (!parsedOptions) {
    throw new Error("AI options are invalid.");
  }

  const parsedCorrectOptionIndexes = parseCompactCorrectOptionIndexes(
    a,
    parsedOptions.length,
  );
  if (!parsedCorrectOptionIndexes) {
    throw new Error("AI correct options are invalid.");
  }

  if (parsedCorrectOptionIndexes.length !== 1) {
    throw new Error("AI multiple_choice must have exactly one correct option.");
  }

  return {
    questionType: QUESTION_TYPE_MULTIPLE_CHOICE,
    prompt: p.trim(),
    options: parsedOptions,
    correctOptionIndexes: parsedCorrectOptionIndexes,
  };
}

export function parseAIQuestionPayload(
  content: string,
): [ParsedAIQuestionPayload, ParsedAIQuestionPayload] {
  const questions = parseJsonValue(content);

  if (!Array.isArray(questions) || questions.length !== 2) {
    throw new Error("AI response shape is invalid.");
  }

  const [firstQuestion, secondQuestion] = questions;

  return [
    parseQuestionPayload(firstQuestion),
    parseQuestionPayload(secondQuestion),
  ];
}
