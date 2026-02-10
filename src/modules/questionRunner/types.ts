import { QUESTION_TYPES } from "@/lib/meta";
import type { DifficultyLevel, QuestionType } from "@/lib/meta";
import type {
  QuestionCountOption,
  TimeLimitOption,
} from "@/modules/startForm/constants";

export type TestMeta = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
  questionCount: QuestionCountOption;
  timeLimit: TimeLimitOption;
};

export type QuestionOptionId = "A" | "B" | "C" | "D" | "E" | "F";

export type QuestionOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

type BaseQuestion = {
  id: string;
  prompt: string;
  questionType: QuestionType;
  options: QuestionOption[];
  correctOptionIds: QuestionOptionId[];
};

export type MultipleChoiceQuestion = BaseQuestion & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_CHOICE;
};

export type MultipleAnswerQuestion = BaseQuestion & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_ANSWER;
};

export type Question = MultipleChoiceQuestion | MultipleAnswerQuestion;

export type QuestionRunnerProps = TestMeta;
