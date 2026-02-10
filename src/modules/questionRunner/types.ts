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

export type QuestionOption = {
  id: string;
  text: string;
};

type BaseQuestion = {
  id: string;
  prompt: string;
  questionType: QuestionType;
  options: QuestionOption[];
  explanation?: string;
};

export type MultipleChoiceQuestion = BaseQuestion & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_CHOICE;
  correctOptionId: string;
};

export type MultipleAnswerQuestion = BaseQuestion & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_ANSWER;
  correctOptionIds: string[];
};

export type Question = MultipleChoiceQuestion | MultipleAnswerQuestion;

export type QuestionRunnerProps = TestMeta & {
  currentQuestion?: Question | null;
};
