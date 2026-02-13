import { DIFFICULTIES, GOALS } from "@/lib/meta";
import type {
  DifficultyEnum,
  GoalEnum,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import type { StartFormStep } from "./constants";

type StepOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type SubjectStepViewConfig = {
  step: "subject";
  selectedValue: SubjectEnum | null;
  options: StepOption<SubjectEnum>[];
};

type SubcategoryStepViewConfig = {
  step: "subcategory";
  selectedValue: SubcategoryEnum | null;
  options: StepOption<SubcategoryEnum>[];
};

type DifficultyStepViewConfig = {
  step: "difficulty";
  selectedValue: DifficultyEnum | null;
  options: StepOption<DifficultyEnum>[];
};

type GoalStepViewConfig = {
  step: "goal";
  selectedValue: GoalEnum | null;
  options: StepOption<GoalEnum>[];
};

export type StartFormStepViewConfig =
  | SubjectStepViewConfig
  | SubcategoryStepViewConfig
  | DifficultyStepViewConfig
  | GoalStepViewConfig;

type BuildCurrentStepViewConfigInput = {
  currentStep: StartFormStep;
  subjects: Array<{ id: SubjectEnum; label: string }>;
  subcategories: Array<{ id: SubcategoryEnum; label: string }>;
  selectedSubjectId: SubjectEnum | null;
  selectedSubcategoryId: SubcategoryEnum | null;
  selectedDifficulty: DifficultyEnum | null;
  selectedGoal: GoalEnum | null;
};

export function buildCurrentStepViewConfig(
  input: BuildCurrentStepViewConfigInput,
): StartFormStepViewConfig {
  switch (input.currentStep) {
    case "subject":
      return {
        step: "subject",
        selectedValue: input.selectedSubjectId,
        options: input.subjects.map((subject) => ({
          value: subject.id,
          label: subject.label,
        })),
      };
    case "subcategory":
      return {
        step: "subcategory",
        selectedValue: input.selectedSubcategoryId,
        options: input.subcategories.map((subcategory) => ({
          value: subcategory.id,
          label: subcategory.label,
        })),
      };
    case "difficulty":
      return {
        step: "difficulty",
        selectedValue: input.selectedDifficulty,
        options: DIFFICULTIES.map((difficulty) => ({
          value: difficulty.id,
          label: difficulty.label,
        })),
      };
    case "goal":
      return {
        step: "goal",
        selectedValue: input.selectedGoal,
        options: GOALS.map((goal) => ({
          value: goal.id,
          label: goal.label,
        })),
      };
  }
}
