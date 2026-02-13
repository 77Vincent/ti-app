import {
  QUESTION_TYPES,
} from "./questionTypes";
import type { QuestionType } from "./questionTypes";
import type { SubjectEnum } from "./subjects";

export type SubcategoryEnum = "english" | "japanese";

export type SubcategoryOption = {
  id: SubcategoryEnum;
  label: string;
  subjectId: SubjectEnum;
  order: number;
  questionTypesAllowed: QuestionType[];
};

export const SUBCATEGORIES: SubcategoryOption[] = [
  {
    id: "english",
    label: "English",
    subjectId: "language",
    order: 1,
    questionTypesAllowed: [
      QUESTION_TYPES.MULTIPLE_CHOICE,
      QUESTION_TYPES.MULTIPLE_ANSWER,
    ],
  },
  {
    id: "japanese",
    label: "Japanese",
    subjectId: "language",
    order: 2,
    questionTypesAllowed: [
      QUESTION_TYPES.MULTIPLE_CHOICE,
      QUESTION_TYPES.MULTIPLE_ANSWER,
    ],
  },
];
