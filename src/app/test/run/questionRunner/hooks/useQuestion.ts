"use client";

import type {
  DifficultyEnum,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  fetchQuestion,
} from "../api";
import { QuestionRunnerApiError } from "../api/error";
import { recordQuestionResult } from "../session/storage";
import type {
  Question as QuestionType,
  QuestionOptionId,
  QuestionSignInDemand,
} from "../types";
import { submitQuestion } from "@/lib/testSession/service/questionSubmit";
import {
  INITIAL_QUESTION_SESSION_UI_STATE,
  questionSessionUiReducer,
} from "../session/reducer";
import {
  canSubmitQuestion,
} from "../utils/questionGuards";
import { isAnswerCorrect } from "../utils/evaluation";
import { useQuestionSelection } from "./useQuestionSelection";

export type UseQuestionInput = {
  sessionId: string;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: DifficultyEnum;
  initialCorrectCount: number;
  initialSubmittedCount: number;
  onQuestionApplied?: () => void;
};

export type UseQuestionResult = {
  question: QuestionType | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  currentQuestionIndex: number;
  submittedCount: number;
  correctCount: number;
  isSignInRequired: boolean;
  signInDemand: QuestionSignInDemand | null;
  hasSubmitted: boolean;
  selectedOptionIds: QuestionOptionId[];
  selectOption: (optionId: QuestionOptionId) => void;
  submit: () => Promise<void>;
};

export function useQuestion({
  sessionId,
  subjectId,
  subcategoryId,
  difficulty,
  initialCorrectCount,
  initialSubmittedCount,
  onQuestionApplied,
}: UseQuestionInput): UseQuestionResult {
  const [sessionProgress, setSessionProgress] = useState(
    () => ({
      currentQuestionIndex: initialSubmittedCount,
      submittedCount: initialSubmittedCount,
      correctCount: initialCorrectCount,
    }),
  );
  const [signInDemand, setSignInDemand] =
    useState<QuestionSignInDemand | null>(null);
  const [uiState, dispatchUiState] = useReducer(
    questionSessionUiReducer,
    INITIAL_QUESTION_SESSION_UI_STATE,
  );
  const { question, isLoadingQuestion, isSubmitting, hasSubmitted } = uiState;
  const { selectedOptionIds, setSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();
  const showLoadError = useCallback((error: unknown) => {
    toast.error(error, {
      fallbackDescription: "Failed to load question.",
    });
  }, []);

  const loadQuestion = useCallback(() => {
    return fetchQuestion({
      subjectId,
      subcategoryId,
      difficulty,
    });
  }, [difficulty, subcategoryId, subjectId]);

  const loadOneQuestion = useCallback((): Promise<QuestionType> => {
    return loadQuestion();
  }, [loadQuestion]);

  const applyLoadedQuestion = useCallback(
    (
      nextQuestion: QuestionType,
      options?: {
        incrementQuestionIndex?: boolean;
      },
    ): boolean => {
      setSignInDemand(null);
      setSelection([]);
      dispatchUiState({
        type: "questionApplied",
        question: nextQuestion,
        hasSubmitted: false,
      });
      if (options?.incrementQuestionIndex) {
        setSessionProgress((prev) => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
      }
      onQuestionApplied?.();
      return true;
    },
    [onQuestionApplied, setSelection],
  );

  useEffect(() => {
    let cancelled = false;

    async function initializeQuestionState() {
      dispatchUiState({ type: "initialLoadStarted" });
      try {
        const loadedQuestion = await loadOneQuestion();
        if (cancelled) {
          return;
        }

        applyLoadedQuestion(loadedQuestion);
      } catch (error) {
        if (!cancelled) {
          showLoadError(error);
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
    loadOneQuestion,
    showLoadError,
  ]);

  function selectOption(optionId: QuestionOptionId) {
    selectQuestionOption(
      question,
      optionId,
      isSubmitting || hasSubmitted,
    );
  }

  async function submit() {
    if (
      !canSubmitQuestion({
        hasQuestion: Boolean(question),
        hasSubmitted,
        selectedOptionCount: selectedOptionIds.length,
        isSubmitting,
      })
    ) {
      return;
    }
    const isCurrentAnswerCorrect = isAnswerCorrect(question, selectedOptionIds);

    await submitQuestion({
      hasSubmitted,
      isCurrentAnswerCorrect,
      recordQuestionResult: (isCorrect) =>
        recordQuestionResult(sessionId, isCorrect),
      onSubmitRequestStarted: () => {
        dispatchUiState({ type: "submitFetchStarted" });
      },
      onSubmitRequestFinished: () => {
        dispatchUiState({ type: "submitFetchFinished" });
      },
      isQuestionLimitError: (error) =>
        error instanceof QuestionRunnerApiError && error.status === 403,
      onQuestionLimitReached: () => {
        setSignInDemand("more_questions");
      },
      onError: (error) => {
        toast.error(error, {
          fallbackDescription: "Failed to submit answer.",
        });
      },
      onSubmissionMarked: () => {
        dispatchUiState({ type: "submissionMarked" });
      },
      persistSubmission: () => {
        setSessionProgress((prev) => ({
          ...prev,
          submittedCount: prev.submittedCount + 1,
          correctCount:
            prev.correctCount + (isCurrentAnswerCorrect ? 1 : 0),
        }));
      },
      advanceToNextQuestion: async () => {
        try {
          const loadedQuestion = await loadOneQuestion();
          applyLoadedQuestion(loadedQuestion, { incrementQuestionIndex: true });
        } catch (error) {
          showLoadError(error);
        }
      },
      onNextQuestionLoadStarted: () => {
        dispatchUiState({ type: "submitFetchStarted" });
      },
      onNextQuestionLoadFinished: () => {
        dispatchUiState({ type: "submitFetchFinished" });
      },
    });
  }

  const isSignInRequired = signInDemand !== null;
  return {
    question,
    isLoadingQuestion,
    isSubmitting,
    currentQuestionIndex: sessionProgress.currentQuestionIndex,
    submittedCount: sessionProgress.submittedCount,
    correctCount: sessionProgress.correctCount,
    isSignInRequired,
    signInDemand,
    hasSubmitted,
    selectedOptionIds,
    selectOption,
    submit,
  };
}
