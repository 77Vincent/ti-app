import { QUESTION_TYPES, type SubjectEntry } from "./types";

export const SUBJECT_CATALOG: SubjectEntry[] = [
  {
    id: "language",
    label: "Language",
    order: 1,
    subcategories: [
      {
        id: "english",
        label: "English",
        order: 1,
        questionTypesAllowed: [
          QUESTION_TYPES.MULTIPLE_CHOICE,
          QUESTION_TYPES.MULTIPLE_ANSWER,
        ],
      },
    ],
  },
  {
    id: "math",
    label: "Mathematics",
    order: 2,
    subcategories: [
      {
        id: "algebra",
        label: "Algebra",
        order: 1,
        questionTypesAllowed: [QUESTION_TYPES.MULTIPLE_CHOICE],
      },
    ],
  },
];
