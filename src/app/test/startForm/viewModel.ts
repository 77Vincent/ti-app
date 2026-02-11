import { DIFFICULTIES, GOALS } from "@/lib/meta";
import type { DifficultyEnum, GoalEnum } from "@/lib/meta";
import type { StartFormStep } from "./constants";

type SelectOption = {
  id: string;
  label: string;
};

export type StepOptionValue = string;

export type StepOption = {
  value: StepOptionValue;
  label: string;
};

export type StartFormStepViewConfig = {
  selectedValue: StepOptionValue | null;
  options: StepOption[];
};

type BuildCurrentStepViewConfigInput = {
  currentStep: StartFormStep;
  subjects: SelectOption[];
  subcategories: SelectOption[];
  selectedSubjectId: string | null;
  selectedSubcategoryId: string | null;
  selectedDifficulty: DifficultyEnum | null;
  selectedGoal: GoalEnum | null;
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
    difficulty: DIFFICULTIES.map((difficulty) => ({
      value: difficulty.id,
      label: difficulty.label,
    })),
    goal: GOALS.map((goal) => ({
      value: goal.id,
      label: goal.label,
    })),
  };

  const stepConfigByStep: Record<StartFormStep, StartFormStepViewConfig> = {
    subject: {
      selectedValue: input.selectedSubjectId,
      options: stepOptionsByStep.subject,
    },
    subcategory: {
      selectedValue: input.selectedSubcategoryId,
      options: stepOptionsByStep.subcategory,
    },
    difficulty: {
      selectedValue: input.selectedDifficulty,
      options: stepOptionsByStep.difficulty,
    },
    goal: {
      selectedValue: input.selectedGoal,
      options: stepOptionsByStep.goal,
    },
  };

  return stepConfigByStep[input.currentStep];
}
