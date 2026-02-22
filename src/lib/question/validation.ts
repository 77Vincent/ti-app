import { QUESTION_TYPES, type QuestionType } from "@/lib/meta";
import { QUESTION_OPTION_LIMITS } from "@/lib/config/questionPolicy";
import { isNonEmptyString } from "@/lib/string";
import {
  type QuestionOption,
  type QuestionOptionIndex,
} from "./model";

type ParseQuestionOptionsConfig = {
  minOptions?: number;
  maxOptions?: number;
};

export type ParsedQuestionOption = QuestionOption;

export function isQuestionType(value: unknown): value is QuestionType {
  return value === QUESTION_TYPES.MULTIPLE_CHOICE;
}

export function parseQuestionOptions(
  value: unknown,
  config?: ParseQuestionOptionsConfig,
): ParsedQuestionOption[] | null {
  const minOptions = config?.minOptions ?? QUESTION_OPTION_LIMITS.minOptions;
  const maxOptions = config?.maxOptions ?? QUESTION_OPTION_LIMITS.maxOptions;

  if (!Array.isArray(value) || value.length < minOptions || value.length > maxOptions) {
    return null;
  }

  const options: ParsedQuestionOption[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const text = (item as { text?: unknown }).text;
    const explanation = (item as { explanation?: unknown }).explanation;

    if (
      !isNonEmptyString(text) ||
      !isNonEmptyString(explanation)
    ) {
      return null;
    }

    options.push({
      text: text.trim(),
      explanation: explanation.trim(),
    });
  }

  return options;
}

export function parseQuestionDifficulty(value: unknown): string | null {
  if (!isNonEmptyString(value)) {
    return null;
  }

  return value.trim();
}

export function parseCorrectOptionIndexes(
  value: unknown,
  options: readonly ParsedQuestionOption[],
): QuestionOptionIndex[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const indexes: QuestionOptionIndex[] = [];

  for (const item of value) {
    if (!Number.isInteger(item)) {
      return null;
    }

    const index = item;
    if (index < 0 || index >= options.length) {
      return null;
    }

    indexes.push(index);
  }

  if (new Set(indexes).size !== indexes.length) {
    return null;
  }

  return indexes;
}

export function hasSingleCorrectOption(
  correctOptionIndexes: QuestionOptionIndex[],
): boolean {
  return correctOptionIndexes.length === 1;
}
