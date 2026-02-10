import type { DifficultyLevel } from "@/lib/meta";
import {
  INFINITE_QUESTION_COUNT,
  INFINITE_TIME_LIMIT_MINUTES,
} from "@/modules/startForm/constants";

type QuestionRunnerProps = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
  questionCount: number;
  timeLimit: number;
};

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
  questionCount,
  timeLimit,
}: QuestionRunnerProps) {
  const testMeta = [
    { label: "Subject", value: subjectId },
    { label: "Subcategory", value: subcategoryId },
    { label: "Difficulty", value: difficulty },
    {
      label: "Question count",
      value:
        questionCount === INFINITE_QUESTION_COUNT ? "Infinite" : String(questionCount),
    },
    {
      label: "Time limit",
      value: timeLimit === INFINITE_TIME_LIMIT_MINUTES ? "Infinite" : `${timeLimit} min`,
    },
  ];

  return (
    <div className="my-auto space-y-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body items-center text-center gap-2">
          <h1 className="text-2xl font-medium">Question 1</h1>
          <p className="text-base-content/70">
            Your test has started. The first question is being prepared.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {testMeta.map((meta) => (
          <span className="badge badge-outline" key={meta.label}>
            <span>{meta.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
