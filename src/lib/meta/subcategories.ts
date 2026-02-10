import {
  QUESTION_TYPES,
} from "./questionTypes";
import type { QuestionType } from "./questionTypes";
import type { SubjectEnum } from "./subjects";

export type SubcategoryOption = {
  id: string;
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
];
