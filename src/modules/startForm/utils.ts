import { START_FORM_STEP_TITLES } from "./constants";
import type { StartFormSelectionState, StartFormStep } from "./constants";

export function getCurrentStartFormStep(
  state: StartFormSelectionState,
): StartFormStep {
  switch (true) {
    case !state.selectedSubjectId:
      return "subject";
    case !state.selectedSubcategoryId:
      return "subcategory";
    case !state.selectedDifficulty:
      return "difficulty";
    case !state.selectedQuestionCount:
      return "questionCount";
    default:
      return "timeLimit";
  }
}

export function canGoBackFromStep(step: StartFormStep): boolean {
  return step !== "subject";
}

export function getStartFormTitle(step: StartFormStep): string {
  return START_FORM_STEP_TITLES[step];
}
