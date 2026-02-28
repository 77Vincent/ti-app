"use client";

import type { SubjectEnum, SubcategoryEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { notifyUserPlanRefresh } from "@/lib/events/userPlan";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { fetchQuestion } from "../api";
import { QuestionRunnerApiError } from "../api/error";
import { recordQuestionResult } from "../session/storage";
import type {
  Question as QuestionType,
  QuestionOptionIndex,
  QuestionAccessDemand,
} from "../types";
import {
  INITIAL_QUESTION_SESSION_UI_STATE,
  questionSessionUiReducer,
} from "../session/reducer";
import { isAnswerCorrect } from "../utils/evaluation";
import { useQuestionSelection } from "./useQuestionSelection";

export type UseQuestionInput = {
  sessionId: string;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: string;
  initialCorrectCount: number;
  initialSubmittedCount: number;
};

export type UseQuestionResult = {
  question: QuestionType | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  difficulty: string;
  submittedCount: number;
  correctCount: number;
  isAccessBlocked: boolean;
  accessDemand: QuestionAccessDemand | null;
  hasSubmitted: boolean;
  selectedOptionIndexes: QuestionOptionIndex[];
  selectOption: (
    optionIndex: QuestionOptionIndex,
  ) => QuestionOptionIndex[] | null;
  submit: (
    selectionOverride?: QuestionOptionIndex[] | null,
  ) => Promise<void>;
};

export function useQuestion({
  sessionId,
  subjectId,
  subcategoryId,
  difficulty,
  initialCorrectCount,
  initialSubmittedCount,
}: UseQuestionInput): UseQuestionResult {
  const [sessionProgress, setSessionProgress] = useState(
    () => ({
      submittedCount: initialSubmittedCount,
      correctCount: initialCorrectCount,
    }),
  );
  const [sessionDifficulty, setSessionDifficulty] = useState(difficulty);
  const [pendingDifficulty, setPendingDifficulty] = useState<string | null>(null);
  const [accessDemand, setAccessDemand] =
    useState<QuestionAccessDemand | null>(null);
  const [uiState, dispatchUiState] = useReducer(
    questionSessionUiReducer,
    INITIAL_QUESTION_SESSION_UI_STATE,
  );
  const prefetchedQuestionRef = useRef<{
    key: string;
    question: QuestionType;
  } | null>(null);
  const prefetchRequestKeyRef = useRef<string | null>(null);
  const { question, isLoadingQuestion, isSubmitting, hasSubmitted } = uiState;
  const { selectedOptionIndexes, setSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();
  const readQuestionLimitDemand = useCallback(
    (error: unknown): QuestionAccessDemand | null => {
      if (!(error instanceof QuestionRunnerApiError)) {
        return null;
      }

      if (error.status === 403) {
        return "more_questions";
      }
      if (error.status === 429) {
        return "upgrade_pro";
      }

      return null;
    },
    [],
  );
  const handleDemandError = useCallback(
    (
      error: unknown,
      onNonDemandError: (nextError: unknown) => void,
    ): boolean => {
      const questionLimitDemand = readQuestionLimitDemand(error);
      if (!questionLimitDemand) {
        onNonDemandError(error);
        return false;
      }

      setAccessDemand(questionLimitDemand);
      return true;
    },
    [readQuestionLimitDemand],
  );
  const showLoadError = useCallback((error: unknown) => {
    toast.error(error, {
      fallbackDescription: "Failed to load question.",
    });
  }, []);

  const loadQuestion = useCallback(
    (difficultyToLoad: string, next = false) => {
      return fetchQuestion({
        sessionId,
        subjectId,
        subcategoryId,
        difficulty: difficultyToLoad,
        next,
      });
    },
    [sessionId, subcategoryId, subjectId],
  );

  const buildPrefetchKey = useCallback((difficultyToLoad: string): string => {
    return `${sessionId}:${subjectId}:${subcategoryId}:${difficultyToLoad}`;
  }, [sessionId, subjectId, subcategoryId]);

  const clearPrefetchedQuestion = useCallback((): void => {
    prefetchedQuestionRef.current = null;
    prefetchRequestKeyRef.current = null;
  }, []);

  const prefetchNextQuestion = useCallback((difficultyToLoad: string): void => {
    const key = buildPrefetchKey(difficultyToLoad);
    if (prefetchedQuestionRef.current?.key === key) {
      return;
    }
    if (prefetchRequestKeyRef.current === key) {
      return;
    }

    prefetchRequestKeyRef.current = key;
    void (async () => {
      try {
        const prefetchedQuestion = await loadQuestion(difficultyToLoad, true);
        if (prefetchRequestKeyRef.current !== key) {
          return;
        }

        prefetchedQuestionRef.current = {
          key,
          question: prefetchedQuestion,
        };
      } catch {
        if (prefetchRequestKeyRef.current === key) {
          prefetchedQuestionRef.current = null;
        }
      }
    })();
  }, [buildPrefetchKey, loadQuestion]);

  const applyLoadedQuestion = useCallback((nextQuestion: QuestionType): void => {
    clearPrefetchedQuestion();
    setAccessDemand(null);
    setSelection([]);
    dispatchUiState({
      type: "questionApplied",
      question: nextQuestion,
      hasSubmitted: false,
    });
  }, [clearPrefetchedQuestion, setSelection]);

  useEffect(() => {
    clearPrefetchedQuestion();
  }, [clearPrefetchedQuestion, sessionId, subjectId, subcategoryId, sessionDifficulty]);

  useEffect(() => {
    let cancelled = false;

    async function initializeQuestionState() {
      dispatchUiState({ type: "initialLoadStarted" });
      try {
        const loadedQuestion = await loadQuestion(difficulty);
        if (cancelled) {
          return;
        }

        applyLoadedQuestion(loadedQuestion);
      } catch (error) {
        if (!cancelled) {
          handleDemandError(error, showLoadError);
        }
      } finally {
        if (!cancelled) {
          dispatchUiState({ type: "initialLoadFinished" });
        }
      }
    }

    initializeQuestionState();

    return () => {
      cancelled = true;
    };
  }, [
    applyLoadedQuestion,
    difficulty,
    handleDemandError,
    loadQuestion,
    showLoadError,
  ]);

  function selectOption(optionIndex: QuestionOptionIndex): QuestionOptionIndex[] | null {
    return selectQuestionOption(
      question,
      optionIndex,
      isSubmitting || hasSubmitted,
    );
  }

  async function submit(selectionOverride?: QuestionOptionIndex[] | null) {
    const currentSelection = selectionOverride ?? selectedOptionIndexes;
    if (!question || isSubmitting) {
      return;
    }

    if (!hasSubmitted && currentSelection.length === 0) {
      return;
    }

    const isCurrentAnswerCorrect = isAnswerCorrect(question, currentSelection);
    let nextDifficulty = sessionDifficulty;

    if (!hasSubmitted) {
      dispatchUiState({ type: "submissionMarked" });
      dispatchUiState({ type: "submitFetchStarted" });
      try {
        const updatedSession = await recordQuestionResult(
          sessionId,
          question.id,
          isCurrentAnswerCorrect,
        );
        if (updatedSession?.difficulty) {
          nextDifficulty = updatedSession.difficulty;
        }
      } catch (error) {
        if (handleDemandError(error, (nextError) => {
          toast.error(nextError, {
            fallbackDescription: "Failed to submit answer.",
          });
        })) {
          return;
        }
        return;
      } finally {
        dispatchUiState({ type: "submitFetchFinished" });
      }

      setSessionProgress((prev) => ({
        ...prev,
        submittedCount: prev.submittedCount + 1,
        correctCount: prev.correctCount + (isCurrentAnswerCorrect ? 1 : 0),
      }));
      notifyUserPlanRefresh();
      setPendingDifficulty(nextDifficulty);
      prefetchNextQuestion(nextDifficulty);
      return;
    }

    dispatchUiState({ type: "submitFetchStarted" });
    try {
      const targetDifficulty = pendingDifficulty ?? sessionDifficulty;
      try {
        const targetKey = buildPrefetchKey(targetDifficulty);
        const prefetchedQuestion =
          prefetchedQuestionRef.current?.key === targetKey
            ? prefetchedQuestionRef.current.question
            : null;
        const loadedQuestion = prefetchedQuestion
          ? prefetchedQuestion
          : await loadQuestion(targetDifficulty, true);
        if (targetDifficulty !== sessionDifficulty) {
          setSessionDifficulty(targetDifficulty);
        }
        setPendingDifficulty(null);
        applyLoadedQuestion(loadedQuestion);
      } catch (error) {
        clearPrefetchedQuestion();
        if (handleDemandError(error, showLoadError)) {
          return;
        }
      }
    } finally {
      dispatchUiState({ type: "submitFetchFinished" });
    }
  }

  const isAccessBlocked = accessDemand !== null;
  return {
    question,
    isLoadingQuestion,
    isSubmitting,
    difficulty: sessionDifficulty,
    submittedCount: sessionProgress.submittedCount,
    correctCount: sessionProgress.correctCount,
    isAccessBlocked,
    accessDemand,
    hasSubmitted,
    selectedOptionIndexes,
    selectOption,
    submit,
  };
}
