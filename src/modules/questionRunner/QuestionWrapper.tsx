import type { QuestionRunnerProps } from "./types";
import { Card, CardBody, Chip } from "@heroui/react";
import Question from "./QuestionRunner";

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
}: QuestionRunnerProps) {
  return (
    <div className="mx-auto my-auto max-w-2xl space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-semibold">Question 1</h1>
        <div className="flex flex-wrap gap-1.5">
          <Chip size="sm" variant="bordered">
            {subjectId}
          </Chip>
          <Chip size="sm" variant="bordered">
            {subcategoryId}
          </Chip>
          <Chip size="sm" variant="bordered">
            {difficulty}
          </Chip>
        </div>
      </div>

      <Card>
        <CardBody className="p-6">
          <Question
            difficulty={difficulty}
            subcategoryId={subcategoryId}
            subjectId={subjectId}
          />
        </CardBody>
      </Card>
    </div>
  );
}
