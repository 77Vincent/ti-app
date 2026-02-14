"use client";

import { useCallback, useState } from "react";
import { localTestSessionService } from "@/lib/testSession/service/browserLocalSession";
import type { LocalTestSessionQuestionState } from "@/lib/testSession/core";
import type { Question, QuestionOptionId } from "../types";

type UseQuestionHistoryInput = {
  sessionId: string;
  onQuestionStateApplied: (questionState: LocalTestSessionQuestionState) => void;
  onQuestionApplied?: () => void;
};

type UseQuestionHistoryResult = {
  canGoToPreviousQuestion: boolean;
  restoreCurrentQuestion: () => boolean;
  pushLoadedQuestion: (question: Question) => boolean;
  goToPreviousQuestion: () => boolean;
  goToNextQuestion: () => boolean;
  persistSelection: (selectedOptionIds: QuestionOptionId[]) => void;
  persistSubmission: () => void;
};

export function useQuestionHistory({
  sessionId,
  onQuestionStateApplied,
  onQuestionApplied,
}: UseQuestionHistoryInput): UseQuestionHistoryResult {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const applyQuestionState = useCallback((questionState: LocalTestSessionQuestionState): boolean => {
    setCurrentQuestionIndex(questionState.currentQuestionIndex);
    onQuestionStateApplied(questionState);
    onQuestionApplied?.();
    return true;
  }, [onQuestionApplied, onQuestionStateApplied]);

  const restoreCurrentQuestion = useCallback((): boolean => {
    const questionState = localTestSessionService.readLocalTestSessionQuestionState(sessionId);
    if (!questionState) {
      return false;
    }

    return applyQuestionState(questionState);
  }, [applyQuestionState, sessionId]);

  const pushLoadedQuestion = useCallback((question: Question): boolean => {
    const questionState = localTestSessionService.writeLocalTestSessionQuestion(question);
    if (!questionState) {
      return false;
    }

    return applyQuestionState(questionState);
  }, [applyQuestionState]);

  const goToPreviousQuestion = useCallback((): boolean => {
    const questionState = localTestSessionService.shiftLocalTestSessionQuestion(sessionId, -1);
    if (!questionState) {
      return false;
    }

    return applyQuestionState(questionState);
  }, [applyQuestionState, sessionId]);

  const goToNextQuestion = useCallback((): boolean => {
    const questionState = localTestSessionService.shiftLocalTestSessionQuestion(sessionId, 1);
    if (!questionState) {
      return false;
    }

    return applyQuestionState(questionState);
  }, [applyQuestionState, sessionId]);

  const persistSelection = useCallback((selectedOptionIds: QuestionOptionId[]) => {
    localTestSessionService.writeLocalTestSessionQuestionSelection(sessionId, selectedOptionIds);
  }, [sessionId]);

  const persistSubmission = useCallback(() => {
    localTestSessionService.markLocalTestSessionQuestionSubmitted(sessionId);
  }, [sessionId]);

  return {
    canGoToPreviousQuestion: currentQuestionIndex > 0,
    restoreCurrentQuestion,
    pushLoadedQuestion,
    goToPreviousQuestion,
    goToNextQuestion,
    persistSelection,
    persistSubmission,
  };
}
