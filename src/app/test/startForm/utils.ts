import type { StartFormSelectionState, StartFormStep } from "./constants";

export function getCurrentStartFormStep(
  state: StartFormSelectionState,
): StartFormStep {
  return state.selectedSubjectId ? "subcategory" : "subject";
}
