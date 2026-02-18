"use client";

import {
  getDifficultyIcon,
  getSubjectIcon,
  sortByOrder,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import { toast } from "@/lib/toast";
import type {
  DifficultyEnum,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import { PAGE_PATHS } from "@/lib/config/paths";
import { writeTestSession } from "@/app/test/run/questionRunner/session/storage";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { createElement, useMemo, useState } from "react";
import { START_FORM_STEP_TITLES } from "./constants";
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
} from "./viewModel";

export default function StartForm() {
  const router = useRouter();
  const [state, setState] = useState<StartFormState>(INITIAL_START_FORM_STATE);
  const {
    selectedSubjectId,
    selectedSubcategoryId,
    selectedDifficulty,
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

  const handleSelectSubject = (subjectId: SubjectEnum) =>
    setState(selectSubject(subjectId));

  const handleSelectSubcategory = (subcategoryId: SubcategoryEnum) =>
    setState((prevState) => selectSubcategory(prevState, subcategoryId));

  const handleSelectDifficulty = (difficulty: DifficultyEnum) => {
    setState((prevState) => selectDifficulty(prevState, difficulty));

    if (!selectedSubjectId || !selectedSubcategoryId) {
      return;
    }

    const testSession = {
      subjectId: selectedSubjectId,
      subcategoryId: selectedSubcategoryId,
      difficulty,
    };

    void writeTestSession(testSession)
      .then(() => {
        toast.success("Your test is starting.");
        router.push(PAGE_PATHS.TEST_RUN);
      })
      .catch((error) => {
        toast.error(error, {
          fallbackDescription: "Failed to start test session.",
        });
      });
  };

  const currentStepViewConfig = buildCurrentStepViewConfig({
    currentStep,
    subjects,
    subcategories,
    selectedSubjectId,
    selectedSubcategoryId,
    selectedDifficulty,
  });

  function renderStepOptions() {
    switch (currentStepViewConfig.step) {
      case "subject":
        return currentStepViewConfig.options.map((option) => {
          const Icon = getSubjectIcon(option.value);

          return (
            <Button
              color="primary"
              size="lg"
              variant="bordered"
              key={option.value}
              onPress={() => handleSelectSubject(option.value)}
              startContent={createElement(Icon, { "aria-hidden": true, size: 18 })}
            >
              {option.label}
            </Button>
          );
        });
      case "subcategory":
        return currentStepViewConfig.options.map((option) => (
          <Button
            color="primary"
            size="lg"
            variant="bordered"
            key={option.value}
            onPress={() => handleSelectSubcategory(option.value)}
          >
            {option.label}
          </Button>
        ));
      case "difficulty":
        return currentStepViewConfig.options.map((option) => {
          const Icon = getDifficultyIcon(option.value);

          return (
            <Button
              color="primary"
              size="lg"
              variant="bordered"
              key={option.value}
              onPress={() => handleSelectDifficulty(option.value)}
              startContent={createElement(Icon, { "aria-hidden": true, size: 18 })}
            >
              {option.label}
            </Button>
          );
        });
    }
  }

  return (
    <Card shadow="sm" className="w-full max-w-2xl self-start">
      <CardHeader className="pt-6">
        <h1 className="mx-auto text-3xl font-medium">
          {START_FORM_STEP_TITLES[currentStep]}
        </h1>
      </CardHeader>

      <CardBody className="p-6 pt-4">
        <div className="flex flex-wrap gap-2 items-center justify-center">{renderStepOptions()}</div>
      </CardBody>
    </Card>
  );
}
