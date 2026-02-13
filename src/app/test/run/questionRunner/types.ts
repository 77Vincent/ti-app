import type { TestSession } from "@/lib/validation/testSession";
import type {
  MultipleAnswerQuestion,
  MultipleChoiceQuestion,
  Question,
  QuestionOption,
  QuestionOptionId,
} from "@/lib/validation/question";

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

export type QuestionRunnerProps = TestSession & TestRunnerActions;
