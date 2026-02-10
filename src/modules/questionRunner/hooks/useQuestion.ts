"use client";

import type { DifficultyEnum } from "@/lib/meta";
import {
  clearAsyncBuffer,
  consumeAsyncBuffer,
  createAsyncBuffer,
  fillAsyncBuffer,
} from "@/lib/asyncBuffer";
import { toastError } from "@/modules/toast/toastBus";
import { useCallback, useEffect, useRef, useState } from "react";
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
  difficulty: DifficultyEnum;
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

const PREFETCH_BUFFER_SIZE = 2;

export function useQuestion({
  subjectId,
  subcategoryId,
  difficulty,
}: UseQuestionInput): UseQuestionResult {
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const bufferRef = useRef(createAsyncBuffer<QuestionType>(PREFETCH_BUFFER_SIZE));
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { selectedOptionIds, resetSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();

  const showLoadError = useCallback((error: unknown) => {
    toastError(
      error instanceof Error ? error.message : "Failed to load question.",
    );
  }, []);

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

  const prefetchQuestions = useCallback(async () => {
    try {
      await fillAsyncBuffer(bufferRef.current, loadQuestion);
    } catch {
      // Silent prefetch failure: submit path still fetches on demand.
    }
  }, [loadQuestion]);

  const advanceToNextQuestion = useCallback(
    (nextQuestion: QuestionType) => {
      applyLoadedQuestion(nextQuestion);
      void prefetchQuestions();
    },
    [applyLoadedQuestion, prefetchQuestions],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialQuestion() {
      setIsLoadingQuestion(true);
      clearAsyncBuffer(bufferRef.current);

      try {
        const nextQuestion = await loadQuestion();

        if (!cancelled) {
          applyLoadedQuestion(nextQuestion);

          // Keep two questions ready in the background for smoother continue.
          void prefetchQuestions();
        }
      } catch (error) {
        if (!cancelled) {
          showLoadError(error);
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
  }, [applyLoadedQuestion, loadQuestion, prefetchQuestions, showLoadError]);

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

    const nextBufferedQuestion = consumeAsyncBuffer(bufferRef.current);

    if (nextBufferedQuestion) {
      advanceToNextQuestion(nextBufferedQuestion);
      return;
    }

    setIsSubmitting(true);

    try {
      const nextQuestion = await loadQuestion();
      advanceToNextQuestion(nextQuestion);
    } catch (error) {
      showLoadError(error);
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
