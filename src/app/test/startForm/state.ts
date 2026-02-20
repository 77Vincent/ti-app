import type { StartFormSelectionState } from "./constants";

export type StartFormState = StartFormSelectionState;

export const INITIAL_START_FORM_STATE: StartFormState = {
  selectedSubjectId: null,
  selectedSubcategoryId: null,
};

export function selectSubject(
  subjectId: NonNullable<StartFormSelectionState["selectedSubjectId"]>,
): StartFormState {
  return {
    ...INITIAL_START_FORM_STATE,
    selectedSubjectId: subjectId,
  };
}

export function selectSubcategory(
  state: StartFormState,
  subcategoryId: NonNullable<StartFormSelectionState["selectedSubcategoryId"]>,
): StartFormState {
  return {
    ...state,
    selectedSubcategoryId: subcategoryId,
  };
}
