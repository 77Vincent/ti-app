"use client";

import {
  DIFFICULTY_OPTIONS,
  getOrderedSubcategories,
  getOrderedSubjects,
} from "@/lib/meta";
import type { DifficultyLevel } from "@/lib/meta";
import { ArrowLeft, InfinityIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  INFINITE_QUESTION_COUNT,
  INFINITE_TIME_LIMIT_MINUTES,
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
} from "./constants";
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

type StartFormState = {
  selectedSubjectId: string | null;
  selectedSubcategoryId: string | null;
  selectedDifficulty: DifficultyLevel | null;
  selectedQuestionCount: QuestionCountOption | null;
  selectedTimeLimit: TimeLimitOption | null;
};

type StepOptionValue = string | number;
type StepOption = {
  value: StepOptionValue;
  label: string;
  showInfinityIcon?: boolean;
};

type StepConfig = {
  buttonClassName: string;
  selectedValue: StepOptionValue | null;
  options: StepOption[];
  onSelect: (value: StepOptionValue) => void;
};

const INITIAL_START_FORM_STATE: StartFormState = {
  selectedSubjectId: null,
  selectedSubcategoryId: null,
  selectedDifficulty: null,
  selectedQuestionCount: null,
  selectedTimeLimit: null,
};

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

  const currentStep = getCurrentStartFormStep({
    selectedSubjectId,
    selectedSubcategoryId,
    selectedDifficulty,
    selectedQuestionCount,
  });
  const canGoBack = canGoBackFromStep(currentStep);

  const handleSelectSubject = (subjectId: string) =>
    setState({
      ...INITIAL_START_FORM_STATE,
      selectedSubjectId: subjectId,
    });

  const handleSelectSubcategory = (subcategoryId: string) =>
    setState((prevState) => ({
      ...prevState,
      selectedSubcategoryId: subcategoryId,
      selectedDifficulty: null,
      selectedQuestionCount: null,
      selectedTimeLimit: null,
    }));

  const handleSelectDifficulty = (difficulty: DifficultyLevel) =>
    setState((prevState) => ({
      ...prevState,
      selectedDifficulty: difficulty,
      selectedQuestionCount: null,
      selectedTimeLimit: null,
    }));

  const handleSelectQuestionCount = (questionCount: QuestionCountOption) =>
    setState((prevState) => ({
      ...prevState,
      selectedQuestionCount: questionCount,
      selectedTimeLimit: null,
    }));

  const handleSelectTimeLimit = (timeLimit: TimeLimitOption) =>
    setState((prevState) => ({
      ...prevState,
      selectedTimeLimit: timeLimit,
    }));

  const stepOptionsByStep: Record<StartFormStep, StepOption[]> = {
    subject: subjects.map((subject) => ({
      value: subject.id,
      label: subject.label,
    })),
    subcategory: subcategories.map((subcategory) => ({
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

  const stepConfigByStep: Record<StartFormStep, StepConfig> = {
    subject: {
      buttonClassName: "btn-primary",
      selectedValue: selectedSubjectId,
      options: stepOptionsByStep.subject,
      onSelect: (value) => handleSelectSubject(String(value)),
    },
    subcategory: {
      buttonClassName: "btn-secondary",
      selectedValue: selectedSubcategoryId,
      options: stepOptionsByStep.subcategory,
      onSelect: (value) => handleSelectSubcategory(String(value)),
    },
    difficulty: {
      buttonClassName: "btn-accent",
      selectedValue: selectedDifficulty,
      options: stepOptionsByStep.difficulty,
      onSelect: (value) => handleSelectDifficulty(String(value) as DifficultyLevel),
    },
    questionCount: {
      buttonClassName: "btn-info",
      selectedValue: selectedQuestionCount,
      options: stepOptionsByStep.questionCount,
      onSelect: (value) => handleSelectQuestionCount(Number(value)),
    },
    timeLimit: {
      buttonClassName: "btn-success",
      selectedValue: selectedTimeLimit,
      options: stepOptionsByStep.timeLimit,
      onSelect: (value) => handleSelectTimeLimit(Number(value)),
    },
  };

  const currentStepConfig = stepConfigByStep[currentStep];

  const backStateByStep: Record<StartFormStep, () => StartFormState> = {
    subject: () => INITIAL_START_FORM_STATE,
    subcategory: () => INITIAL_START_FORM_STATE,
    difficulty: () => ({
      ...INITIAL_START_FORM_STATE,
      selectedSubjectId,
    }),
    questionCount: () => ({
      ...INITIAL_START_FORM_STATE,
      selectedSubjectId,
      selectedSubcategoryId,
    }),
    timeLimit: () => ({
      ...INITIAL_START_FORM_STATE,
      selectedSubjectId,
      selectedSubcategoryId,
      selectedDifficulty,
    }),
  };

  const handleGoBack = () => {
    setState(backStateByStep[currentStep]());
  };

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
          {currentStepConfig.options.map((option) => (
            <button
              className={`btn ${currentStepConfig.buttonClassName} btn-outline btn-sm ${
                currentStepConfig.selectedValue === option.value ? "btn-active" : ""
              }`}
              key={option.value}
              onClick={() => currentStepConfig.onSelect(option.value)}
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
