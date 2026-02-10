"use client";

import type { DifficultyLevel } from "@/lib/meta";
import { toastError } from "@/modules/toast/toastBus";
import { useEffect, useState } from "react";
import { fetchGeneratedQuestion } from "../api";
import type { Question as QuestionType, QuestionOptionId } from "../types";
import {
  isOptionCorrect as getIsOptionCorrect,
  isOptionWrongSelection as getIsOptionWrongSelection,
} from "../utils/evaluation";
import { useQuestionSelection } from "./useQuestionSelection";

export type UseQuestionInput = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
};

export type UseQuestionResult = {
  question: QuestionType | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  selectedOptionIds: QuestionOptionId[];
  isOptionCorrect: (optionId: QuestionOptionId) => boolean;
  isOptionWrongSelection: (optionId: QuestionOptionId) => boolean;
  selectOption: (optionId: QuestionOptionId) => void;
  submit: () => Promise<void>;
};

export function useQuestion({
  subjectId,
  subcategoryId,
  difficulty,
}: UseQuestionInput): UseQuestionResult {
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { selectedOptionIds, resetSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();

  useEffect(() => {
    let cancelled = false;

    async function loadInitialQuestion() {
      setIsLoadingQuestion(true);

      try {
        const nextQuestion = await fetchGeneratedQuestion({
          subjectId,
          subcategoryId,
          difficulty,
        });

        if (!cancelled) {
          setQuestion(nextQuestion);
          resetSelection();
          setHasSubmitted(false);
        }
      } catch (error) {
        if (!cancelled) {
          toastError(
            error instanceof Error ? error.message : "Failed to load question.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingQuestion(false);
        }
      }
    }

    loadInitialQuestion();

    return () => {
      cancelled = true;
    };
  }, [difficulty, resetSelection, subcategoryId, subjectId]);

  function selectOption(optionId: QuestionOptionId) {
    selectQuestionOption(question, optionId, isSubmitting || hasSubmitted);
  }

  function isOptionCorrect(optionId: QuestionOptionId): boolean {
    return getIsOptionCorrect(question, optionId);
  }

  function isOptionWrongSelection(optionId: QuestionOptionId): boolean {
    return getIsOptionWrongSelection(question, selectedOptionIds, optionId);
  }

  async function submit() {
    if (!question || selectedOptionIds.length === 0 || isSubmitting) {
      return;
    }

    if (!hasSubmitted) {
      setHasSubmitted(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const nextQuestion = await fetchGeneratedQuestion({
        subjectId,
        subcategoryId,
        difficulty,
      });
      setQuestion(nextQuestion);
      resetSelection();
      setHasSubmitted(false);
    } catch (error) {
      toastError(
        error instanceof Error ? error.message : "Failed to load question.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    question,
    isLoadingQuestion,
    isSubmitting,
    hasSubmitted,
    selectedOptionIds,
    isOptionCorrect,
    isOptionWrongSelection,
    selectOption,
    submit,
  };
}
