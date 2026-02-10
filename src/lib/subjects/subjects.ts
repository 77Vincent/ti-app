import {
  QUESTION_TYPES,
  SUBJECT_CATALOGS,
  type SubjectEntry,
} from "./types";

export const SUBJECT_CATALOG: SubjectEntry[] = [
  {
    id: SUBJECT_CATALOGS.LANGUAGE,
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
    id: SUBJECT_CATALOGS.MATH,
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
  {
    id: SUBJECT_CATALOGS.PHYSICS,
    label: "Physics",
    order: 3,
    subcategories: [
      {
        id: "mechanics",
        label: "Mechanics",
        order: 1,
        questionTypesAllowed: [QUESTION_TYPES.MULTIPLE_CHOICE],
      },
    ],
  },
  {
    id: SUBJECT_CATALOGS.CHEMISTRY,
    label: "Chemistry",
    order: 4,
    subcategories: [
      {
        id: "organic_chemistry",
        label: "Organic Chemistry",
        order: 1,
        questionTypesAllowed: [QUESTION_TYPES.MULTIPLE_CHOICE],
      },
    ],
  },
  {
    id: SUBJECT_CATALOGS.COMPUTER_SCIENCE,
    label: "Computer Science",
    order: 5,
    subcategories: [
      {
        id: "programming",
        label: "Programming",
        order: 1,
        questionTypesAllowed: [QUESTION_TYPES.MULTIPLE_CHOICE],
      },
    ],
  },
];


