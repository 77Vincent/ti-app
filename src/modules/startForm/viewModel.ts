import { DIFFICULTY_OPTIONS } from "@/lib/meta";
import type { DifficultyLevel } from "@/lib/meta";
import {
  INFINITE_QUESTION_COUNT,
  INFINITE_TIME_LIMIT_MINUTES,
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
} from "./constants";
import type { QuestionCountOption, StartFormStep, TimeLimitOption } from "./constants";

type SelectOption = {
  id: string;
  label: string;
};

export type StepOptionValue = string | number;

export type StepOption = {
  value: StepOptionValue;
  label: string;
  showInfinityIcon?: boolean;
};

export type StartFormStepViewConfig = {
  buttonClassName: string;
  selectedValue: StepOptionValue | null;
  options: StepOption[];
};

type BuildCurrentStepViewConfigInput = {
  currentStep: StartFormStep;
  subjects: SelectOption[];
  subcategories: SelectOption[];
  selectedSubjectId: string | null;
  selectedSubcategoryId: string | null;
  selectedDifficulty: DifficultyLevel | null;
  selectedQuestionCount: QuestionCountOption | null;
  selectedTimeLimit: TimeLimitOption | null;
};

export function buildCurrentStepViewConfig(
  input: BuildCurrentStepViewConfigInput,
): StartFormStepViewConfig {
  const stepOptionsByStep: Record<StartFormStep, StepOption[]> = {
    subject: input.subjects.map((subject) => ({
      value: subject.id,
      label: subject.label,
    })),
    subcategory: input.subcategories.map((subcategory) => ({
      value: subcategory.id,
      label: subcategory.label,
    })),
    difficulty: DIFFICULTY_OPTIONS.map((difficulty) => ({
      value: difficulty.id,
      label: difficulty.label,
    })),
    questionCount: QUESTION_COUNT_OPTIONS.map((questionCount) => ({
      value: questionCount.value,
      label: questionCount.label,
      showInfinityIcon: questionCount.value === INFINITE_QUESTION_COUNT,
    })),
    timeLimit: TIME_LIMIT_OPTIONS.map((timeLimit) => ({
      value: timeLimit.value,
      label: timeLimit.label,
      showInfinityIcon: timeLimit.value === INFINITE_TIME_LIMIT_MINUTES,
    })),
  };

  const stepConfigByStep: Record<StartFormStep, StartFormStepViewConfig> = {
    subject: {
      buttonClassName: "btn-primary",
      selectedValue: input.selectedSubjectId,
      options: stepOptionsByStep.subject,
    },
    subcategory: {
      buttonClassName: "btn-secondary",
      selectedValue: input.selectedSubcategoryId,
      options: stepOptionsByStep.subcategory,
    },
    difficulty: {
      buttonClassName: "btn-accent",
      selectedValue: input.selectedDifficulty,
      options: stepOptionsByStep.difficulty,
    },
    questionCount: {
      buttonClassName: "btn-info",
      selectedValue: input.selectedQuestionCount,
      options: stepOptionsByStep.questionCount,
    },
    timeLimit: {
      buttonClassName: "btn-success",
      selectedValue: input.selectedTimeLimit,
      options: stepOptionsByStep.timeLimit,
    },
  };

  return stepConfigByStep[input.currentStep];
}
