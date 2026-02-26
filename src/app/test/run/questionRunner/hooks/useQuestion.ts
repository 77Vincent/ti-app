"use client";

import type { SubjectEnum, SubcategoryEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useReducer, useState } from "react";
import { fetchQuestion } from "../api";
import { QuestionRunnerApiError } from "../api/error";
import { recordQuestionResult } from "../session/storage";
import type {
  Question as QuestionType,
  QuestionOptionIndex,
  QuestionSignInDemand,
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
  isSignInRequired: boolean;
  signInDemand: QuestionSignInDemand | null;
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
  const [signInDemand, setSignInDemand] =
    useState<QuestionSignInDemand | null>(null);
  const [uiState, dispatchUiState] = useReducer(
    questionSessionUiReducer,
    INITIAL_QUESTION_SESSION_UI_STATE,
  );
  const { question, isLoadingQuestion, isSubmitting, hasSubmitted } = uiState;
  const { selectedOptionIndexes, setSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();
  const readQuestionLimitDemand = useCallback(
    (error: unknown): QuestionSignInDemand | null => {
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

  const applyLoadedQuestion = useCallback((nextQuestion: QuestionType): void => {
    setSignInDemand(null);
    setSelection([]);
    dispatchUiState({
      type: "questionApplied",
      question: nextQuestion,
      hasSubmitted: false,
    });
  }, [setSelection]);

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
          const questionLimitDemand = readQuestionLimitDemand(error);
          if (questionLimitDemand) {
            setSignInDemand(questionLimitDemand);
          } else {
            showLoadError(error);
          }
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
    loadQuestion,
    readQuestionLimitDemand,
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
        const questionLimitDemand = readQuestionLimitDemand(error);
        if (questionLimitDemand) {
          setSignInDemand(questionLimitDemand);
          return;
        }

        toast.error(error, {
          fallbackDescription: "Failed to submit answer.",
        });
        return;
      } finally {
        dispatchUiState({ type: "submitFetchFinished" });
      }

      setSessionProgress((prev) => ({
        ...prev,
        submittedCount: prev.submittedCount + 1,
        correctCount: prev.correctCount + (isCurrentAnswerCorrect ? 1 : 0),
      }));
      setPendingDifficulty(nextDifficulty);
      return;
    }

    dispatchUiState({ type: "submitFetchStarted" });
    try {
      const targetDifficulty = pendingDifficulty ?? sessionDifficulty;
      try {
        const loadedQuestion = await loadQuestion(targetDifficulty, true);
        if (targetDifficulty !== sessionDifficulty) {
          setSessionDifficulty(targetDifficulty);
        }
        setPendingDifficulty(null);
        applyLoadedQuestion(loadedQuestion);
      } catch (error) {
        const questionLimitDemand = readQuestionLimitDemand(error);
        if (questionLimitDemand) {
          setSignInDemand(questionLimitDemand);
          return;
        }

        showLoadError(error);
      }
    } finally {
      dispatchUiState({ type: "submitFetchFinished" });
    }
  }

  const isSignInRequired = signInDemand !== null;
  return {
    question,
    isLoadingQuestion,
    isSubmitting,
    difficulty: sessionDifficulty,
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
