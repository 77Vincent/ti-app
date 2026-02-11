"use client";

import type { QuestionRunnerProps } from "./types";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { getDifficultyIcon, getSubjectIcon } from "@/lib/meta";
import { createElement } from "react";
import Question from "./QuestionRunner";

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
  onEndTest,
}: QuestionRunnerProps) {
  const SubjectIcon = getSubjectIcon(subjectId);
  const DifficultyIcon = getDifficultyIcon(difficulty);

  return (
    <div className="w-full max-w-2xl space-y-3">
      <Card shadow="sm">
        <CardBody className="p-6">
          <Question
            difficulty={difficulty}
            subcategoryId={subcategoryId}
            subjectId={subjectId}
          />
        </CardBody>
      </Card>

      <div className="flex justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip variant="bordered">
            <span className="inline-flex items-center gap-1.5">
              {SubjectIcon
                ? createElement(SubjectIcon, { "aria-hidden": true, size: 14 })
                : null}
              {subjectId}
            </span>
          </Chip>
          <Chip variant="bordered">
            {subcategoryId}
          </Chip>
          <Chip variant="bordered">
            <span className="inline-flex items-center gap-1.5">
              {DifficultyIcon
                ? createElement(DifficultyIcon, { "aria-hidden": true, size: 14 })
                : null}
              {difficulty}
            </span>
          </Chip>
        </div>

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
