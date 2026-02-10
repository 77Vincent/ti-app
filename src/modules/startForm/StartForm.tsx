"use client";

import {
  getOrderedSubcategories,
  getOrderedSubjects,
} from "@/lib/meta";
import type { DifficultyLevel } from "@/lib/meta";
import { ArrowLeft, InfinityIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  QuestionCountOption,
  StartFormStep,
  TimeLimitOption,
} from "./constants";
import {
  canGoBackFromStep,
  getCurrentStartFormStep,
  getStartFormTitle,
} from "./utils";
import {
  goBack,
  INITIAL_START_FORM_STATE,
  selectDifficulty,
  selectQuestionCount,
  selectSubcategory,
  selectSubject,
  selectTimeLimit,
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
    selectedQuestionCount,
    selectedTimeLimit,
  } = state;
  const subjects = useMemo(() => getOrderedSubjects(), []);

  const subcategories = useMemo(() => {
    if (!selectedSubjectId) {
      return [];
    }

    return getOrderedSubcategories(selectedSubjectId);
  }, [selectedSubjectId]);

  const currentStep = getCurrentStartFormStep(state);
  const canGoBack = canGoBackFromStep(currentStep);

  const handleSelectSubject = (subjectId: string) =>
    setState(selectSubject(subjectId));

  const handleSelectSubcategory = (subcategoryId: string) =>
    setState((prevState) => selectSubcategory(prevState, subcategoryId));

  const handleSelectDifficulty = (difficulty: DifficultyLevel) =>
    setState((prevState) => selectDifficulty(prevState, difficulty));

  const handleSelectQuestionCount = (questionCount: QuestionCountOption) =>
    setState((prevState) => selectQuestionCount(prevState, questionCount));

  const handleSelectTimeLimit = (timeLimit: TimeLimitOption) =>
    setState((prevState) => selectTimeLimit(prevState, timeLimit));

  const onSelectByStep: Record<StartFormStep, (value: StepOptionValue) => void> = {
    subject: (value) => handleSelectSubject(String(value)),
    subcategory: (value) => handleSelectSubcategory(String(value)),
    difficulty: (value) => handleSelectDifficulty(String(value) as DifficultyLevel),
    questionCount: (value) => handleSelectQuestionCount(Number(value)),
    timeLimit: (value) => handleSelectTimeLimit(Number(value)),
  };

  const currentStepViewConfig = buildCurrentStepViewConfig({
    currentStep,
    subjects,
    subcategories,
    selectedSubjectId,
    selectedSubcategoryId,
    selectedDifficulty,
    selectedQuestionCount,
    selectedTimeLimit,
  });

  const handleGoBack = () => setState((prevState) => goBack(prevState));

  return (
    <div className="card bg-base-100 shadow-sm my-auto">
      <div className="card-body">
        <div className="relative flex items-center justify-center">
          {canGoBack && (
            <button
              aria-label="Go back"
              className="btn btn-ghost btn-circle btn-sm absolute left-0"
              onClick={handleGoBack}
              type="button"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          )}

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
              {option.showInfinityIcon ? (
                <InfinityIcon aria-label={option.label} className="h-4 w-4" />
              ) : (
                option.label
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
