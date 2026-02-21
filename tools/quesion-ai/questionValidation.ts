import { isNonEmptyString } from "./string";
import {
  QUESTION_OPTION_IDS,
  type QuestionOption,
  type QuestionOptionId,
} from "./types";

type ParseQuestionOptionsConfig = {
  minOptions?: number;
  maxOptions?: number;
  requireSequentialFromA?: boolean;
};

export type ParsedQuestionOption = QuestionOption;

export function isQuestionOptionId(value: string): value is QuestionOptionId {
  return QUESTION_OPTION_IDS.includes(value as QuestionOptionId);
}

export function parseQuestionOptions(
  value: unknown,
  config?: ParseQuestionOptionsConfig,
): ParsedQuestionOption[] | null {
  const minOptions = config?.minOptions ?? 3;
  const maxOptions = config?.maxOptions ?? 4;

  if (!Array.isArray(value) || value.length < minOptions || value.length > maxOptions) {
    return null;
  }

  const options: ParsedQuestionOption[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const id = (item as { id?: unknown }).id;
    const text = (item as { text?: unknown }).text;
    const explanation = (item as { explanation?: unknown }).explanation;

    if (
      !isNonEmptyString(id) ||
      !isQuestionOptionId(id) ||
      !isNonEmptyString(text) ||
      !isNonEmptyString(explanation)
    ) {
      return null;
    }

    options.push({
      id,
      text: text.trim(),
      explanation: explanation.trim(),
    });
  }

  const ids = options.map((option) => option.id);
  if (new Set(ids).size !== ids.length) {
    return null;
  }

  if (config?.requireSequentialFromA) {
    const expectedIds = QUESTION_OPTION_IDS.slice(0, options.length);

    if (!expectedIds.every((expectedId, index) => ids[index] === expectedId)) {
      return null;
    }
  }

  return options;
}

export function parseCorrectOptionIds(
  value: unknown,
  options: readonly ParsedQuestionOption[],
): QuestionOptionId[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const optionIdSet = new Set(options.map((option) => option.id));
  const ids: QuestionOptionId[] = [];

  for (const item of value) {
    if (!isNonEmptyString(item) || !isQuestionOptionId(item)) {
      return null;
    }

    if (!optionIdSet.has(item)) {
      return null;
    }

    ids.push(item);
  }

  if (new Set(ids).size !== ids.length) {
    return null;
  }

  return ids;
}

export function hasSingleCorrectOption(
  correctOptionIds: QuestionOptionId[],
): boolean {
  return correctOptionIds.length === 1;
}
