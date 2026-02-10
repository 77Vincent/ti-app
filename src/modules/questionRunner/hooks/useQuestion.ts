"use client";

import type { DifficultyLevel } from "@/lib/meta";
import { toastError } from "@/modules/toast/toastBus";
import { useCallback, useEffect, useState } from "react";
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
  const [prefetchedQuestion, setPrefetchedQuestion] = useState<QuestionType | null>(
    null,
  );
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { selectedOptionIds, resetSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();

  const applyLoadedQuestion = useCallback(
    (nextQuestion: QuestionType) => {
      setQuestion(nextQuestion);
      resetSelection();
      setHasSubmitted(false);
    },
    [resetSelection],
  );

  const loadQuestion = useCallback(async () => {
    return fetchGeneratedQuestion({
      subjectId,
      subcategoryId,
      difficulty,
    });
  }, [difficulty, subcategoryId, subjectId]);

  const prefetchNextQuestion = useCallback(
    async (showError = false) => {
      try {
        const nextQuestion = await loadQuestion();
        setPrefetchedQuestion(nextQuestion);
      } catch (error) {
        setPrefetchedQuestion(null);

        if (showError) {
          toastError(
            error instanceof Error ? error.message : "Failed to load question.",
          );
        }
      }
    },
    [loadQuestion],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialQuestion() {
      setIsLoadingQuestion(true);
      setPrefetchedQuestion(null);

      try {
        const nextQuestion = await loadQuestion();

        if (!cancelled) {
          applyLoadedQuestion(nextQuestion);

          // Keep one question ready in the background for smooth continue.
          void prefetchNextQuestion();
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
  }, [applyLoadedQuestion, loadQuestion, prefetchNextQuestion]);

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

    if (prefetchedQuestion) {
      applyLoadedQuestion(prefetchedQuestion);
      setPrefetchedQuestion(null);
      void prefetchNextQuestion();
      return;
    }

    setIsSubmitting(true);

    try {
      const nextQuestion = await loadQuestion();
      applyLoadedQuestion(nextQuestion);
      void prefetchNextQuestion();
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
