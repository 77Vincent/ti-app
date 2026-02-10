"use client";

import type { QuestionRunnerProps } from "./types";
import {
  getStoredQuestionIndex,
  subscribeStoredTestSession,
} from "./session";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import Question from "./QuestionRunner";
import { useSyncExternalStore } from "react";

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
  onEndTest,
}: QuestionRunnerProps) {
  const questionIndex = useSyncExternalStore(
    subscribeStoredTestSession,
    () => getStoredQuestionIndex() ?? 0,
    () => 0,
  );
  const displayQuestionIndex = Math.max(1, questionIndex);

  return (
    <div className="mx-auto my-auto max-w-2xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-semibold">
          Question {displayQuestionIndex}
        </h1>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip variant="bordered">
            {subjectId}
          </Chip>
          <Chip variant="bordered">
            {subcategoryId}
          </Chip>
          <Chip variant="bordered">
            {difficulty}
          </Chip>
        </div>
      </div>

      <Card shadow="sm">
        <CardBody className="p-6">
          <Question
            difficulty={difficulty}
            subcategoryId={subcategoryId}
            subjectId={subjectId}
          />
        </CardBody>
      </Card>
      <div className="flex justify-end">
        <Button
          aria-label="Quit test"
          onPress={onEndTest}
          size="sm"
          variant="light"
        >
          End Test
        </Button>
      </div>
    </div>
  );
}
