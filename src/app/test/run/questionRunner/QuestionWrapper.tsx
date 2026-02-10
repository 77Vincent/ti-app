"use client";

import type { QuestionRunnerProps } from "./types";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import Question from "./QuestionRunner";

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
  onEndTest,
}: QuestionRunnerProps) {
  return (
    <div className="w-full max-w-2xl space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
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
