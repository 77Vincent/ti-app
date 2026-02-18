"use client";

import { useCallback, useState } from "react";
import type { Question as QuestionType, QuestionOptionId } from "../types";

export type UseQuestionSelectionResult = {
  selectedOptionIds: QuestionOptionId[];
  setSelection: (selectedOptionIds: QuestionOptionId[]) => void;
  selectOption: (
    question: QuestionType | null,
    optionId: QuestionOptionId,
    disabled?: boolean,
  ) => QuestionOptionId[] | null;
};

export function useQuestionSelection(): UseQuestionSelectionResult {
  const [selectedOptionIds, setSelectedOptionIds] = useState<QuestionOptionId[]>([]);

  const setSelection = useCallback((nextSelection: QuestionOptionId[]) => {
    setSelectedOptionIds([...nextSelection]);
  }, []);

  const selectOption = useCallback((
    question: QuestionType | null,
    optionId: QuestionOptionId,
    disabled = false,
  ) => {
    if (!question || disabled) {
      return null;
    }

    const nextSelection: QuestionOptionId[] = [optionId];
    setSelectedOptionIds(nextSelection);
    return nextSelection;
  }, []);

  return {
    selectedOptionIds,
    setSelection,
    selectOption,
  };
}
