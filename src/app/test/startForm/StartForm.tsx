"use client";

import {
  getDifficultyIcon,
  getGoalIcon,
  getSubjectIcon,
  sortByOrder,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import { toast } from "@/lib/toast";
import type { DifficultyEnum, GoalEnum, SubjectEnum } from "@/lib/meta";
import { writeTestSession } from "@/app/test/run/questionRunner/session";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { createElement, useMemo, useState } from "react";
import { START_FORM_STEP_TITLES } from "./constants";
import type { StartFormStep } from "./constants";
import {
  getCurrentStartFormStep,
} from "./utils";
import {
  INITIAL_START_FORM_STATE,
  selectDifficulty,
  selectGoal,
  selectSubcategory,
  selectSubject,
} from "./state";
import type { StartFormState } from "./state";
import {
  buildCurrentStepViewConfig,
  type StepOptionValue,
} from "./viewModel";

export default function StartForm() {
  const router = useRouter();
  const [state, setState] = useState<StartFormState>(INITIAL_START_FORM_STATE);
  const {
    selectedSubjectId,
    selectedSubcategoryId,
    selectedDifficulty,
    selectedGoal,
  } = state;
  const subjects = useMemo(() => sortByOrder(SUBJECTS), []);

  const subcategories = useMemo(() => {
    if (!selectedSubjectId) {
      return [];
    }

    return sortByOrder(
      SUBCATEGORIES.filter(
        (subcategory) => subcategory.subjectId === selectedSubjectId,
      ),
    );
  }, [selectedSubjectId]);

  const currentStep = getCurrentStartFormStep(state);

  const handleSelectSubject = (subjectId: string) =>
    setState(selectSubject(subjectId));

  const handleSelectSubcategory = (subcategoryId: string) =>
    setState((prevState) => selectSubcategory(prevState, subcategoryId));

  const handleSelectDifficulty = (difficulty: DifficultyEnum) => {
    setState((prevState) => selectDifficulty(prevState, difficulty));
  };

  const handleSelectGoal = (goal: GoalEnum) => {
    setState((prevState) => selectGoal(prevState, goal));

    if (!selectedSubjectId || !selectedSubcategoryId || !selectedDifficulty) {
      return;
    }

    const testSession = {
      subjectId: selectedSubjectId,
      subcategoryId: selectedSubcategoryId,
      difficulty: selectedDifficulty,
      goal,
    };

    void writeTestSession(testSession)
      .then(() => {
        router.push("/test/run");
      })
      .catch((error) => {
        toast.error(error, {
          fallbackDescription: "Failed to start test session.",
        });
      });
  };

  const onSelectByStep: Record<StartFormStep, (value: StepOptionValue) => void> = {
    subject: (value) => handleSelectSubject(String(value)),
    subcategory: (value) => handleSelectSubcategory(String(value)),
    difficulty: (value) => handleSelectDifficulty(String(value) as DifficultyEnum),
    goal: (value) => handleSelectGoal(String(value) as GoalEnum),
  };

  const currentStepViewConfig = buildCurrentStepViewConfig({
    currentStep,
    subjects,
    subcategories,
    selectedSubjectId,
    selectedSubcategoryId,
    selectedDifficulty,
    selectedGoal,
  });
  const isSubjectStep = currentStep === "subject";
  const isDifficultyStep = currentStep === "difficulty";
  const isGoalStep = currentStep === "goal";

  return (
    <Card shadow="sm" className="w-full max-w-xl self-start">
      <CardHeader className="pt-6">
        <h1 className="mx-auto text-2xl font-medium">
          {START_FORM_STEP_TITLES[currentStep]}
        </h1>
      </CardHeader>

      <CardBody className="p-6 pt-2">
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {currentStepViewConfig.options.map((option) => {
            const optionValue = String(option.value);
            const SubjectIcon = isSubjectStep
              ? getSubjectIcon(optionValue as SubjectEnum)
              : null;
            const DifficultyIcon = isDifficultyStep
              ? getDifficultyIcon(optionValue as DifficultyEnum)
              : null;
            const GoalIcon = isGoalStep
              ? getGoalIcon(optionValue as GoalEnum)
              : null;
            const OptionIcon = SubjectIcon ?? DifficultyIcon ?? GoalIcon;

            return (
              <Button
                key={option.value}
                onPress={() => onSelectByStep[currentStep](option.value)}
                startContent={
                  OptionIcon
                    ? createElement(OptionIcon, { "aria-hidden": true, size: 16 })
                    : undefined
                }
                variant={
                  currentStepViewConfig.selectedValue === option.value
                    ? "solid"
                    : "bordered"
                }
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
