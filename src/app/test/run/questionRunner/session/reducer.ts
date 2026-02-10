import type { Question } from "../types";

export type QuestionSessionUiState = {
  question: Question | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  hasSubmitted: boolean;
};

export const INITIAL_QUESTION_SESSION_UI_STATE: QuestionSessionUiState = {
  question: null,
  isLoadingQuestion: true,
  isSubmitting: false,
  hasSubmitted: false,
};

export type QuestionSessionUiAction =
  | { type: "initialLoadStarted" }
  | { type: "initialLoadFinished" }
  | { type: "questionApplied"; question: Question }
  | { type: "submissionMarked" }
  | { type: "submitFetchStarted" }
  | { type: "submitFetchFinished" };

export function questionSessionUiReducer(
  state: QuestionSessionUiState,
  action: QuestionSessionUiAction,
): QuestionSessionUiState {
  switch (action.type) {
    case "initialLoadStarted":
      return {
        ...state,
        isLoadingQuestion: true,
      };
    case "initialLoadFinished":
      return {
        ...state,
        isLoadingQuestion: false,
      };
    case "questionApplied":
      return {
        ...state,
        question: action.question,
        hasSubmitted: false,
      };
    case "submissionMarked":
      return {
        ...state,
        hasSubmitted: true,
      };
    case "submitFetchStarted":
      return {
        ...state,
        isSubmitting: true,
      };
    case "submitFetchFinished":
      return {
        ...state,
        isSubmitting: false,
      };
    default:
      return state;
  }
}
