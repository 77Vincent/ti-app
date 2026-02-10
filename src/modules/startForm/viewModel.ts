import { DIFFICULTIES } from "@/lib/meta";
import type { DifficultyEnum } from "@/lib/meta";
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
  selectedDifficulty: DifficultyEnum | null;
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
  };

  return stepConfigByStep[input.currentStep];
}
