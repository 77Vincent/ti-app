import type { TestParam } from "@/lib/testSession/validation";
import type {
  MultipleAnswerQuestion,
  MultipleChoiceQuestion,
  Question,
  QuestionOption,
  QuestionOptionId,
} from "@/lib/question/validation";

export type TestRunnerActions = {
  onEndTest: () => void;
};

export type {
  MultipleAnswerQuestion,
  MultipleChoiceQuestion,
  Question,
  QuestionOption,
  QuestionOptionId,
};

export type SignInDemand = "favorite" | "more_questions";
export type QuestionSignInDemand = Extract<SignInDemand, "more_questions">;

export type QuestionRunnerProps = TestParam &
  TestRunnerActions & {
    id: string;
    startedAtMs: number;
  };
