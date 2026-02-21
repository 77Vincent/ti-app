"use client";

import {
  getSubjectIcon,
  sortByOrder,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import { toast } from "@/lib/toast";
import type {
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import { PAGE_PATHS } from "@/lib/config/paths";
import { writeTestSession } from "@/app/test/run/questionRunner/session/storage";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { createElement, useMemo, useState } from "react";
import {
  DEFAULT_TEST_DIFFICULTY,
  START_FORM_STEP_TITLES,
} from "./constants";

export default function StartForm() {
  const router = useRouter();
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectEnum | null>(null);
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

  const currentStep = selectedSubjectId ? "subcategory" : "subject";

  const handleSelectSubject = (subjectId: SubjectEnum) =>
    setSelectedSubjectId(subjectId);

  const handleSelectSubcategory = (subcategoryId: SubcategoryEnum) => {
    if (!selectedSubjectId) {
      return;
    }

    const testSession = {
      subjectId: selectedSubjectId,
      subcategoryId,
      difficulty: DEFAULT_TEST_DIFFICULTY,
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

  function renderStepOptions() {
    switch (currentStep) {
      case "subject":
        return subjects.map((subject) => {
          const Icon = getSubjectIcon(subject.id);

          return (
            <Button
              color="primary"
              size="lg"
              variant="bordered"
              key={subject.id}
              onPress={() => handleSelectSubject(subject.id)}
              startContent={createElement(Icon, { "aria-hidden": true, size: 18 })}
            >
              {subject.label}
            </Button>
          );
        });
      case "subcategory":
        return subcategories.map((subcategory) => (
          <Button
            color="primary"
            size="lg"
            variant="bordered"
            key={subcategory.id}
            onPress={() => handleSelectSubcategory(subcategory.id)}
          >
            {subcategory.label}
          </Button>
        ));
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
