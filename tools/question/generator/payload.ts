import {
  type Question,
  type QuestionOption,
} from "../types";
import { QUESTION_OPTION_COUNT } from "../../../src/lib/config/question";
import { isNonEmptyString } from "../../../src/lib/string";
import { parseAIJson } from "../json";

export type ParsedAIQuestionPayload = Pick<
  Question,
  "prompt" | "options" | "correctOptionIndexes"
>;

function parseQuestionPayload(value: unknown): ParsedAIQuestionPayload {
  if (!value || typeof value !== "object") {
    throw new Error("AI response shape is invalid.");
  }

  const { p, o, a } = value as Record<string, unknown>;
  if (!isNonEmptyString(p)) {
    throw new Error("AI response shape is invalid.");
  }

  if (!Array.isArray(o) || o.length !== QUESTION_OPTION_COUNT) {
    throw new Error("AI options are invalid.");
  }
  const options: QuestionOption[] = o.map((item) => {
    if (
      !Array.isArray(item) ||
      item.length !== 2 ||
      !isNonEmptyString(item[0]) ||
      typeof item[1] !== "string"
    ) {
      throw new Error("AI options are invalid.");
    }

    return {
      text: item[0].trim(),
      explanation: item[1].trim(),
    };
  });

  const answerIndex = a;
  if (
    typeof answerIndex !== "number" ||
    !Number.isInteger(answerIndex) ||
    answerIndex < 0 ||
    answerIndex >= QUESTION_OPTION_COUNT
  ) {
    throw new Error("AI correct options are invalid.");
  }

  return {
    prompt: p.trim(),
    options,
    correctOptionIndexes: [answerIndex],
  };
}

export function parseAIQuestionPayload(
  content: string,
): ParsedAIQuestionPayload[] {
  let questions: unknown;
  try {
    questions = parseAIJson(content);
  } catch {
    throw new Error("AI response was not valid JSON.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("AI response shape is invalid.");
  }

  return questions.map((question) => parseQuestionPayload(question));
}
