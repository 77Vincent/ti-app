import type { QuestionRunnerProps } from "./types";
import Question from "./QuestionRunner";

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
}: QuestionRunnerProps) {
  return (
    <div className="my-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-semibold">Question 1</h1>
      </div>

      <div className="card card-border bg-base-100 shadow-sm">
        <div className="card-body">
          <Question
            difficulty={difficulty}
            subcategoryId={subcategoryId}
            subjectId={subjectId}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="badge badge-outline badge-sm">{subjectId}</span>
        <span className="badge badge-outline badge-sm">{subcategoryId}</span>
        <span className="badge badge-outline badge-sm">{difficulty}</span>
      </div>
    </div>
  );
}
