import { START_FORM_STEP_TITLES } from "./constants";
import type { StartFormSelectionState, StartFormStep } from "./constants";

export function getCurrentStartFormStep(
  state: StartFormSelectionState,
): StartFormStep {
  if (!state.selectedSubjectId) {
    return "subject";
  }

  if (!state.selectedSubcategoryId) {
    return "subcategory";
  }

  if (!state.selectedDifficulty) {
    return "difficulty";
  }

  return "questionCount";
}

export function canGoBackFromStep(step: StartFormStep): boolean {
  return step !== "subject";
}

export function getStartFormTitle(step: StartFormStep): string {
  return START_FORM_STEP_TITLES[step];
}
