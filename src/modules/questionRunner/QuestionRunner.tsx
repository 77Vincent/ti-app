import {
  INFINITE_QUESTION_COUNT,
  INFINITE_TIME_LIMIT_MINUTES,
} from "@/modules/startForm/constants";
import type { QuestionRunnerProps } from "./types";
import QuestionSkeleton from "./QuestionSkeleton";
import Question from "./Question";

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
  questionCount,
  timeLimit,
  currentQuestion,
}: QuestionRunnerProps) {
  const isLoadingQuestion = !currentQuestion;

  return (
    <div className="my-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-semibold">Question 1</h1>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          {isLoadingQuestion ? <QuestionSkeleton /> : <Question />}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-end">
        <span className="badge badge-outline">{subjectId}</span>
        <span className="badge badge-outline">{subcategoryId}</span>
        <span className="badge badge-outline">{difficulty}</span>
        {
          questionCount === INFINITE_QUESTION_COUNT
            ? null
            : <span className="badge badge-outline ">{questionCount} Q</span>
        }
        {
          timeLimit === INFINITE_TIME_LIMIT_MINUTES
            ? null
            : <span className="badge badge-outline ">{timeLimit} min</span>
        }
      </div>
    </div>
  );
}
