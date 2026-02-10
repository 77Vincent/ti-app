import type { StartFormSelectionState, TimeLimitOption } from "./constants";

export type StartFormState = StartFormSelectionState & {
  selectedTimeLimit: TimeLimitOption | null;
};

export const INITIAL_START_FORM_STATE: StartFormState = {
  selectedSubjectId: null,
  selectedSubcategoryId: null,
  selectedDifficulty: null,
  selectedQuestionCount: null,
  selectedTimeLimit: null,
};

export function selectSubject(subjectId: string): StartFormState {
  return {
    ...INITIAL_START_FORM_STATE,
    selectedSubjectId: subjectId,
  };
}

export function selectSubcategory(
  state: StartFormState,
  subcategoryId: string,
): StartFormState {
  return {
    ...state,
    selectedSubcategoryId: subcategoryId,
    selectedDifficulty: null,
    selectedQuestionCount: null,
    selectedTimeLimit: null,
  };
}

export function selectDifficulty(
  state: StartFormState,
  difficulty: StartFormSelectionState["selectedDifficulty"],
): StartFormState {
  return {
    ...state,
    selectedDifficulty: difficulty,
    selectedQuestionCount: null,
    selectedTimeLimit: null,
  };
}

export function selectQuestionCount(
  state: StartFormState,
  questionCount: StartFormSelectionState["selectedQuestionCount"],
): StartFormState {
  return {
    ...state,
    selectedQuestionCount: questionCount,
    selectedTimeLimit: null,
  };
}

export function selectTimeLimit(
  state: StartFormState,
  timeLimit: TimeLimitOption,
): StartFormState {
  return {
    ...state,
    selectedTimeLimit: timeLimit,
  };
}
