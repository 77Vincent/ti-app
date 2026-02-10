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
    default:
      return "difficulty";
  }
}
