import type { StartFormSelectionState } from "./constants";

export type StartFormState = StartFormSelectionState;

export const INITIAL_START_FORM_STATE: StartFormState = {
  selectedSubjectId: null,
  selectedSubcategoryId: null,
  selectedDifficulty: null,
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
  };
}

export function selectDifficulty(
  state: StartFormState,
  difficulty: StartFormSelectionState["selectedDifficulty"],
): StartFormState {
  return {
    ...state,
    selectedDifficulty: difficulty,
  };
}
