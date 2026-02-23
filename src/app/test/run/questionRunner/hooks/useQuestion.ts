"use client";

import type { SubjectEnum, SubcategoryEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  fetchQuestion,
} from "../api";
import { QuestionRunnerApiError } from "../api/error";
import { recordQuestionResult } from "../session/storage";
import type {
  Question as QuestionType,
  QuestionOptionIndex,
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
  difficulty: string;
  initialCorrectCount: number;
  initialSubmittedCount: number;
  onQuestionApplied?: () => void;
};

export type UseQuestionResult = {
  question: QuestionType | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  difficulty: string;
  currentQuestionIndex: number;
  submittedCount: number;
  correctCount: number;
  isSignInRequired: boolean;
  signInDemand: QuestionSignInDemand | null;
  hasSubmitted: boolean;
  selectedOptionIndexes: QuestionOptionIndex[];
  selectOption: (optionIndex: QuestionOptionIndex) => void;
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
  const [sessionDifficulty, setSessionDifficulty] = useState(difficulty);
  const [pendingDifficulty, setPendingDifficulty] = useState<string | null>(null);
  const [signInDemand, setSignInDemand] =
    useState<QuestionSignInDemand | null>(null);
  const [uiState, dispatchUiState] = useReducer(
    questionSessionUiReducer,
    INITIAL_QUESTION_SESSION_UI_STATE,
  );
  const { question, isLoadingQuestion, isSubmitting, hasSubmitted } = uiState;
  const { selectedOptionIndexes, setSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();
  const showLoadError = useCallback((error: unknown) => {
    toast.error(error, {
      fallbackDescription: "Failed to load question.",
    });
  }, []);

  const loadQuestion = useCallback((difficultyToLoad: string = sessionDifficulty) => {
    return fetchQuestion({
      subjectId,
      subcategoryId,
      difficulty: difficultyToLoad,
    });
  }, [sessionDifficulty, subcategoryId, subjectId]);

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
        const loadedQuestion = await fetchQuestion({
          subjectId,
          subcategoryId,
          difficulty,
        });
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
    difficulty,
    showLoadError,
    subcategoryId,
    subjectId,
  ]);

  function selectOption(optionIndex: QuestionOptionIndex) {
    selectQuestionOption(
      question,
      optionIndex,
      isSubmitting || hasSubmitted,
    );
  }

  async function submit() {
    if (
      !canSubmitQuestion({
        hasQuestion: Boolean(question),
        hasSubmitted,
        selectedOptionCount: selectedOptionIndexes.length,
        isSubmitting,
      })
    ) {
      return;
    }
    const isCurrentAnswerCorrect = isAnswerCorrect(question, selectedOptionIndexes);
    let nextDifficulty = sessionDifficulty;

    await submitQuestion({
      hasSubmitted,
      isCurrentAnswerCorrect,
      recordQuestionResult: async (isCorrect) => {
        const updatedSession = await recordQuestionResult(sessionId, isCorrect);
        if (updatedSession?.difficulty) {
          nextDifficulty = updatedSession.difficulty;
        }
      },
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
        setPendingDifficulty(nextDifficulty);
      },
      advanceToNextQuestion: async () => {
        const targetDifficulty = pendingDifficulty ?? sessionDifficulty;
        try {
          const loadedQuestion = await loadQuestion(targetDifficulty);
          if (targetDifficulty !== sessionDifficulty) {
            setSessionDifficulty(targetDifficulty);
          }
          setPendingDifficulty(null);
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
    difficulty: sessionDifficulty,
    currentQuestionIndex: sessionProgress.currentQuestionIndex,
    submittedCount: sessionProgress.submittedCount,
    correctCount: sessionProgress.correctCount,
    isSignInRequired,
    signInDemand,
    hasSubmitted,
    selectedOptionIndexes,
    selectOption,
    submit,
  };
}
