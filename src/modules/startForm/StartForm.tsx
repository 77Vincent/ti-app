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
import type { QuestionCountOption, TimeLimitOption } from "./constants";
import {
  canGoBackFromStep,
  getCurrentStartFormStep,
  getStartFormTitle,
} from "./utils";

export default function StartForm() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(
    null,
  );
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<QuestionCountOption | null>(null);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState<TimeLimitOption | null>(null);
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
  const isSubjectStep = currentStep === "subject";
  const isSubcategoryStep = currentStep === "subcategory";
  const isDifficultyStep = currentStep === "difficulty";
  const isQuestionCountStep = currentStep === "questionCount";
  const isTimeLimitStep = currentStep === "timeLimit";
  const canGoBack = canGoBackFromStep(currentStep);

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedSubcategoryId(null);
    setSelectedDifficulty(null);
    setSelectedQuestionCount(null);
    setSelectedTimeLimit(null);
  };

  const handleSelectSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setSelectedDifficulty(null);
    setSelectedQuestionCount(null);
    setSelectedTimeLimit(null);
  };

  const handleSelectDifficulty = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
    setSelectedQuestionCount(null);
    setSelectedTimeLimit(null);
  };

  const handleSelectQuestionCount = (questionCount: QuestionCountOption) => {
    setSelectedQuestionCount(questionCount);
    setSelectedTimeLimit(null);
  };

  const handleGoBack = () => {
    if (currentStep === "timeLimit") {
      setSelectedQuestionCount(null);
      setSelectedTimeLimit(null);
      return;
    }

    if (currentStep === "questionCount") {
      setSelectedDifficulty(null);
      setSelectedQuestionCount(null);
      setSelectedTimeLimit(null);
      return;
    }

    if (currentStep === "difficulty") {
      setSelectedSubcategoryId(null);
      setSelectedDifficulty(null);
      setSelectedQuestionCount(null);
      setSelectedTimeLimit(null);
      return;
    }

    if (currentStep === "subcategory") {
      setSelectedSubjectId(null);
      setSelectedSubcategoryId(null);
      setSelectedDifficulty(null);
      setSelectedQuestionCount(null);
      setSelectedTimeLimit(null);
    }
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

          <h1 className="text-2xl font-medium text-center">
            {getStartFormTitle(currentStep)}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {isSubjectStep &&
            subjects.map((subject) => (
              <button
                className="btn btn-primary btn-outline btn-sm"
                key={subject.id}
                onClick={() => handleSelectSubject(subject.id)}
                type="button"
              >
                {subject.label}
              </button>
            ))}

          {isSubcategoryStep &&
            subcategories.map((subcategory) => (
              <button
                className="btn btn-secondary btn-outline btn-sm"
                key={subcategory.id}
                onClick={() => handleSelectSubcategory(subcategory.id)}
                type="button"
              >
                {subcategory.label}
              </button>
            ))}

          {isDifficultyStep &&
            DIFFICULTY_OPTIONS.map((difficulty) => (
              <button
                className={`btn btn-accent btn-outline btn-sm ${
                  selectedDifficulty === difficulty.id ? "btn-active" : ""
                }`}
                key={difficulty.id}
                onClick={() => handleSelectDifficulty(difficulty.id)}
                type="button"
              >
                {difficulty.label}
              </button>
            ))}

          {isQuestionCountStep &&
            QUESTION_COUNT_OPTIONS.map((questionCount) => (
              <button
                className={`btn btn-info btn-outline btn-sm ${
                  selectedQuestionCount === questionCount.value ? "btn-active" : ""
                }`}
                key={questionCount.value}
                onClick={() => handleSelectQuestionCount(questionCount.value)}
                type="button"
              >
                {questionCount.value === INFINITE_QUESTION_COUNT ? (
                  <InfinityIcon aria-label={questionCount.label} className="h-4 w-4" />
                ) : (
                  questionCount.label
                )}
              </button>
            ))}

          {isTimeLimitStep &&
            TIME_LIMIT_OPTIONS.map((timeLimit) => (
              <button
                className={`btn btn-success btn-outline btn-sm ${
                  selectedTimeLimit === timeLimit.value ? "btn-active" : ""
                }`}
                key={timeLimit.value}
                onClick={() => setSelectedTimeLimit(timeLimit.value)}
                type="button"
              >
                {timeLimit.value === INFINITE_TIME_LIMIT_MINUTES ? (
                  <InfinityIcon aria-label={timeLimit.label} className="h-4 w-4" />
                ) : (
                  timeLimit.label
                )}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
