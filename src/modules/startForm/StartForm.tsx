"use client";

import {
  sortByOrder,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import type { DifficultyEnum } from "@/lib/meta";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { QuestionRunner } from "@/modules/questionRunner";
import { useMemo, useState } from "react";
import { START_FORM_STEP_TITLES } from "./constants";
import type { StartFormStep } from "./constants";
import {
  getCurrentStartFormStep,
} from "./utils";
import {
  INITIAL_START_FORM_STATE,
  selectDifficulty,
  selectSubcategory,
  selectSubject,
} from "./state";
import type { StartFormState } from "./state";
import {
  buildCurrentStepViewConfig,
  type StepOptionValue,
} from "./viewModel";

export default function StartForm() {
  const [state, setState] = useState<StartFormState>(INITIAL_START_FORM_STATE);
  const {
    selectedSubjectId,
    selectedSubcategoryId,
    selectedDifficulty,
  } = state;
  const hasStarted = selectedDifficulty !== null;
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

  const handleSelectDifficulty = (difficulty: DifficultyEnum) =>
    setState((prevState) => selectDifficulty(prevState, difficulty));

  const onSelectByStep: Record<StartFormStep, (value: StepOptionValue) => void> = {
    subject: (value) => handleSelectSubject(String(value)),
    subcategory: (value) => handleSelectSubcategory(String(value)),
    difficulty: (value) => handleSelectDifficulty(String(value) as DifficultyEnum),
  };

  const currentStepViewConfig = buildCurrentStepViewConfig({
    currentStep,
    subjects,
    subcategories,
    selectedSubjectId,
    selectedSubcategoryId,
    selectedDifficulty,
  });

  if (hasStarted) {
    if (
      !selectedSubjectId ||
      !selectedSubcategoryId ||
      !selectedDifficulty
    ) {
      return null;
    }

    return (
      <QuestionRunner
        difficulty={selectedDifficulty}
        subcategoryId={selectedSubcategoryId}
        subjectId={selectedSubjectId}
      />
    );
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader className="justify-center pt-6 pb-2">
        <h1 className="text-center text-2xl font-medium">
          {START_FORM_STEP_TITLES[currentStep]}
        </h1>
      </CardHeader>

      <CardBody className="pb-6">
        <div className="flex flex-wrap gap-2">
          {currentStepViewConfig.options.map((option) => (
            <Button
              color={currentStepViewConfig.buttonColor}
              key={option.value}
              onPress={() => onSelectByStep[currentStep](option.value)}
              variant={
                currentStepViewConfig.selectedValue === option.value
                  ? "solid"
                  : "bordered"
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
