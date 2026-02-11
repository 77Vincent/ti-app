import type { StartFormSelectionState } from "./constants";

export type StartFormState = StartFormSelectionState;

export const INITIAL_START_FORM_STATE: StartFormState = {
  selectedSubjectId: null,
  selectedSubcategoryId: null,
  selectedDifficulty: null,
  selectedGoal: null,
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
  subcategoryId: string,
): StartFormState {
  return {
    ...state,
    selectedSubcategoryId: subcategoryId,
    selectedDifficulty: null,
    selectedGoal: null,
  };
}

export function selectDifficulty(
  state: StartFormState,
  difficulty: StartFormSelectionState["selectedDifficulty"],
): StartFormState {
  return {
    ...state,
    selectedDifficulty: difficulty,
    selectedGoal: null,
  };
}

export function selectGoal(
  state: StartFormState,
  goal: StartFormSelectionState["selectedGoal"],
): StartFormState {
  return {
    ...state,
    selectedGoal: goal,
  };
}
