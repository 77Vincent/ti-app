import {
  hasSingleCorrectOption,
  type ParsedQuestionOption,
  parseCorrectOptionIds,
  parseQuestionOptions,
} from "./questionValidation";
import {
  QUESTION_OPTION_LIMITS,
  QUESTION_OPTION_IDS,
  type QuestionOption,
  type QuestionOptionId,
  QUESTION_TYPE_MULTIPLE_CHOICE,
} from "./types";
import { isNonEmptyString } from "./string";

export type ParsedAIQuestionPayload = {
  questionType: typeof QUESTION_TYPE_MULTIPLE_CHOICE;
  prompt: string;
  options: QuestionOption[];
  correctOptionIds: QuestionOptionId[];
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

  const { p, o, a } = value as Record<string, unknown>;
  if (!isNonEmptyString(p)) {
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

  if (!hasSingleCorrectOption(parsedCorrectOptionIds)) {
    throw new Error("AI multiple_choice must have exactly one correct option.");
  }

  return {
    questionType: QUESTION_TYPE_MULTIPLE_CHOICE,
    prompt: p.trim(),
    options: parsedOptions,
    correctOptionIds: parsedCorrectOptionIds,
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
