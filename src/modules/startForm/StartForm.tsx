"use client";

import {
  sortByOrder,
  SUBJECT_CATALOG,
  SUBCATEGORY_CATALOG,
} from "@/lib/meta";
import type { DifficultyLevel } from "@/lib/meta";
import { QuestionRunner } from "@/modules/questionRunner";
import { useMemo, useState } from "react";
import type { StartFormStep } from "./constants";
import {
  getCurrentStartFormStep,
  getStartFormTitle,
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
  const subjects = useMemo(() => sortByOrder(SUBJECT_CATALOG), []);

  const subcategories = useMemo(() => {
    if (!selectedSubjectId) {
      return [];
    }

    return sortByOrder(
      SUBCATEGORY_CATALOG.filter(
        (subcategory) => subcategory.subjectId === selectedSubjectId,
      ),
    );
  }, [selectedSubjectId]);

  const currentStep = getCurrentStartFormStep(state);

  const handleSelectSubject = (subjectId: string) =>
    setState(selectSubject(subjectId));

  const handleSelectSubcategory = (subcategoryId: string) =>
    setState((prevState) => selectSubcategory(prevState, subcategoryId));

  const handleSelectDifficulty = (difficulty: DifficultyLevel) =>
    setState((prevState) => selectDifficulty(prevState, difficulty));

  const onSelectByStep: Record<StartFormStep, (value: StepOptionValue) => void> = {
    subject: (value) => handleSelectSubject(String(value)),
    subcategory: (value) => handleSelectSubcategory(String(value)),
    difficulty: (value) => handleSelectDifficulty(String(value) as DifficultyLevel),
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
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-medium text-center">{getStartFormTitle(currentStep)}</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentStepViewConfig.options.map((option) => (
            <button
              className={`btn ${currentStepViewConfig.buttonClassName} btn-outline btn-sm ${
                currentStepViewConfig.selectedValue === option.value ? "btn-active" : ""
              }`}
              key={option.value}
              onClick={() => onSelectByStep[currentStep](option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
