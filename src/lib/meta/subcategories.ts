import {
  QUESTION_TYPES,
  SUBJECT_CATALOGS,
  type SubcategoryEntry,
} from "./types";

export const SUBCATEGORY_CATALOG: SubcategoryEntry[] = [
  {
    id: "english",
    label: "English",
    subjectId: SUBJECT_CATALOGS.LANGUAGE,
    order: 1,
    questionTypesAllowed: [
      QUESTION_TYPES.MULTIPLE_CHOICE,
      QUESTION_TYPES.MULTIPLE_ANSWER,
    ],
  },
  {
    id: "algebra",
    label: "Algebra",
    subjectId: SUBJECT_CATALOGS.MATH,
    order: 1,
    questionTypesAllowed: [QUESTION_TYPES.MULTIPLE_CHOICE],
  },
  {
    id: "mechanics",
    label: "Mechanics",
    subjectId: SUBJECT_CATALOGS.PHYSICS,
    order: 1,
    questionTypesAllowed: [QUESTION_TYPES.MULTIPLE_CHOICE],
  },
  {
    id: "organic_chemistry",
    label: "Organic Chemistry",
    subjectId: SUBJECT_CATALOGS.CHEMISTRY,
    order: 1,
    questionTypesAllowed: [QUESTION_TYPES.MULTIPLE_CHOICE],
  },
  {
    id: "programming",
    label: "Programming",
    subjectId: SUBJECT_CATALOGS.COMPUTER_SCIENCE,
    order: 1,
    questionTypesAllowed: [QUESTION_TYPES.MULTIPLE_CHOICE],
  },
];
