import type { Question as QuestionType, QuestionOptionIndex } from "../types";

export function isOptionCorrect(
  question: QuestionType | null,
  optionIndex: QuestionOptionIndex,
): boolean {
  return question ? question.correctOptionIndexes.includes(optionIndex) : false;
}

export function isOptionWrongSelection(
  question: QuestionType | null,
  selectedOptionIndexes: QuestionOptionIndex[],
  optionIndex: QuestionOptionIndex,
): boolean {
  if (!question) {
    return false;
  }

  return selectedOptionIndexes.includes(optionIndex) && !isOptionCorrect(question, optionIndex);
}

export function isAnswerCorrect(
  question: QuestionType | null,
  selectedOptionIndexes: QuestionOptionIndex[],
): boolean {
  if (!question) {
    return false;
  }

  const correctOptionIndexes = question.correctOptionIndexes;
  if (selectedOptionIndexes.length !== correctOptionIndexes.length) {
    return false;
  }

  const selectedOptionIndexSet = new Set(selectedOptionIndexes);
  if (selectedOptionIndexSet.size !== selectedOptionIndexes.length) {
    return false;
  }

  return correctOptionIndexes.every((optionIndex) =>
    selectedOptionIndexSet.has(optionIndex),
  );
}
