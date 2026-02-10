import type { DifficultyLevel } from "@/lib/meta";
import type { QuestionCountOption, TimeLimitOption } from "./constants";
import { getCurrentStartFormStep } from "./utils";

export type StartFormState = {
  selectedSubjectId: string | null;
  selectedSubcategoryId: string | null;
  selectedDifficulty: DifficultyLevel | null;
  selectedQuestionCount: QuestionCountOption | null;
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
  difficulty: DifficultyLevel,
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
  questionCount: QuestionCountOption,
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

export function goBack(state: StartFormState): StartFormState {
  const currentStep = getCurrentStartFormStep(state);

  switch (currentStep) {
    case "timeLimit":
      return {
        ...INITIAL_START_FORM_STATE,
        selectedSubjectId: state.selectedSubjectId,
        selectedSubcategoryId: state.selectedSubcategoryId,
        selectedDifficulty: state.selectedDifficulty,
      };
    case "questionCount":
      return {
        ...INITIAL_START_FORM_STATE,
        selectedSubjectId: state.selectedSubjectId,
        selectedSubcategoryId: state.selectedSubcategoryId,
      };
    case "difficulty":
      return {
        ...INITIAL_START_FORM_STATE,
        selectedSubjectId: state.selectedSubjectId,
      };
    case "subcategory":
      return INITIAL_START_FORM_STATE;
    default:
      return INITIAL_START_FORM_STATE;
  }
}
