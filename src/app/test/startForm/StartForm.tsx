"use client";

import {
  sortByOrder,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import type { DifficultyEnum, SubjectEnum } from "@/lib/meta";
import { TEST_SESSION_STORAGE_KEY } from "@/app/test/run/questionRunner/session";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import {
  Crown,
  Flame,
  Languages,
  Leaf,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

const DIFFICULTY_ICON_BY_ID: Record<DifficultyEnum, LucideIcon> = {
  beginner: Leaf,
  intermediate: TrendingUp,
  advanced: Flame,
  expert: Crown,
};

const SUBJECT_ICON_BY_ID: Record<SubjectEnum, LucideIcon> = {
  language: Languages,
};

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

  const handleSelectSubject = (subjectId: string) =>
    setState(selectSubject(subjectId));

  const handleSelectSubcategory = (subcategoryId: string) =>
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

    try {
      sessionStorage.setItem(
        TEST_SESSION_STORAGE_KEY,
        JSON.stringify(testSession),
      );
    } catch {
      // Ignore sessionStorage write errors (e.g. private mode/storage denied).
    }

    router.push("/test/run");
  };

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
  const isSubjectStep = currentStep === "subject";
  const isDifficultyStep = currentStep === "difficulty";

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
            const SubjectIcon = isSubjectStep
              ? SUBJECT_ICON_BY_ID[option.value as SubjectEnum]
              : null;
            const DifficultyIcon = isDifficultyStep
              ? DIFFICULTY_ICON_BY_ID[option.value as DifficultyEnum]
              : null;
            const OptionIcon = SubjectIcon ?? DifficultyIcon;

            return (
              <Button
                key={option.value}
                onPress={() => onSelectByStep[currentStep](option.value)}
                startContent={OptionIcon ? <OptionIcon aria-hidden size={16} /> : undefined}
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
