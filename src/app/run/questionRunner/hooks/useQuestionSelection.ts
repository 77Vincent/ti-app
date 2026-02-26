"use client";

import { useCallback, useState } from "react";
import type { Question as QuestionType, QuestionOptionIndex } from "../types";

export type UseQuestionSelectionResult = {
  selectedOptionIndexes: QuestionOptionIndex[];
  setSelection: (selectedOptionIndexes: QuestionOptionIndex[]) => void;
  selectOption: (
    question: QuestionType | null,
    optionIndex: QuestionOptionIndex,
    disabled?: boolean,
  ) => QuestionOptionIndex[] | null;
};

export function useQuestionSelection(): UseQuestionSelectionResult {
  const [selectedOptionIndexes, setSelectedOptionIndexes] = useState<QuestionOptionIndex[]>([]);

  const setSelection = useCallback((nextSelection: QuestionOptionIndex[]) => {
    setSelectedOptionIndexes([...nextSelection]);
  }, []);

  const selectOption = useCallback((
    question: QuestionType | null,
    optionIndex: QuestionOptionIndex,
    disabled = false,
  ) => {
    if (!question || disabled) {
      return null;
    }

    const nextSelection: QuestionOptionIndex[] = [optionIndex];
    setSelectedOptionIndexes(nextSelection);
    return nextSelection;
  }, []);

  return {
    selectedOptionIndexes,
    setSelection,
    selectOption,
  };
}
